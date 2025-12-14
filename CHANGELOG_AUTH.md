# 📝 Changelog - Authentification et Gestion des Rôles

## Date : 13 Décembre 2025

### 🎯 Objectif
Adapter le backend au frontend existant pour l'authentification et la gestion des rôles.

---

## ✅ Modifications Apportées

### 1. Backend - Authentification

#### ➕ Ajout de l'endpoint de changement de mot de passe

**Fichier :** `server/src/controllers/auth.controller.js`

```javascript
// Nouvelle fonction : changePassword (lignes 59-90)
export const changePassword = async (req, res) => {
    // Vérifie l'ancien mot de passe
    // Met à jour avec le nouveau mot de passe
    // Retourne success: true
}
```

**Fichier :** `server/src/routes/auth.routes.js`

```javascript
// Nouvelle route : PUT /api/auth/change-password
router.put('/change-password', protect, [...validations], changePassword);
```

#### 🔧 Amélioration des logs de débogage

**Fichier :** `server/src/controllers/auth.controller.js` (lignes 14-59)

Ajout de logs détaillés :
- 🔐 Tentative de connexion
- ✅ Utilisateur trouvé / ❌ Non trouvé
- 🔑 Validation du mot de passe
- ✅ Connexion réussie / ❌ Échec

#### 🌐 Configuration CORS améliorée

**Fichier :** `server/src/server.js` (lignes 13-26)

```javascript
// Avant
app.use(cors());

// Après
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// + Ajout de logs des requêtes en mode développement
```

---

### 2. Frontend - Correction du Bug de Connexion

#### 🐛 Correction du handleSubmit

**Fichier :** `client/src/pages/Login.jsx` (ligne 13)

```javascript
// ❌ Avant
const handleSubmit = (e) => {
    const result = login(email, password); // Pas d'await
    if (result.success) { ... }
}

// ✅ Après
const handleSubmit = async (e) => {
    const result = await login(email, password); // Avec await
    if (result.success) { ... }
}
```

**Impact :** Résout l'erreur 401 causée par l'appel asynchrone non attendu.

#### ⚙️ Configuration API avec variable d'environnement

**Fichier :** `client/.env` (nouveau)

```env
VITE_API_URL=http://localhost:5001/api
```

**Fichier :** `client/src/api/axios.js` (ligne 4)

```javascript
// Avant
baseURL: 'http://localhost:5001/api',

// Après
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
```

#### ✅ Mise à jour d'AuthContext

**Fichier :** `client/src/context/AuthContext.jsx` (lignes 47-57)

```javascript
// ❌ Avant
const changePassword = async (oldPassword, newPassword) => {
    console.log("Change password not yet implemented on backend");
    return { success: true };
};

// ✅ Après
const changePassword = async (oldPassword, newPassword) => {
    try {
        await api.put('/auth/change-password', { oldPassword, newPassword });
        return { success: true, message: 'Mot de passe modifié avec succès' };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Erreur...'
        };
    }
};
```

---

### 3. Scripts et Outils de Diagnostic

#### ➕ Scripts Créés

| Script | Description |
|--------|-------------|
| `init_db.sh` | Initialise rapidement la base de données avec les utilisateurs de test |
| `check_all.sh` | Diagnostic complet de tous les services (7 vérifications) |
| `debug_auth.sh` | Diagnostic spécifique à l'authentification |
| `test_api.sh` | Test complet de l'API (6 tests incluant changement de mot de passe) |

#### 📄 Documentation Créée

| Fichier | Description |
|---------|-------------|
| `START_HERE.md` | Guide rapide de démarrage et résolution du problème 401 |
| `FIX_AUTH.md` | Guide complet de résolution des problèmes d'authentification |
| `QUICK_START.md` | Guide de démarrage détaillé du projet |
| `TROUBLESHOOTING.md` | Guide de dépannage avec solutions aux problèmes courants |
| `CHANGELOG_AUTH.md` | Ce fichier - historique des modifications |

---

### 4. Configuration

#### ➕ package.json - Backend

**Fichier :** `server/package.json` (lignes 11-12)

```json
{
  "scripts": {
    "seed": "node src/utils/seed.js",
    "seed:destroy": "node src/utils/seed.js -d"
  }
}
```

---

## 🔐 Sécurité

### Mesures Implémentées

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ JWT avec expiration (30 minutes)
- ✅ Validation des entrées (express-validator)
- ✅ Middleware de protection des routes (`protect`)
- ✅ Middleware d'autorisation par rôle (`authorize`)
- ✅ Vérification du statut actif de l'utilisateur
- ✅ CORS configuré avec origines autorisées

---

## 🧪 Tests

### Endpoints Testés

✅ **POST** `/api/auth/login`
- Test avec SUPERADMIN
- Test avec USER
- Test avec mauvais identifiants

✅ **GET** `/api/auth/me`
- Récupération du profil avec token valide

✅ **PUT** `/api/auth/change-password`
- Changement de mot de passe
- Connexion avec nouveau mot de passe
- Restauration de l'ancien mot de passe

✅ **GET** `/api/users`
- Accès avec SUPERADMIN (autorisé)
- Accès avec USER (refusé - 403)

---

## 📊 Rôles et Permissions

### Structure des Rôles

