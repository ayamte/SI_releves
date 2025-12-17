# Tests Unitaires - SI Relevés Backend

Ce dossier contient les tests unitaires pour l'application SI Relevés.

## Structure des Tests

```
__tests__/
├── setup.js                          # Configuration globale des tests
├── helpers/
│   └── mockModels.js                 # Mocks réutilisables pour Sequelize
└── controllers/
    ├── releve.controller.test.js     # Tests du calcul de consommation
    └── releve.stats.test.js          # Tests des statistiques
```

## Exécuter les Tests

### Installation des dépendances
```bash
cd server
npm install
```

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests avec couverture
```bash
npm test -- --coverage
```

### Lancer un fichier de test spécifique
```bash
npm test -- releve.controller.test.js
```

### Mode watch (relance automatique)
```bash
npm test -- --watch
```

## Tests Créés

### 1. Tests du Calcul de Consommation (`releve.controller.test.js`)

Ces tests vérifient la logique métier critique du calcul de consommation :

- ✅ **Calcul correct avec relevé précédent** : `consommation = index_actuel - index_precedent`
- ✅ **Premier relevé** : `index_precedent = 0` si aucun relevé antérieur
- ✅ **Protection contre consommation négative** : Si `index_actuel < index_precedent`, `consommation = 0`
- ✅ **Gestion des décimales** : Support des index avec décimales (ex: 1500.75)
- ✅ **Validation des entités** : Vérification que le compteur et l'agent existent
- ✅ **Recalcul lors de l'update** : Mise à jour automatique de la consommation

**Nombre de tests** : 9 tests

### 2. Tests des Statistiques (`releve.stats.test.js`)

Ces tests vérifient les calculs statistiques et agrégations :

- ✅ **Calcul des statistiques globales** : Total, anomalies, consommation totale/moyenne
- ✅ **Protection division par zéro** : Gestion du cas sans relevés
- ✅ **Précision des calculs** : Arrondi à 2 décimales
- ✅ **Filtres de recherche** : Par compteur, agent, anomalie, plage de dates
- ✅ **CRUD opérations** : Récupération et suppression de relevés
- ✅ **Gestion des erreurs** : Erreurs de base de données

**Nombre de tests** : 14 tests

## Couverture Actuelle

Les tests couvrent actuellement :

- `createReleve` - Création de relevés avec calcul de consommation
- `updateReleve` - Mise à jour avec recalcul
- `getRelevesStats` - Statistiques et agrégations
- `getAllReleves` - Récupération avec filtres
- `getReleveById` - Récupération par ID
- `deleteReleve` - Suppression

## Mocks Utilisés

Les tests utilisent des **mocks Sequelize** pour simuler la base de données sans connexion réelle :

- `Releve.findAll()`, `findByPk()`, `findOne()`, `create()`, `count()`, `sum()`
- `Compteur.findOne()`, `findByPk()`
- `User.findByPk()`, `findOne()`

Cela permet des tests **rapides**, **isolés** et **reproductibles**.

## Prochaines Étapes

Pour améliorer la couverture des tests :

1. **Tests d'intégration** : Tester avec une vraie base de données de test
2. **Tests Auth Controller** : Login, JWT, changement de mot de passe
3. **Tests Compteur Controller** : Génération d'ID automatique
4. **Tests User Controller** : Gestion des utilisateurs
5. **Tests E2E** : Flux complets avec Supertest

## Exemple de Résultat

```
PASS  src/__tests__/controllers/releve.controller.test.js
  Releve Controller - Calcul de Consommation
    createReleve - Calcul de consommation
      ✓ devrait calculer la consommation correctement avec un relevé précédent (15ms)
      ✓ devrait utiliser index_precedent = 0 pour le premier relevé (3ms)
      ✓ devrait mettre consommation à 0 si index_actuel < index_precedent (4ms)
      ✓ devrait gérer les index décimaux correctement (3ms)
      ✓ devrait retourner 404 si le compteur n'existe pas (2ms)
      ✓ devrait retourner 404 si l'agent n'existe pas (3ms)

Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
Coverage:    75% Statements | 80% Branches | 70% Functions | 75% Lines
```

## Conseils

- **Isoler les tests** : Chaque test doit être indépendant
- **Mock les dépendances** : Ne pas dépendre de la base de données
- **Tester les cas limites** : Valeurs nulles, négatives, vides
- **Nommer clairement** : Le nom du test doit décrire ce qui est testé
- **Arrange-Act-Assert** : Structure claire des tests

## Support

Pour toute question sur les tests, consultez la documentation Jest : https://jestjs.io/
