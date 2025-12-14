#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Diagnostic Complet - SI Relevés                  ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"

# 1. Check Docker containers
echo -e "${BLUE}[1/7] Vérification des conteneurs Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

CONTAINERS=$(docker ps --format "{{.Names}}" | grep si_releves)
if [ -z "$CONTAINERS" ]; then
    echo -e "${RED}❌ Aucun conteneur SI Relevés actif${NC}"
    echo -e "${YELLOW}💡 Démarrez les conteneurs avec: docker compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conteneurs actifs:${NC}"
docker ps --filter "name=si_releves" --format "   - {{.Names}} ({{.Status}})"

echo ""

# 2. Check MySQL
echo -e "${BLUE}[2/7] Vérification de MySQL...${NC}"
MYSQL_READY=$(docker exec si_releves_mysql mysqladmin ping -h localhost -uroot -proot_password 2>&1)
if [[ $MYSQL_READY == *"alive"* ]]; then
    echo -e "${GREEN}✅ MySQL est actif et répond${NC}"
else
    echo -e "${RED}❌ MySQL ne répond pas${NC}"
    exit 1
fi

echo ""

# 3. Check Backend health
echo -e "${BLUE}[3/7] Vérification du backend...${NC}"
HEALTH=$(curl -s http://localhost:5001/api/health 2>&1)
if [[ $HEALTH == *"OK"* ]]; then
    echo -e "${GREEN}✅ Backend API est actif${NC}"
    echo "   URL: http://localhost:5001/api"
else
    echo -e "${RED}❌ Backend ne répond pas${NC}"
    echo -e "${YELLOW}Logs du backend:${NC}"
    docker logs si_releves_backend --tail 10
    exit 1
fi

echo ""

# 4. Check database and users
echo -e "${BLUE}[4/7] Vérification de la base de données...${NC}"
USER_COUNT=$(docker exec si_releves_mysql mysql -uroot -proot_password -se "USE si_releves; SELECT COUNT(*) FROM users;" 2>&1)

if [[ $USER_COUNT =~ ^[0-9]+$ ]]; then
    if [ "$USER_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Base de données vide (0 utilisateurs)${NC}"
        echo -e "${YELLOW}💡 Initialisation de la base de données...${NC}"
        docker exec si_releves_backend npm run seed
        echo ""
    else
        echo -e "${GREEN}✅ Base de données initialisée ($USER_COUNT utilisateurs)${NC}"

        # Show users
        echo -e "\n${BLUE}   Utilisateurs disponibles:${NC}"
        docker exec si_releves_mysql mysql -uroot -proot_password -se "USE si_releves; SELECT CONCAT('   - ', email, ' (', role, ')') as user FROM users;" 2>/dev/null
    fi
else
    echo -e "${YELLOW}⚠️  Table users n'existe pas${NC}"
    echo -e "${YELLOW}💡 Initialisation de la base de données...${NC}"
    docker exec si_releves_backend npm run seed
    echo ""
fi

echo ""

# 5. Test login API
echo -e "${BLUE}[5/7] Test de l'API de connexion...${NC}"

# Test Admin login
echo -e "${BLUE}   → Test connexion ADMIN (admin@ree.ma)${NC}"
ADMIN_LOGIN=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ree.ma","password":"Admin123"}')

HTTP_CODE=$(echo "$ADMIN_LOGIN" | tail -n1)
RESPONSE=$(echo "$ADMIN_LOGIN" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] && [[ $RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}   ✅ Connexion ADMIN réussie${NC}"
    ADMIN_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}   ❌ Échec connexion ADMIN (Code: $HTTP_CODE)${NC}"
    echo "   Réponse: $RESPONSE"
fi

# Test User login
echo -e "${BLUE}   → Test connexion USER (user@ree.ma)${NC}"
USER_LOGIN=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@ree.ma","password":"User123"}')

HTTP_CODE=$(echo "$USER_LOGIN" | tail -n1)
RESPONSE=$(echo "$USER_LOGIN" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] && [[ $RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}   ✅ Connexion USER réussie${NC}"
else
    echo -e "${RED}   ❌ Échec connexion USER (Code: $HTTP_CODE)${NC}"
    echo "   Réponse: $RESPONSE"
fi

echo ""

# 6. Check frontend
echo -e "${BLUE}[6/7] Vérification du frontend...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
if [ "$FRONTEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend est accessible${NC}"
    echo "   URL: http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  Frontend ne répond pas sur le port 3000${NC}"
    echo "   Vérifiez le conteneur frontend"
fi

echo ""

# 7. Check environment and configuration
echo -e "${BLUE}[7/7] Vérification de la configuration...${NC}"

# Check backend .env
if [ -f "server/.env" ]; then
    JWT_SECRET=$(grep JWT_SECRET server/.env | cut -d'=' -f2)
    if [ -n "$JWT_SECRET" ] && [ "$JWT_SECRET" != "votre_secret_jwt_super_securise_a_changer" ]; then
        echo -e "${GREEN}✅ JWT_SECRET configuré${NC}"
    else
        echo -e "${YELLOW}⚠️  JWT_SECRET utilise la valeur par défaut${NC}"
        echo -e "${YELLOW}   Changez-le dans server/.env pour la production${NC}"
    fi
else
    echo -e "${RED}❌ Fichier server/.env non trouvé${NC}"
fi

# Check client .env
if [ -f "client/.env" ]; then
    API_URL=$(grep VITE_API_URL client/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅ Frontend API URL: $API_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier client/.env non trouvé (utilisera la valeur par défaut)${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Diagnostic terminé!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"

# Show backend logs if there were errors
if [ "$HTTP_CODE" -ne 200 ]; then
    echo -e "${YELLOW}📋 Dernières lignes des logs du backend:${NC}"
    docker logs si_releves_backend --tail 20
    echo ""
fi

# Summary
echo -e "${BLUE}📝 Résumé:${NC}"
echo -e "   • Backend API: http://localhost:5001/api"
echo -e "   • Frontend: http://localhost:3000"
echo -e "   • MailHog: http://localhost:8025"
echo ""
echo -e "${BLUE}🔐 Comptes de test:${NC}"
echo -e "   • SUPERADMIN: admin@ree.ma / Admin123"
echo -e "   • USER: user@ree.ma / User123"
echo ""
echo -e "${YELLOW}💡 Commandes utiles:${NC}"
echo -e "   • Voir les logs: ${GREEN}docker logs si_releves_backend -f${NC}"
echo -e "   • Réinitialiser BD: ${GREEN}docker exec si_releves_backend npm run seed${NC}"
echo -e "   • Redémarrer: ${GREEN}docker compose restart${NC}"
echo ""
