# 🚀 Guide Complet - SI Relevés avec Backend Compteurs & Relevés

## ⭐ NOUVELLES FONCTIONNALITÉS

### Backend Complet pour Compteurs et Relevés

L'admin (SUPERADMIN) peut maintenant:
- ✅ **Ajouter des compteurs** qui s'enregistrent en base de données
- ✅ **Ajouter des relevés** qui s'enregistrent en base de données
- ✅ **Modifier et supprimer** compteurs et relevés
- ✅ **Calcul automatique** de la consommation
- ✅ **Relations** entre compteurs, relevés et agents

## 📁 Fichiers Créés

### Backend
- `server/src/models/Compteur.js` - Modèle Sequelize compteur
- `server/src/models/Releve.js` - Modèle Sequelize relevé
- `server/src/controllers/compteur.controller.js` - CRUD compteurs
- `server/src/controllers/releve.controller.js` - CRUD relevés
- `server/src/routes/compteur.routes.js` - Routes API compteurs
- `server/src/routes/releve.routes.js` - Routes API relevés
- `server/src/server.js` - Routes enregistrées

### Frontend
- `client/src/api/compteurs.js` - Service API compteurs
- `client/src/api/releves.js` - Service API relevés

## 🗄️ Base de Données

### Table `compteurs`
```sql
CREATE TABLE compteurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_compteur VARCHAR(50) UNIQUE NOT NULL,
  type_fluide ENUM('EAU', 'ELEC') NOT NULL,
  adresse TEXT NOT NULL,
  quartier VARCHAR(100),
  ville VARCHAR(100) DEFAULT 'Rabat',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  date_installation DATE,
  active BOOLEAN DEFAULT true,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Table `releves`
```sql
CREATE TABLE releves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compteur_id VARCHAR(50) NOT NULL,
  agent_id INT NOT NULL,
  index_actuel DECIMAL(10,2) NOT NULL,
  index_precedent DECIMAL(10,2),
  consommation DECIMAL(10,2) NOT NULL,
  date_heure DATETIME NOT NULL,
  photo VARCHAR(255),
  anomalie BOOLEAN DEFAULT false,
  commentaire TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (compteur_id) REFERENCES compteurs(id_compteur),
  FOREIGN KEY (agent_id) REFERENCES users(id)
);
```

## 🔌 API Endpoints Disponibles

### Compteurs
```
GET    /api/compteurs                - Liste tous les compteurs
GET    /api/compteurs/stats          - Statistiques compteurs
GET    /api/compteurs/:id            - Détail d'un compteur
POST   /api/compteurs                - Créer compteur (SUPERADMIN)
PUT    /api/compteurs/:id            - Modifier compteur (SUPERADMIN)
DELETE /api/compteurs/:id            - Supprimer compteur (SUPERADMIN)
```

### Relevés
```
GET    /api/releves                  - Liste tous les relevés
GET    /api/releves/stats            - Statistiques relevés
GET    /api/releves/:id              - Détail d'un relevé
POST   /api/releves                  - Créer relevé (SUPERADMIN, AGENT)
PUT    /api/releves/:id              - Modifier relevé (SUPERADMIN)
DELETE /api/releves/:id              - Supprimer relevé (SUPERADMIN)
```

## 🎯 Comment Utiliser

### 1. Démarrer l'Application

```bash
# Redémarrer pour charger les nouveaux modèles
docker-compose restart backend

# Vérifier les logs
docker-compose logs -f backend
```

Le backend créera automatiquement les tables `compteurs` et `releves` au démarrage.

### 2. Ajouter un Compteur (SUPERADMIN)

**Via l'Interface:**
1. Connectez-vous avec `admin@ree.ma`
2. Menu: "Gestion Compteurs"
3. Bouton: "Ajouter un compteur"
4. Formulaire:
   - ID Compteur: `COMP-2024-001`
   - Type: `EAU` ou `ELEC`
   - Adresse: `15 Avenue Mohammed V, Rabat`
   - Quartier: `Agdal`
   - Ville: `Rabat` (défaut)

**Via API (exemple):**
```bash
curl -X POST http://localhost:5001/api/compteurs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_compteur": "COMP-2024-001",
    "type_fluide": "EAU",
    "adresse": "15 Avenue Mohammed V, Rabat",
    "quartier": "Agdal"
  }'
```

### 3. Ajouter un Relevé (SUPERADMIN)

**Via API (exemple):**
```bash
curl -X POST http://localhost:5001/api/releves \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "compteur_id": "COMP-2024-001",
    "agent_id": 1,
    "index_actuel": 1250.5,
    "date_heure": "2024-12-14T10:30:00",
    "anomalie": false,
    "commentaire": "Relevé normal"
  }'
