# SI Relevés - Système de Gestion des Relevés de Compteurs

Application web complète pour la gestion des relevés de compteurs d'eau et d'électricité pour Rabat Energie & Eau (REE).

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Sequelize
- **Base de données**: MySQL 8.0
- **Monitoring**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **AIOps**: Analyse intelligente des logs avec IA
- **CI/CD**: Jenkins
- **Conteneurisation**: Docker + Docker Compose

## 📋 Prérequis

- Docker Desktop installé et en cours d'exécution
- Git (optionnel)

## 🚀 Démarrage Rapide

### 1. Cloner le projet
```bash
git clone <repository-url>
cd SI_releves
```

### 2. Lancer l'application
```bash
docker-compose up -d
```

### 3. Accéder aux services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur |
| **Backend API** | http://localhost:5001 | API REST |
| **MailHog** | http://localhost:8025 | Test des emails |
| **MySQL** | localhost:3307 | Base de données |

## 📁 Structure du Projet

```
SI_releves/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   └── services/     # Services API
│   └── Dockerfile
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── models/       # Modèles Sequelize
│   │   ├── routes/       # Routes API
│   │   ├── controllers/  # Logique métier
│   │   └── middleware/   # Middleware
│   └── Dockerfile
├── database/              # Scripts SQL
├── nginx/                 # Configuration Nginx
├── elk/                   # Configuration ELK Stack
│   ├── elasticsearch/
│   ├── logstash/
│   ├── kibana/
│   ├── filebeat/
│   └── metricbeat/
├── aiops/                 # AIOps - IA pour les opérations
│   ├── analyzer.py       # Analyseur IA
│   └── dashboard/        # Dashboard AIOps
├── scripts/              # Scripts utilitaires
├── docker-compose.yml    # Environnement développement
├── docker-compose.staging.yml  # Environnement staging
├── docker-compose.elk.yml      # Stack ELK
├── docker-compose.aiops.yml    # Services AIOps
└── Jenkinsfile           # Pipeline CI/CD
```

## 🔑 Compte par Défaut

Lors de la première connexion, un compte admin est créé :
- **Email**: admin@ree.ma
- **Mot de passe**: (configuré lors du premier démarrage)

## 🛠️ Environnements

### Développement
```bash
docker-compose up -d
```

### Staging (avec monitoring ELK + AIOps)
```bash
# 1. Lancer l'application en staging
docker-compose -f docker-compose.staging.yml up -d

# 2. Lancer le monitoring ELK
docker-compose -f docker-compose.elk.yml up -d

# 3. Lancer l'AIOps
docker-compose -f docker-compose.aiops.yml up -d
```

**Accès Staging + Monitoring** :
| Service | URL |
|---------|-----|
| Frontend Staging | http://localhost:3000 |
| Backend Staging | http://localhost:5001 |
| Kibana (Logs) | http://localhost:5601 |
| AIOps Dashboard | http://localhost:8080 |
| AIOps API | http://localhost:5005 |

## 📊 Fonctionnalités

### Application Principale
- ✅ Authentification JWT avec gestion des rôles
- ✅ Gestion des utilisateurs backoffice
- ✅ Gestion des compteurs (Eau/Électricité)
- ✅ Affectation des agents aux quartiers
- ✅ Réception et calcul automatique des relevés
- ✅ Tableaux de bord et KPIs
- ✅ Export de rapports PDF

### Monitoring & AIOps
- ✅ Collecte des logs avec ELK Stack
- ✅ Visualisation Kibana
- ✅ Détection automatique des erreurs répétées
- ✅ Analyse des anomalies de performance
- ✅ Détection de comportements inhabituels (ML)
- ✅ Recommandations intelligentes

### CI/CD
- ✅ Pipeline Jenkins automatisé
- ✅ Tests unitaires automatiques
- ✅ Déploiement staging
- ✅ Analyse de qualité du code

## 🤖 AIOps - Intelligence Artificielle

Le système AIOps analyse automatiquement les logs et détecte :

1. **Erreurs répétées** : Détection de patterns d'erreurs (seuil : 10 occurrences)
2. **Anomalies de performance** : Analyse statistique (moyenne + 2σ)
3. **Comportements inhabituels** : Clustering DBSCAN pour détecter le trafic anormal
4. **Recommandations** : Actions correctives intelligentes et priorisées

**Analyse automatique** : Toutes les 60 secondes
**Accès** : http://localhost:8080

## 🧪 Tests

### Lancer les tests unitaires
```bash
cd server
npm test
```

### Coverage
```bash
npm run test:coverage
```

## 🔧 Commandes Utiles

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
```

### Redémarrer
```bash
docker-compose restart
```

### Arrêter
```bash
docker-compose down
```

### Nettoyer complètement
```bash
docker-compose down -v
```

### Accéder à la base de données
```bash
docker exec -it si_releves_mysql mysql -u root -p
# Mot de passe: root_password
```

## 📈 Monitoring

### Kibana - Visualisation des logs
1. Accéder à http://localhost:5601
2. Créer un index pattern : `si-releves-*`
3. Visualiser les logs en temps réel

### AIOps Dashboard
1. Accéder à http://localhost:8080
2. Voir les anomalies détectées
3. Consulter les recommandations

## 🔐 Variables d'Environnement

### Backend (.env)
```env
DB_HOST=mysql
DB_USER=si_releves_user
DB_PASSWORD=secure_password
DB_NAME=si_releves_db
JWT_SECRET=your_jwt_secret_key
```

### AIOps (.env.aiops - optionnel)
```env
ALERT_THRESHOLD_ERRORS=10
ALERT_THRESHOLD_RESPONSE_TIME=2000
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_RECIPIENTS=ops@ree.ma
```

## 🚨 Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
docker-compose logs

# Reconstruire les images
docker-compose up --build
```

### Erreur de connexion à la base de données
```bash
# Vérifier que MySQL est démarré
docker-compose ps

# Vérifier les logs MySQL
docker-compose logs mysql
```

### Ports déjà utilisés
Modifier les ports dans `docker-compose.yml` si nécessaire.

## 📚 Documentation Technique

- Architecture système : Voir `/database/init.sql` pour le schéma de base de données
- API REST : Endpoints documentés dans `/server/src/routes/`
- Configuration ELK : `/elk/` contient toutes les configurations
- AIOps : Code source dans `/aiops/`

## 🤝 Contribution

Ce projet a été développé pour Rabat Energie & Eau (REE).

## 📄 License

Propriété de Rabat Energie & Eau (REE)

---

**Version** : 2.0
**Dernière mise à jour** : Décembre 2025
**Mindset AIOps** : "From reactive to proactive" 🤖
