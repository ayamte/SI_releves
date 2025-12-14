# Installation des Dépendances PDF

Pour activer la génération de rapports PDF, vous devez installer les dépendances suivantes :

## Installation

### Option 1: Avec Docker (Recommandé)

```bash
# Arrêter les conteneurs
docker-compose down

# Installer les dépendances dans le conteneur frontend
docker-compose run --rm frontend npm install jspdf jspdf-autotable chart.js

# Redémarrer les conteneurs
docker-compose up -d
```

### Option 2: Sans Docker (Développement local)

```bash
# Aller dans le dossier client
cd client

# Installer les dépendances
npm install jspdf jspdf-autotable chart.js

# Redémarrer le serveur de développement
npm run dev
```

## Vérification

Une fois les dépendances installées, vous pourrez :

1. Accéder à la page **Rapports** (`/rapports`)
2. Cliquer sur **"Exporter en PDF"** pour chaque rapport
3. Les fichiers PDF seront téléchargés automatiquement

## Rapports Disponibles

### 1. Rapport Mensuel des Relevés
- Indicateurs clés de performance (KPIs)
- Répartition des relevés par quartier
- Performance des agents
- Recommandations

**Fichier:** `Rapport_Mensuel_Releves_[DATE].pdf`

### 2. Rapport d'Évolution de la Consommation
- Consommation globale (eau et électricité)
- Graphique d'évolution mensuelle
- Tableau détaillé par mois
- Analyse des tendances

**Fichier:** `Rapport_Consommation_[DATE].pdf`

## Fichiers Créés

- `client/src/utils/pdfGenerator.js` - Utilitaire de base pour PDF
- `client/src/utils/rapports/rapportMensuel.js` - Générateur rapport mensuel
- `client/src/utils/rapports/rapportConsommation.js` - Générateur rapport consommation
- `client/src/pages/Rapports.jsx` - Page intégrée avec les boutons d'export

## Caractéristiques des PDF

✅ Header professionnel avec logo REE
✅ Footer avec numérotation des pages
✅ Tableaux formatés avec jsPDF-autoTable
✅ Graphiques interactifs avec Chart.js
✅ KPIs visuels avec cartes colorées
✅ Design aux couleurs REE (bleu, jaune)
✅ Recommandations automatiques basées sur les données

## Dépannage

Si vous rencontrez des erreurs :

1. Vérifiez que les dépendances sont installées :
   ```bash
   npm list jspdf jspdf-autotable chart.js
   ```

2. Supprimez `node_modules` et réinstallez :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Vérifiez la console du navigateur pour les erreurs JavaScript

## Note Importante

Les rapports utilisent les **données mock** du frontend (`client/src/data/mockData.js`). C'est intentionnel et conforme à l'architecture du projet.
