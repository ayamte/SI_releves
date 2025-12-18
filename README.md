# SI Relevés - Système de Gestion des Relevés de Compteur

Application web pour la gestion des relevés de compteurs d'eau et d'électricité pour Rabat Energie & Eau (REE).

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Sequelize
- **Base de données**: MySQL 8.0
- **Email Testing**: MailHog
- **Conteneurisation**: Docker + Docker Compose

## 📋 Prérequis

- Docker Desktop installé et en cours d'exécution
- Git (optionnel)

## 🚀 Démarrage Rapide

### 1. Cloner le projet (si applicable)
```bash
git clone <repository-url>
cd SI_Releves
```

### 2. Créer le fichier `.env` pour le backend
```bash
cd server
cp .env.example .env
cd ..
```

### 3. Lancer l'application avec Docker Compose
```bash
docker-compose up --build
```

### 4. Accéder aux services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MailHog (Email testing)**: http://localhost:8025
- **MySQL**: localhost:3306

## 📁 Structure du Projet

```
SI_Releves/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   ├── App.jsx       # Composant principal
│   │   └── main.jsx      # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── config/       # Configuration (DB, JWT, etc.)
│   │   ├── models/       # Modèles Sequelize
│   │   ├── routes/       # Routes API
│   │   ├── controllers/  # Logique métier
│   │   ├── middleware/   # Middleware (auth, validation)
│   │   └── server.js     # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql          # Script d'initialisation MySQL
├── docker-compose.yml    # Orchestration des services
└── README.md
```

## 🔑 Compte par Défaut

- **Email**: admin@ree.ma
- **Mot de passe**: À générer lors de la première connexion

## 🛠️ Commandes Utiles

### Arrêter les conteneurs
```bash
docker-compose down
```

### Reconstruire les images
```bash
docker-compose up --build
```

### Voir les logs
```bash
docker-compose logs -f
```

### Accéder à la base de données
```bash
docker exec -it si_releves_mysql mysql -u root -p
# Mot de passe: root_password
```

## 📊 Fonctionnalités Principales

- ✅ Authentification JWT avec gestion des rôles (USER/SUPERADMIN)
- ✅ Gestion des utilisateurs backoffice
- ✅ Gestion des compteurs (Eau/Électricité)
- ✅ Affectation des agents aux quartiers
- ✅ Réception et calcul automatique des relevés
- ✅ Tableaux de bord et KPIs
- ✅ Export de rapports PDF
- ✅ Simulation des flux ERP (batch import)

## 🤖 Intégration IA

Ce projet utilise l'IA à différentes étapes :
- Génération de code assistée par IA
- Génération de tests unitaires
- Génération de données de test réalistes
- Analyse et optimisation du code

## 📝 Développement

### Backend (Node.js)
```bash
cd server
npm install
npm run dev
```

### Frontend (React)
```bash
cd client
npm install
npm run dev
```

## 🧪 Tests

```bash
cd server
npm test
```

## 📄 License

Propriété de Rabat Energie & Eau (REE)
