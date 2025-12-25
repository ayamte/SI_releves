#!/usr/bin/env python3
"""
AIOps Analyzer - Analyse intelligente des logs SI Relevés
"From reactive to proactive"
"""

import os
import time
import json
import schedule
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from elasticsearch import Elasticsearch
from flask import Flask, jsonify
import numpy as np
import logging

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
ES_HOST = os.getenv('ELASTICSEARCH_HOST', 'localhost:9200')
KIBANA_HOST = os.getenv('KIBANA_HOST', 'localhost:5601')
ALERT_THRESHOLD_ERRORS = int(os.getenv('ALERT_THRESHOLD_ERRORS', 10))
ALERT_THRESHOLD_RESPONSE_TIME = int(os.getenv('ALERT_THRESHOLD_RESPONSE_TIME', 2000))
ANALYSIS_INTERVAL = int(os.getenv('ANALYSIS_INTERVAL', 60))

# Flask app pour exposer l'API
app = Flask(__name__)

# Connexion Elasticsearch
es = Elasticsearch([f'http://{ES_HOST}'])

# Stockage des anomalies détectées
detected_anomalies = []
error_patterns = {}
recommendations = []


class AIOpsAnalyzer:
    """Analyseur IA pour la détection d'anomalies"""

    def __init__(self):
        self.error_history = defaultdict(list)
        self.performance_history = []
        self.alert_cooldown = {}  # Évite les alertes en spam

    def analyze_logs(self, time_window_minutes=15):
        """Analyse les logs des dernières N minutes"""
        logger.info(f"🔍 Analyse des logs des {time_window_minutes} dernières minutes...")

        try:
            # Requête Elasticsearch
            query = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "range": {
                                    "@timestamp": {
                                        "gte": f"now-{time_window_minutes}m",
                                        "lte": "now"
                                    }
                                }
                            }
                        ],
                        "filter": [
                            {
                                "term": {
                                    "environment.keyword": "staging"
                                }
                            }
                        ]
                    }
                },
                "size": 1000,
                "sort": [{"@timestamp": {"order": "desc"}}]
            }

            # Exécuter la recherche
            results = es.search(index="si-releves-*", body=query)
            logs = results['hits']['hits']

            logger.info(f"📊 {len(logs)} logs récupérés")

            # Analyses
            self.detect_error_patterns(logs)
            self.detect_performance_anomalies(logs)
            self.detect_unusual_behavior(logs)
            self.generate_recommendations()

            return {
                "analyzed_logs": len(logs),
                "anomalies_detected": len(detected_anomalies),
                "recommendations": len(recommendations)
            }

        except Exception as e:
            logger.error(f"❌ Erreur lors de l'analyse: {e}")
            return {"error": str(e)}

    def detect_error_patterns(self, logs):
        """Détecte les patterns d'erreurs répétés"""
        global detected_anomalies, error_patterns

        error_logs = [log for log in logs if self._is_error(log)]

        if not error_logs:
            logger.info("✅ Aucune erreur détectée")
            return

        # Compter les erreurs par message
        error_messages = Counter()
        error_sources = defaultdict(list)

        for log in error_logs:
            source = log.get('_source', {})
            message = source.get('message', '')
            service = source.get('service', 'unknown')
            timestamp = source.get('@timestamp', '')

            # Normaliser le message (retirer les détails spécifiques)
            normalized_message = self._normalize_error_message(message)

            error_messages[normalized_message] += 1
            error_sources[normalized_message].append({
                'service': service,
                'timestamp': timestamp,
                'original_message': message
            })

        # Détecter les erreurs répétées (pattern suspect)
        for error_msg, count in error_messages.most_common(10):
            if count >= ALERT_THRESHOLD_ERRORS:
                # Toujours mettre à jour error_patterns pour les recommandations
                error_patterns[error_msg] = count

                anomaly = {
                    'type': 'repeated_error',
                    'severity': 'HIGH' if count > 20 else 'MEDIUM',
                    'message': error_msg,
                    'count': count,
                    'occurrences': error_sources[error_msg][:5],  # Premières 5
                    'detected_at': datetime.now().isoformat(),
                    'recommendation': self._get_error_recommendation(error_msg, count)
                }

                # Vérifier cooldown pour éviter spam dans detected_anomalies
                if not self._is_in_cooldown(error_msg):
                    detected_anomalies.append(anomaly)
                    self._set_cooldown(error_msg, minutes=30)

                    logger.warning(
                        f"⚠️ ANOMALIE DÉTECTÉE: Erreur répétée {count}x - {error_msg[:100]}"
                    )

    def detect_performance_anomalies(self, logs):
        """Détecte les anomalies de performance"""
        global detected_anomalies

        # Analyser les temps de réponse (logs frontend/nginx)
        response_times = []

        for log in logs:
            source = log.get('_source', {})
            service = source.get('service', '')

            # Logs Nginx avec temps de réponse
            if service == 'frontend' and 'response_time' in source:
                try:
                    rt = float(source['response_time'])
                    response_times.append({
                        'time': rt,
                        'timestamp': source.get('@timestamp'),
                        'path': source.get('request', 'unknown')
                    })
                except (ValueError, TypeError):
                    continue

        if len(response_times) < 10:
            return

        # Calculer les statistiques
        times = [rt['time'] for rt in response_times]
        mean_time = np.mean(times)
        std_time = np.std(times)
        max_time = np.max(times)

        logger.info(f"📈 Performance: moy={mean_time:.2f}ms, max={max_time:.2f}ms")

        # Détecter les anomalies (temps > moyenne + 2*écart-type)
        threshold = mean_time + (2 * std_time)
        slow_requests = [rt for rt in response_times if rt['time'] > threshold]

        if slow_requests and max_time > ALERT_THRESHOLD_RESPONSE_TIME:
            anomaly = {
                'type': 'performance_degradation',
                'severity': 'HIGH' if max_time > 5000 else 'MEDIUM',
                'message': f'Dégradation des performances détectée',
                'stats': {
                    'mean_response_time': round(mean_time, 2),
                    'max_response_time': round(max_time, 2),
                    'slow_requests_count': len(slow_requests),
                    'threshold': round(threshold, 2)
                },
                'slow_requests': slow_requests[:5],
                'detected_at': datetime.now().isoformat(),
                'recommendation': self._get_performance_recommendation(max_time, len(slow_requests))
            }

            if not self._is_in_cooldown('performance_degradation'):
                detected_anomalies.append(anomaly)
                self._set_cooldown('performance_degradation', minutes=15)

                logger.warning(
                    f"⚠️ ANOMALIE: Dégradation performance - Max: {max_time:.2f}ms"
                )

    def detect_unusual_behavior(self, logs):
        """Détecte les comportements inhabituels avec clustering"""
        global detected_anomalies

        # Analyser les patterns d'accès
        access_patterns = defaultdict(int)

        for log in logs:
            source = log.get('_source', {})
            service = source.get('service', '')

            if service == 'backend':
                # Extraire l'endpoint
                message = source.get('message', '')
                endpoint = self._extract_endpoint(message)

                if endpoint:
                    access_patterns[endpoint] += 1

        if not access_patterns:
            return

        # Détecter les endpoints avec trafic inhabituel
        counts = list(access_patterns.values())
        if len(counts) < 3:
            return

        mean_count = np.mean(counts)
        std_count = np.std(counts)

        # Endpoints avec trafic > moyenne + 3*écart-type (très inhabituel)
        unusual_endpoints = []
        for endpoint, count in access_patterns.items():
            if count > mean_count + (3 * std_count):
                unusual_endpoints.append({
                    'endpoint': endpoint,
                    'count': count,
                    'deviation': round((count - mean_count) / std_count, 2) if std_count > 0 else 0
                })

        if unusual_endpoints:
            anomaly = {
                'type': 'unusual_traffic',
                'severity': 'MEDIUM',
                'message': 'Trafic inhabituel détecté sur certains endpoints',
                'unusual_endpoints': unusual_endpoints[:5],
                'detected_at': datetime.now().isoformat(),
                'recommendation': self._get_traffic_recommendation(unusual_endpoints)
            }

            if not self._is_in_cooldown('unusual_traffic'):
                detected_anomalies.append(anomaly)
                self._set_cooldown('unusual_traffic', minutes=20)

                logger.info(f"ℹ️ Comportement inhabituel: {len(unusual_endpoints)} endpoints")

    def generate_recommendations(self):
        """Génère des recommandations basées sur les anomalies"""
        global recommendations

        recommendations.clear()

        # Analyse des patterns d'erreurs
        if error_patterns:
            top_errors = sorted(error_patterns.items(), key=lambda x: x[1], reverse=True)[:3]

            for error_msg, count in top_errors:
                if 'database' in error_msg.lower() or 'mysql' in error_msg.lower() or 'access denied' in error_msg.lower():
                    recommendations.append({
                        'priority': 'HIGH',
                        'category': 'Database',
                        'title': 'Problème de connexion base de données détecté',
                        'description': f'Erreur répétée {count}x concernant la base de données',
                        'actions': [
                            'Vérifier la connexion MySQL',
                            'Augmenter le pool de connexions',
                            'Vérifier les requêtes lentes',
                            'Redémarrer le service MySQL si nécessaire'
                        ]
                    })

                elif 'timeout' in error_msg.lower():
                    recommendations.append({
                        'priority': 'HIGH',
                        'category': 'Performance',
                        'title': 'Timeouts fréquents détectés',
                        'description': f'{count} timeouts détectés récemment',
                        'actions': [
                            'Augmenter les timeout configurations',
                            'Vérifier la charge du serveur',
                            'Optimiser les requêtes lentes',
                            'Scaler horizontalement si nécessaire'
                        ]
                    })

                elif 'auth' in error_msg.lower() or '401' in error_msg:
                    recommendations.append({
                        'priority': 'MEDIUM',
                        'category': 'Security',
                        'title': 'Échecs d\'authentification répétés',
                        'description': f'{count} tentatives échouées',
                        'actions': [
                            'Vérifier les logs de sécurité',
                            'Analyser les IPs sources',
                            'Activer le rate limiting',
                            'Considérer un blocage IP si attaque'
                        ]
                    })

        # Recommandations générales
        if len(detected_anomalies) > 10:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'System Health',
                'title': 'Nombre élevé d\'anomalies détectées',
                'description': f'{len(detected_anomalies)} anomalies en cours',
                'actions': [
                    'Investiguer immédiatement',
                    'Vérifier la santé globale du système',
                    'Consulter les dashboards Kibana',
                    'Contacter l\'équipe DevOps si nécessaire'
                ]
            })

    # Méthodes utilitaires

    def _is_error(self, log):
        """Vérifie si un log est une erreur"""
        source = log.get('_source', {})
        log_level = source.get('log_level', '').upper()
        tags = source.get('tags', [])

        return log_level == 'ERROR' or 'error' in tags

    def _normalize_error_message(self, message):
        """Normalise un message d'erreur pour détecter les patterns"""
        # Retirer les nombres, IDs, timestamps
        import re
        normalized = re.sub(r'\d+', 'N', message)
        normalized = re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'UUID', normalized)
        return normalized[:200]  # Limiter la longueur

    def _extract_endpoint(self, message):
        """Extrait l'endpoint d'un message de log"""
        import re
        # Pattern pour extraire les endpoints API
        match = re.search(r'(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^\s]+)', message)
        if match:
            return f"{match.group(1)} {match.group(2)}"
        return None

    def _is_in_cooldown(self, key):
        """Vérifie si une alerte est en cooldown"""
        if key not in self.alert_cooldown:
            return False

        cooldown_until = self.alert_cooldown[key]
        return datetime.now() < cooldown_until

    def _set_cooldown(self, key, minutes=30):
        """Active le cooldown pour une alerte"""
        self.alert_cooldown[key] = datetime.now() + timedelta(minutes=minutes)

    def _get_error_recommendation(self, error_msg, count):
        """Génère une recommandation pour une erreur"""
        if 'database' in error_msg.lower():
            return "Vérifier la connexion MySQL et le pool de connexions"
        elif 'timeout' in error_msg.lower():
            return "Augmenter les timeouts ou optimiser les requêtes"
        elif 'memory' in error_msg.lower():
            return "Vérifier l'utilisation mémoire et augmenter si nécessaire"
        else:
            return f"Investiguer l'erreur (répétée {count}x)"

    def _get_performance_recommendation(self, max_time, slow_count):
        """Génère une recommandation de performance"""
        if max_time > 5000:
            return "Performance critique: Optimiser immédiatement les requêtes lentes"
        elif max_time > 3000:
            return "Performance dégradée: Analyser et optimiser les endpoints lents"
        else:
            return "Surveiller la performance de près"

    def _get_traffic_recommendation(self, unusual_endpoints):
        """Génère une recommandation pour trafic inhabituel"""
        return f"Analyser le trafic inhabituel sur {len(unusual_endpoints)} endpoints - Possible attaque ou bug"


