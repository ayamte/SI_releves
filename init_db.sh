#!/bin/bash

echo "🔧 Initialisation de la base de données..."

# Run seed script inside the backend container
docker exec si_releves_backend npm run seed

echo "✅ Base de données initialisée avec succès!"
echo ""
echo "👤 Utilisateurs créés:"
echo "   - SUPERADMIN: admin@ree.ma / Admin123"
echo "   - USER: user@ree.ma / User123"
