# 👥 Guide pour l'équipe - SI Relevés

## 🚀 Démarrage rapide

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd SI_releves
```

### 2. Démarrer l'application avec Docker
```bash
docker-compose up -d
```

### 3. Initialiser les données par défaut
```bash
docker exec -i si_releves_backend node seedData.js
```

### 4. Accéder à l'application
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001
- **MailHog** : http://localhost:8025

## 🔐 Comptes de test

Utilisez ces identifiants pour vous connecter :

### SUPERADMIN (Gestion complète)
- **Email** : admin@ree.ma
- **Mot de passe** : password123
- **Accès** : Utilisateurs, Compteurs, Relevés (CRUD complet)

### AGENT (Releveur terrain)
- **Email** : agent@ree.ma
- **Mot de passe** : password123
- **Accès** : Création de relevés, consultation

### CLIENT (Utilisateur final - role USER)
- **Email** : mohamed.alami@gmail.com
- **Mot de passe** : password123
- **Accès** : Ses compteurs uniquement (2 compteurs : EAU + ELEC à Agdal)

**Autres clients disponibles** :
- fatima.bennani@gmail.com / password123 (2 compteurs à Hassan)
- ahmed.tazi@gmail.com / password123 (2 compteurs à Souissi)
- karim.idrissi@gmail.com / password123 (1 compteur à Océan)

## 📊 Structure des données

### Utilisateurs
- **SUPERADMIN** : Gestion complète (1 compte)
- **AGENT** : Releveurs terrain (1 compte)
- **USER** : Clients/Abonnés (4 comptes avec compteurs)

### Compteurs
- **7 compteurs** créés par défaut
- IDs auto-générés : COMP-2025-001, COMP-2025-002, etc.
- Chaque client a 1-2 compteurs (EAU et/ou ELEC)

### Relevés
- **5 relevés** d'exemple
- Effectués par l'agent
- Avec coordonnées GPS
- 1 relevé avec anomalie

## 🔄 Réinitialiser les données

Si vous avez modifié les données et voulez revenir à l'état initial :

```bash
# 1. Vider les tables
docker exec -i si_releves_mysql mysql -uroot -proot_password si_releves -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE users; TRUNCATE TABLE compteurs; TRUNCATE TABLE releves; SET FOREIGN_KEY_CHECKS=1;"

# 2. Recréer les données par défaut
docker exec -i si_releves_backend node seedData.js
```

## 🎯 Fonctionnalités principales

### Pour SUPERADMIN
1. **Gestion Utilisateurs** : Créer des employés REE et des clients
2. **Gestion Compteurs** : Créer des compteurs pour les clients (IDs auto-générés)
3. **Gestion Relevés** : Créer et gérer les relevés

### Pour AGENT
1. **Créer des relevés** terrain avec GPS
2. **Signaler des anomalies**
3. **Consulter l'historique**

### Pour USER (Client)
1. **Voir ses compteurs** uniquement
2. **Consulter ses relevés**
3. **Voir sa consommation**

## 📝 Points importants

### Filtrage automatique pour les clients
- Les clients (role USER) ne voient **QUE** leurs propres compteurs
- Les SUPERADMIN et AGENT voient **TOUS** les compteurs
- Implémenté côté backend automatiquement

### Auto-génération des IDs
- Les IDs de compteurs sont générés automatiquement
- Format : COMP-ANNEE-XXX (ex: COMP-2025-001)
- Incrémentation automatique par année

### Relations
- Un utilisateur (USER) peut avoir plusieurs compteurs
- Un compteur appartient à un seul utilisateur
- Un relevé est lié à un compteur et un agent

## 🛠️ Développement

### Commandes utiles

```bash
# Voir les logs du backend
docker-compose logs backend -f

# Voir les logs du frontend
docker-compose logs frontend -f

# Redémarrer un service
docker-compose restart backend

# Accéder au MySQL
docker exec -it si_releves_mysql mysql -uroot -proot_password si_releves
```

### Structure du projet

```
SI_releves/
├── client/          # Frontend React + Vite
├── server/          # Backend Node.js + Express
│   ├── src/
│   │   ├── models/      # Modèles Sequelize
│   │   ├── controllers/ # Logique métier
│   │   ├── routes/      # Routes API
│   │   └── middleware/  # Auth, validation
│   └── seedData.js      # Script d'initialisation
└── docker-compose.yml
```

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt
- JWT pour l'authentification
- Protection des routes par rôle
- Validation des données côté backend

## 📧 Support

Pour toute question, contactez l'équipe de développement.

---

**Bon développement ! 🚀**