| Rôle | Accès | Routes Autorisées |
|------|-------|-------------------|
| **SUPERADMIN** | Complet | Toutes les routes + gestion utilisateurs |
| **ADMIN** | Étendu | À définir (prévu pour gestion compteurs/agents) |
| **USER** | Standard | Dashboard, relevés, compteurs assignés |

### Routes Protégées

| Route | Middleware | Rôles Requis |
|-------|------------|--------------|
| `POST /api/auth/login` | - | Public |
| `GET /api/auth/me` | `protect` | Tous |
| `PUT /api/auth/change-password` | `protect` | Tous |
| `GET /api/users` | `protect` + `authorize` | ADMIN, SUPERADMIN |
| `POST /api/users` | `protect` + `authorize` | ADMIN, SUPERADMIN |
| `PUT /api/users/:id` | `protect` + `authorize` | ADMIN, SUPERADMIN |
| `DELETE /api/users/:id` | `protect` + `authorize` | ADMIN, SUPERADMIN |

---

## 🗄️ Base de Données

### Modèle User

```javascript
{
  id: INTEGER (PK, Auto-increment)
  nom: STRING (required)
  prenom: STRING (required)
  email: STRING (required, unique, email validation)
  password: STRING (required, hashed)
  role: ENUM('SUPERADMIN', 'ADMIN', 'USER') (default: USER)
  active: BOOLEAN (default: true)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Données de Seed

```javascript
// SUPERADMIN
{
  nom: 'ADMIN',
  prenom: 'System',
  email: 'admin@ree.ma',
  password: 'Admin123', // Hashé automatiquement
  role: 'SUPERADMIN'
}

// USER
{
  nom: 'BENNANI',
  prenom: 'Ahmed',
  email: 'user@ree.ma',
  password: 'User123', // Hashé automatiquement
  role: 'USER'
}
```

---

## 🔄 Flux d'Authentification

### 1. Connexion

```
Client                    Backend                   Database
  |                         |                          |
  |-- POST /auth/login ---->|                          |
  |   {email, password}     |                          |
  |                         |--- findOne(email) ------>|
  |                         |<---- User -------- ------|
  |                         |                          |
  |                         |-- validatePassword ----->|
  |                         |<---- true/false ---------|
  |                         |                          |
  |                         |-- generateToken(id) ---->|
  |<-- {user, token} -------|                          |
  |                         |                          |
  |-- Stocke token -------->|                          |
  |   (localStorage)        |                          |
```

### 2. Requêtes Protégées

```
Client                    Backend                   Database
  |                         |                          |
  |-- GET /auth/me -------->|                          |
  |   Header: Bearer token  |                          |
  |                         |                          |
  |                         |-- verify(token) -------->|
  |                         |<---- decoded ------------|
  |                         |                          |
  |                         |-- findByPk(id) --------->|
  |                         |<---- User ---------------|
  |                         |                          |
  |<-- {user} --------------|                          |
```

---

## 🚀 Prochaines Étapes (Non Implémentées)

- [ ] Gestion des compteurs (CRUD)
- [ ] Gestion des agents de relevé
- [ ] Enregistrement des relevés
- [ ] Dashboard avec statistiques
- [ ] Génération de rapports
- [ ] Export de données (PDF/Excel)
- [ ] Notifications par email
- [ ] Récupération de mot de passe oublié
- [ ] Logs d'activité utilisateur
- [ ] API rate limiting

---

## 📌 Notes Importantes

### Pour le Développement
- Les logs détaillés sont activés en mode `development`
- Hot reload fonctionne pour le frontend et backend via Docker volumes
- MailHog capture tous les emails envoyés (http://localhost:8025)

### Pour la Production
⚠️ **À MODIFIER AVANT LA PRODUCTION :**
1. Changer `JWT_SECRET` dans `server/.env`
2. Désactiver les logs détaillés
3. Configurer un serveur SMTP réel
4. Utiliser HTTPS
5. Configurer des sauvegardes MySQL
6. Ajouter rate limiting sur les endpoints sensibles
7. Changer les mots de passe par défaut

---

## 🐛 Bugs Corrigés

### Bug #1 : Erreur 401 à la Connexion
**Cause :** La fonction `login` dans `AuthContext` est asynchrone mais n'était pas attendue dans `Login.jsx`

**Solution :** Ajout de `async/await` dans `handleSubmit`

**Fichiers modifiés :** `client/src/pages/Login.jsx`

### Bug #2 : Changement de Mot de Passe Non Fonctionnel
**Cause :** L'endpoint backend n'existait pas

**Solution :** Création de l'endpoint `PUT /api/auth/change-password` avec validation

**Fichiers modifiés :**
- `server/src/controllers/auth.controller.js`
- `server/src/routes/auth.routes.js`
- `client/src/context/AuthContext.jsx`

---

## 📦 Dépendances Utilisées

### Backend
- `express` - Framework web
- `sequelize` - ORM
- `mysql2` - Driver MySQL
- `bcryptjs` - Hashage de mots de passe
- `jsonwebtoken` - Génération/vérification JWT
- `express-validator` - Validation des entrées
- `cors` - Gestion CORS
- `dotenv` - Variables d'environnement

### Frontend
- `react` - Framework UI
- `react-router-dom` - Routing
- `axios` - Client HTTP
- `lucide-react` - Icônes

---

**Auteur :** Claude (Assistant IA)
**Date :** 13 Décembre 2025
**Version :** 1.0.0 - Authentification & Rôles
