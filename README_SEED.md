# 🌱 Initialisation des données par défaut

Ce guide explique comment initialiser la base de données avec des données d'exemple pour l'application SI_Relevés.

## 📋 Données créées

Le script `seedData.js` crée automatiquement :

### 👥 Utilisateurs (6)

| Rôle | Nom | Email | Mot de passe |
|------|-----|-------|--------------|
| SUPERADMIN | ADMIN Super | admin@ree.ma | password123 |
| AGENT | AGENT Releveur | agent@ree.ma | password123 |
| USER (Client) | ALAMI Mohamed | mohamed.alami@gmail.com | password123 |
| USER (Client) | BENNANI Fatima | fatima.bennani@gmail.com | password123 |
| USER (Client) | TAZI Ahmed | ahmed.tazi@gmail.com | password123 |
| USER (Client) | IDRISSI Karim | karim.idrissi@gmail.com | password123 |

### 🔌 Compteurs (7)

- **Mohamed ALAMI** : 2 compteurs (EAU + ELEC) - Agdal
- **Fatima BENNANI** : 2 compteurs (EAU + ELEC) - Hassan
- **Ahmed TAZI** : 2 compteurs (EAU + ELEC) - Souissi
- **Karim IDRISSI** : 1 compteur (EAU) - Océan

Tous les compteurs ont des IDs auto-générés : COMP-2025-001, COMP-2025-002, etc.

### 📊 Relevés (5)

Relevés effectués par l'agent avec :
- Index actuels et précédents
- Consommations calculées
- Coordonnées GPS
- Dates de relevés en janvier 2025
- 1 relevé avec anomalie (consommation élevée)

## 🚀 Comment initialiser les données

### Méthode 1 : Avec Docker (Recommandé)

```bash
# Dans le répertoire racine du projet
docker exec -i si_releves_backend node seedData.js
```

### Méthode 2 : Sans Docker

```bash
cd server
node seedData.js
```

## ⚠️ Important

- Le script vérifie les doublons d'email. Si les utilisateurs existent déjà, il échouera.
- Pour réinitialiser complètement, videz d'abord la table users :

```bash
docker exec -i si_releves_mysql mysql -uroot -proot_password si_releves -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE users; TRUNCATE TABLE compteurs; TRUNCATE TABLE releves; SET FOREIGN_KEY_CHECKS=1;"
```

Puis relancez le script seed.

## 🔐 Connexion après seed

Utilisez ces identifiants pour vous connecter :

- **SUPERADMIN** : admin@ree.ma / password123
- **AGENT** : agent@ree.ma / password123
- **CLIENT** : mohamed.alami@gmail.com / password123

## 📝 Notes pour l'équipe

- Ces données sont créées automatiquement pour faciliter les tests
- Tous les membres de l'équipe peuvent utiliser ces mêmes identifiants
- Le mot de passe `password123` est identique pour tous les comptes de test
- Les coordonnées GPS sont réelles (Rabat, Maroc)
- Les clients (USER) ne voient que leurs propres compteurs
- Les SUPERADMIN et AGENT voient tous les compteurs
