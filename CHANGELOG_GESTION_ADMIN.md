# 📝 Changelog - Gestion Admin et Rôle AGENT

## 🆕 Nouvelles Fonctionnalités

### 1. Ajout du Rôle AGENT
- ✅ Nouveau rôle `AGENT` ajouté au modèle User
- ✅ Les agents sont des utilisateurs terrain pour la saisie des relevés
- ✅ Pas d'authentification backoffice pour les agents (future implémentation mobile)

**Fichiers modifiés:**
- [server/src/models/User.js](server/src/models/User.js:32) - Ajout AGENT dans l'ENUM
- [client/src/pages/UserAdd.jsx](client/src/pages/UserAdd.jsx:159) - Option AGENT dans le formulaire
- [client/src/pages/UserDetail.jsx](client/src/pages/UserDetail.jsx:193) - Option AGENT dans le formulaire

**Migration base de données:**
```bash
# Exécuter la migration
bash run_migration.sh

# Ou manuellement avec Docker
docker exec -i si_releves_db mysql -uroot -prootpassword si_releves < server/migrations/add_agent_role.sql
```

### 2. Menu Admin Étendu (SUPERADMIN)
Le menu SUPERADMIN inclut maintenant:
- 👥 **Utilisateurs** - Gestion complète (existant)
- 📋 **Gestion Relevés** - Accès administrateur aux relevés
- 📊 **Gestion Compteurs** - Accès administrateur aux compteurs avec bouton "Ajouter"

**Fichiers modifiés:**
- [client/src/components/Layout/Sidebar.jsx](client/src/components/Layout/Sidebar.jsx:27-30) - Menu SUPERADMIN étendu

### 3. Routes Admin Séparées
Les SUPERADMIN ont leurs propres routes pour gérer relevés et compteurs:
- `/admin/releves` - Liste des relevés (admin)
- `/admin/releves/:id` - Détail relevé (admin)
- `/admin/compteurs` - Liste des compteurs avec bouton "Ajouter"
- `/admin/compteurs/:id` - Détail compteur (admin)
- `/admin/compteurs/nouveau` - Ajout compteur (admin uniquement)

**Fichiers modifiés:**
- [client/src/App.jsx](client/src/App.jsx:145-184) - Routes admin ajoutées

### 4. Restriction Bouton "Ajouter Compteur"
- ❌ **USER**: Bouton "Ajouter un compteur" **masqué** (lecture seule)
- ✅ **SUPERADMIN**: Bouton "Ajouter un compteur" **visible** dans `/admin/compteurs`

**Fichiers modifiés:**
- [client/src/pages/CompteursList.jsx](client/src/pages/CompteursList.jsx:11-32) - Condition sur isAdmin

## 📊 Matrice des Rôles

| Fonctionnalité | USER | AGENT | SUPERADMIN |
|---|---|---|---|
| Dashboard | ✅ | ❌ | ❌ |
| Voir Relevés | ✅ | ❌ | ✅ (via `/admin/releves`) |
| Voir Compteurs | ✅ | ❌ | ✅ (via `/admin/compteurs`) |
| **Ajouter Compteur** | ❌ | ❌ | ✅ |
| Voir Agents | ✅ | ❌ | ❌ |
| Voir Rapports | ✅ | ❌ | ❌ |
| Gestion Utilisateurs | ❌ | ❌ | ✅ |
| Authentification backoffice | ✅ | ❌ | ✅ |

## 🎯 Rôles Expliqués

### USER (Utilisateur Standard)
- Accès complet en **lecture** : relevés, agents, compteurs, rapports
- Peut changer son mot de passe
- Dashboard avec statistiques
- **Pas d'accès** à l'ajout de compteurs

### AGENT (Terrain)
- Utilisateur terrain pour la saisie mobile des relevés
- **Pas d'authentification** au backoffice web
- Visible dans la liste des utilisateurs pour l'admin
- Future implémentation : application mobile pour saisie relevés

### SUPERADMIN (Administrateur)
- Gestion complète des **utilisateurs** (CRUD)
- Gestion des **relevés** (consultation)
- Gestion des **compteurs** (consultation + ajout)
- Peut créer des utilisateurs avec rôle USER, AGENT ou SUPERADMIN
- Réinitialisation des mots de passe

## 🚀 Migration & Déploiement

### Étapes de Migration

1. **Mettre à jour la base de données:**
   ```bash
   bash run_migration.sh
   ```

2. **Redémarrer le backend:**
   ```bash
   docker-compose restart backend
   ```

3. **Redémarrer le frontend (si nécessaire):**
   ```bash
   docker-compose restart frontend
   ```

### Vérification

1. Connectez-vous en tant que SUPERADMIN (`admin@ree.ma`)
2. Vérifiez le menu latéral :
   - ✅ Utilisateurs
   - ✅ Gestion Relevés
   - ✅ Gestion Compteurs
3. Allez dans "Gestion Compteurs" et vérifiez le bouton "Ajouter un compteur"
4. Créez un utilisateur avec le rôle AGENT

## 📝 Notes Importantes

1. **Rôle AGENT**:
   - Prévu pour la future application mobile de saisie
   - Ne peut pas se connecter au backoffice web
   - Les agents existent dans la base mais n'ont pas accès au système web

2. **Séparation des Routes**:
   - Routes `/releves`, `/compteurs` : USER (lecture seule)
   - Routes `/admin/releves`, `/admin/compteurs` : SUPERADMIN (avec gestion)

3. **Bouton Ajouter Compteur**:
   - Visible uniquement pour SUPERADMIN
   - Utilise `useAuth()` pour vérifier le rôle

## 🔄 Compatibilité Descendante

✅ Toutes les fonctionnalités existantes sont préservées
✅ Les utilisateurs USER existants conservent leur accès
✅ Les SUPERADMIN existants conservent tous leurs privilèges
✅ Aucune donnée n'est perdue lors de la migration

---

**Date**: 2025-12-13
**Version**: 1.1.0
**Développé pour**: Rabat Energie & Eau - SI Relevés
