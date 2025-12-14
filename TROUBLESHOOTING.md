# Guide de dépannage - Erreur 401 lors de la connexion

## Problème
Erreur 401 (Unauthorized) lors de la tentative de connexion avec `admin@ree.ma` ou `user@ree.ma`.

## Solutions

### 🔍 Étape 1 : Diagnostic automatique

Exécutez le script de diagnostic :

```bash
chmod +x debug_auth.sh
./debug_auth.sh
```

Ce script vérifie :
- ✅ Les conteneurs Docker sont actifs
- ✅ Le backend répond correctement
- ✅ La connexion à la base de données
- ✅ L'existence des utilisateurs
- ✅ Le test de connexion

### 🔧 Étape 2 : Initialiser la base de données

Si la base de données est vide ou les utilisateurs n'existent pas :

```bash
chmod +x init_db.sh
./init_db.sh
```

Ou manuellement :

```bash
docker exec si_releves_backend npm run seed
```

### 🔄 Étape 3 : Redémarrer les services

Si le problème persiste, redémarrez les conteneurs :

```bash
docker compose down
docker compose up -d
```

Attendez quelques secondes que MySQL soit prêt, puis initialisez la base de données :

```bash
./init_db.sh
```

### 📋 Étape 4 : Vérifier les logs

**Logs du backend :**
```bash
docker logs si_releves_backend
```

**Logs de MySQL :**
```bash
docker logs si_releves_mysql
```

### 🧪 Étape 5 : Tester l'API manuellement

```bash
# Test de santé
curl http://localhost:5001/api/health

# Test de connexion
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ree.ma","password":"Admin123"}'
```

### 🗄️ Étape 6 : Vérifier directement dans la base de données

Connectez-vous à MySQL :

```bash
docker exec -it si_releves_mysql mysql -uroot -proot_password
```

Puis vérifiez les utilisateurs :

```sql
USE si_releves;
SELECT id, nom, prenom, email, role, active FROM users;
```

Vous devriez voir :
- `admin@ree.ma` avec le rôle `SUPERADMIN`
- `user@ree.ma` avec le rôle `USER`

Si les utilisateurs n'existent pas, sortez de MySQL (`exit`) et exécutez :

```bash
docker exec si_releves_backend npm run seed
```

### 🌐 Étape 7 : Vérifier la configuration du frontend

Le frontend doit pointer vers le bon backend. Vérifiez le fichier `.env` :

```bash
cat client/.env
```

Il devrait contenir :
```
VITE_API_URL=http://localhost:5001/api
```

**Important :** Après avoir modifié `.env`, redémarrez le conteneur frontend :

```bash
docker compose restart frontend
```

Ou si vous exécutez en local :

```bash
cd client
npm run dev
```

### 🔑 Comptes de test

Une fois la base de données initialisée :

- **SUPERADMIN :** `admin@ree.ma` / `Admin123`
- **USER :** `user@ree.ma` / `User123`

## Causes communes

### 1. Base de données non initialisée
**Symptôme :** Erreur "Email ou mot de passe incorrect"
**Solution :** Exécutez `./init_db.sh`

### 2. Conteneur backend non démarré
**Symptôme :** "Failed to fetch" ou timeout
**Solution :** `docker compose up -d`

### 3. Problème de CORS
**Symptôme :** Erreur CORS dans la console du navigateur
**Solution :** Vérifiez que le backend utilise `cors()` middleware (déjà configuré dans `server.js`)

### 4. Cache du navigateur
**Symptôme :** Anciennes erreurs persistent
**Solution :** Videz le cache du navigateur ou utilisez le mode incognito

### 5. Port déjà utilisé
**Symptôme :** Le conteneur ne démarre pas
**Solution :** Vérifiez qu'aucun autre service n'utilise les ports 3000, 5001, ou 3307

```bash
lsof -i :5001
lsof -i :3000
lsof -i :3307
```

## Test complet de l'API

Exécutez le script de test complet :

```bash
chmod +x test_api.sh
./test_api.sh
```

Ce script teste :
1. ✅ Connexion Admin
2. ✅ Récupération du profil
3. ✅ Liste des utilisateurs (accès ADMIN)
4. ✅ Connexion Utilisateur standard
5. ✅ Refus d'accès USER vers routes ADMIN
6. ✅ Changement de mot de passe

## Besoin d'aide supplémentaire ?

Si le problème persiste après avoir suivi ces étapes, vérifiez :
1. Les logs détaillés : `docker compose logs -f`
2. L'état des conteneurs : `docker compose ps`
3. La connexion réseau entre les conteneurs : `docker network inspect si_releves_si_releves_network`