# Instance de l'analyseur
analyzer = AIOpsAnalyzer()


# API Flask

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'healthy', 'service': 'aiops-analyzer'})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Lance une analyse manuelle"""
    result = analyzer.analyze_logs()
    return jsonify(result)


@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    """Retourne les anomalies détectées"""
    return jsonify({
        'anomalies': detected_anomalies[-50:],  # Dernières 50
        'count': len(detected_anomalies)
    })


@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Retourne les recommandations"""
    return jsonify({
        'recommendations': recommendations,
        'count': len(recommendations)
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Retourne les statistiques globales"""
    return jsonify({
        'total_anomalies': len(detected_anomalies),
        'total_recommendations': len(recommendations),
        'error_patterns_count': len(error_patterns),
        'top_errors': sorted(error_patterns.items(), key=lambda x: x[1], reverse=True)[:5]
    })


# Tâches planifiées

def run_analysis():
    """Exécute l'analyse périodique"""
    logger.info("⏰ Lancement de l'analyse planifiée...")
    analyzer.analyze_logs(time_window_minutes=ANALYSIS_INTERVAL)


# Planifier l'analyse toutes les N secondes
schedule.every(ANALYSIS_INTERVAL).seconds.do(run_analysis)


def run_scheduler():
    """Exécute le scheduler"""
    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == '__main__':
    logger.info("🤖 Démarrage AIOps Analyzer...")
    logger.info(f"📊 Elasticsearch: {ES_HOST}")
    logger.info(f"⏱️ Intervalle d'analyse: {ANALYSIS_INTERVAL}s")

    # Vérifier la connexion Elasticsearch
    try:
        info = es.info()
        logger.info(f"✅ Connecté à Elasticsearch: {info['version']['number']}")
    except Exception as e:
        logger.error(f"❌ Erreur connexion Elasticsearch: {e}")

    # Lancer le scheduler dans un thread séparé
    import threading
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()

    # Lancer l'API Flask
    logger.info("🌐 Démarrage API Flask sur port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)
