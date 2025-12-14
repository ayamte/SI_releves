#!/bin/bash

echo "🔧 Installation des dépendances PDF pour SI Relevés"
echo "=================================================="
echo ""

# Vérifier si Docker est disponible
if command -v docker &> /dev/null; then
    echo "✅ Docker détecté"
    echo ""
    echo "Option 1: Installation via Docker (Recommandé)"
    echo "Exécutez ces commandes:"
    echo ""
    echo "  docker-compose down"
    echo "  docker-compose run --rm frontend npm install"
    echo "  docker-compose up -d"
    echo ""
else
    echo "⚠️  Docker non détecté"
    echo ""
fi

echo "Option 2: Installation locale (si npm est disponible)"
echo "Exécutez ces commandes:"
echo ""
echo "  cd /Users/mac/SI_releves/client"
echo "  npm install"
echo ""
echo "=================================================="
echo ""
echo "Les packages suivants seront installés:"
echo "  - jspdf@^2.5.1"
echo "  - jspdf-autotable@^3.8.2"
echo "  - chart.js@^4.4.1"
echo ""
echo "Après installation, redémarrez l'application."