```

La consommation sera calculée automatiquement:
- Si c'est le premier relevé: `consommation = 0`
- Sinon: `consommation = index_actuel - index_precedent`

### 4. Lister les Données

```bash
# Lister les compteurs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/compteurs

# Lister les relevés
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/releves

# Filtrer les relevés par compteur
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5001/api/releves?compteur_id=COMP-2024-001"

# Statistiques
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/compteurs/stats
```

## 📊 Flux de Données

### Ajout Compteur
```
Frontend (Admin) → POST /api/compteurs
                 ↓
Backend valide les données
                 ↓
Sequelize → MySQL (table compteurs)
                 ↓
Réponse JSON avec le compteur créé
                 ↓
Frontend affiche dans la liste
```

### Ajout Relevé
```
Frontend (Admin) → POST /api/releves
                 ↓
Backend récupère le dernier relevé du compteur
                 ↓
Calcule: consommation = index_actuel - index_precedent
                 ↓
Sequelize → MySQL (table releves)
                 ↓
Réponse JSON avec le relevé créé
                 ↓
Frontend affiche dans la liste
```

## 🔐 Permissions

| Action | USER | AGENT | SUPERADMIN |
|--------|------|-------|------------|
| **Compteurs** |
| Voir liste | ✅ | ❌ | ✅ |
| Voir détail | ✅ | ❌ | ✅ |
| Ajouter | ❌ | ❌ | ✅ |
| Modifier | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ |
| **Relevés** |
| Voir liste | ✅ | ❌ | ✅ |
| Voir détail | ✅ | ❌ | ✅ |
| Ajouter | ❌ | ✅ | ✅ |
| Modifier | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ |

## 🧪 Tests

### Vérifier les Tables Créées

```bash
docker exec -it si_releves_db mysql -uroot -prootpassword si_releves
```

```sql
SHOW TABLES;
-- Devrait afficher: users, compteurs, releves

DESCRIBE compteurs;
DESCRIBE releves;

-- Vérifier les données
SELECT * FROM compteurs;
SELECT * FROM releves;

-- Voir les relevés avec les infos du compteur
SELECT
  r.id,
  r.compteur_id,
  c.type_fluide,
  r.consommation,
  r.date_heure
FROM releves r
JOIN compteurs c ON r.compteur_id = c.id_compteur;
```

### Tester l'API

```bash
# Health check
curl http://localhost:5001/api/health

# Login pour obtenir un token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ree.ma","password":"Admin123"}'

# Utiliser le token dans les requêtes
TOKEN="votre_token_jwt"

# Tester compteurs
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/compteurs

# Tester relevés
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/releves
```

## 🐛 Dépannage

### Les tables ne sont pas créées

```bash
# Vérifier les logs backend
docker-compose logs backend

# Forcer la synchronisation
docker-compose restart backend
```

### Erreur 404 sur /api/compteurs

```bash
# Vérifier que les routes sont chargées
docker-compose logs backend | grep "compteurs"

# Redémarrer le backend
docker-compose restart backend
```

### Erreur Foreign Key

Si vous avez des erreurs de clés étrangères:

```sql
-- Se connecter à MySQL
docker exec -it si_releves_db mysql -uroot -prootpassword si_releves

-- Désactiver temporairement les contraintes
SET FOREIGN_KEY_CHECKS=0;

-- Supprimer les tables dans l'ordre
DROP TABLE IF EXISTS releves;
DROP TABLE IF EXISTS compteurs;

-- Réactiver les contraintes
SET FOREIGN_KEY_CHECKS=1;

-- Redémarrer le backend pour recréer les tables
```

## 📝 Prochaines Étapes

1. ✅ Backend compteurs et relevés → **TERMINÉ**
2. 🔄 Intégrer CompteurAdd.jsx avec l'API
3. 🔄 Intégrer page d'ajout de relevé
4. 🔄 Mettre à jour CompteursList pour charger depuis l'API
5. 🔄 Mettre à jour RelevesList pour charger depuis l'API

## 📖 Documentation Complète

- [START_HERE.md](START_HERE.md) - Démarrage rapide
- [RECAP_IMPLEMENTATION.md](RECAP_IMPLEMENTATION.md) - Récapitulatif
- [CHANGELOG_GESTION_ADMIN.md](CHANGELOG_GESTION_ADMIN.md) - Changelog admin

---

**Version**: 1.3.0
**Date**: 2025-12-14
**Statut**: Backend Compteurs & Relevés Implémenté ✅
