#!/bin/bash

echo "🔄 Exécution de la migration : Ajout du rôle AGENT"
echo "=================================================="
echo ""

# Vérifier si Docker est disponible
if command -v docker &> /dev/null; then
    echo "✅ Docker détecté"
    echo ""
    echo "Exécution de la migration dans le conteneur MySQL..."
    echo ""

    docker exec -i si_releves_db mysql -uroot -prootpassword si_releves < server/migrations/add_agent_role.sql

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration réussie !"
    else
        echo ""
        echo "❌ Erreur lors de la migration"
        exit 1
    fi
else
    echo "⚠️  Docker non détecté"
    echo ""
    echo "Pour exécuter manuellement la migration:"
    echo "  mysql -u root -p si_releves < server/migrations/add_agent_role.sql"
fi

echo ""
echo "=================================================="
echo ""
