# 🚀 Guide de démarrage rapide - SI Relevés

## Prérequis
- Docker et Docker Compose installés
- Ports disponibles : 3000 (frontend), 5001 (backend), 3307 (MySQL), 8025 (MailHog)

## Démarrage en 3 étapes

### 1️⃣ Démarrer les conteneurs Docker

```bash
docker compose up -d
```

Attendez environ 10-15 secondes que MySQL soit complètement démarré.

### 2️⃣ Initialiser la base de données

```bash
chmod +x init_db.sh
./init_db.sh
```

Cela créera automatiquement 2 utilisateurs de test :
- **SUPERADMIN :** `admin@ree.ma` / `Admin123`
- **USER :** `user@ree.ma` / `User123`

### 3️⃣ Accéder à l'application

Ouvrez votre navigateur et allez sur :
- **Frontend :** http://localhost:3000
- **Backend API :** http://localhost:5001/api/health
- **MailHog UI :** http://localhost:8025

## 🔐 Se connecter

Utilisez l'un des comptes de test :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| SUPERADMIN | admin@ree.ma | Admin123 |
| USER | user@ree.ma | User123 |

### SUPERADMIN
- Accès complet à la gestion des utilisateurs
- Route : `/admin/users`

### USER
- Accès au dashboard et aux fonctionnalités utilisateur
- Routes : `/dashboard`, `/releves`, `/compteurs`, `/agents`, `/rapports`

## 📋 Commandes utiles

### Vérifier l'état des conteneurs
```bash
docker compose ps
```

### Voir les logs
```bash
# Tous les services
docker compose logs -f

# Backend seulement
docker logs si_releves_backend -f

# MySQL seulement
docker logs si_releves_mysql -f
```

### Arrêter les services
```bash
docker compose down
```

### Redémarrer les services
```bash
docker compose restart
```

### Réinitialiser complètement la base de données
```bash
docker exec si_releves_backend npm run seed:destroy
docker exec si_releves_backend npm run seed
```

## 🧪 Tester l'API

Exécutez le script de test automatique :

```bash
chmod +x test_api.sh
./test_api.sh
```

Ce script teste automatiquement :
1. Connexion Admin
2. Récupération du profil utilisateur
3. Gestion des rôles
4. Changement de mot de passe

## 🐛 Problèmes ?

Si vous rencontrez une erreur 401 ou d'autres problèmes, consultez le guide de dépannage :

```bash
chmod +x debug_auth.sh
./debug_auth.sh
```

Ou lisez le guide complet : [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📁 Structure du projet

```
SI_releves/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── api/        # Configuration Axios
│   │   ├── components/ # Composants réutilisables
│   │   ├── context/    # Context API (Auth)
│   │   ├── pages/      # Pages de l'application
│   │   └── App.jsx     # Routes principales
│   └── .env            # Variables d'environnement
│
├── server/             # Backend Node.js + Express
│   ├── src/
│   │   ├── config/     # Configuration (BD, etc.)
│   │   ├── controllers/# Logique métier
│   │   ├── middleware/ # Auth, validation
│   │   ├── models/     # Modèles Sequelize
│   │   ├── routes/     # Routes API
│   │   └── utils/      # Utilitaires (seed, etc.)
│   └── .env            # Variables d'environnement
│
├── docker-compose.yml  # Configuration Docker
├── init_db.sh         # Script d'initialisation BD
├── debug_auth.sh      # Script de diagnostic
└── test_api.sh        # Script de test API
```

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Authentification JWT avec expiration (30 minutes par défaut)
- Protection des routes par middleware d'authentification
- Vérification des rôles pour les routes sensibles

## 📝 Notes importantes

1. **Première connexion :** Assurez-vous d'avoir initialisé la base de données avec `./init_db.sh`
2. **Changement de mot de passe :** Disponible dans le profil utilisateur
3. **Hot Reload :** Les modifications du code sont automatiquement rechargées grâce aux volumes Docker
4. **Environnement de développement :** Les logs sont activés en mode développement

## 🎯 Prochaines étapes

Une fois connecté, vous pouvez :
- Explorer le dashboard (USER)
- Gérer les utilisateurs (SUPERADMIN)
- Tester le changement de mot de passe
- Consulter les emails de test dans MailHog (http://localhost:8025)

Bon développement ! 🚀
