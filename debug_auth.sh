#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Diagnostic d'authentification ===${NC}\n"

# 1. Check if containers are running
echo -e "${BLUE}1. Vérification des conteneurs Docker${NC}"
if docker ps | grep -q "si_releves_backend"; then
    echo -e "${GREEN}✅ Backend conteneur actif${NC}"
else
    echo -e "${RED}❌ Backend conteneur non actif${NC}"
    exit 1
fi

if docker ps | grep -q "si_releves_mysql"; then
    echo -e "${GREEN}✅ MySQL conteneur actif${NC}"
else
    echo -e "${RED}❌ MySQL conteneur non actif${NC}"
    exit 1
fi

echo ""

# 2. Check backend health
echo -e "${BLUE}2. Test de santé du backend${NC}"
HEALTH=$(curl -s http://localhost:5001/api/health)
if [[ $HEALTH == *"OK"* ]]; then
    echo -e "${GREEN}✅ Backend répond correctement${NC}"
    echo "   Réponse: $HEALTH"
else
    echo -e "${RED}❌ Backend ne répond pas${NC}"
    echo -e "${YELLOW}Logs du backend:${NC}"
    docker logs si_releves_backend --tail 20
    exit 1
fi

echo ""

# 3. Check database connection
echo -e "${BLUE}3. Vérification de la connexion à la base de données${NC}"
DB_CHECK=$(docker exec si_releves_mysql mysql -uroot -proot_password -e "USE si_releves; SELECT COUNT(*) as count FROM users;" 2>&1)

if [[ $DB_CHECK == *"ERROR"* ]]; then
    echo -e "${RED}❌ Erreur de connexion à la base de données${NC}"
    echo "$DB_CHECK"
    echo ""
    echo -e "${YELLOW}💡 Initialisation de la base de données...${NC}"
    docker exec si_releves_backend npm run seed
else
    USER_COUNT=$(echo "$DB_CHECK" | grep -o '[0-9]\+' | tail -1)
    if [[ $USER_COUNT -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  Base de données vide (0 utilisateurs)${NC}"
        echo -e "${YELLOW}💡 Initialisation de la base de données...${NC}"
        docker exec si_releves_backend npm run seed
    else
        echo -e "${GREEN}✅ Base de données connectée ($USER_COUNT utilisateurs trouvés)${NC}"
    fi
fi

echo ""

# 4. Test login
echo -e "${BLUE}4. Test de connexion avec admin@ree.ma${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ree.ma","password":"Admin123"}')

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}✅ Connexion réussie!${NC}"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token (extrait): ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Échec de connexion${NC}"
    echo "   Réponse: $LOGIN_RESPONSE"
    echo ""

    # Check if user exists in database
    echo -e "${YELLOW}Vérification de l'existence de l'utilisateur dans la BD:${NC}"
    docker exec si_releves_mysql mysql -uroot -proot_password -e "USE si_releves; SELECT id, nom, prenom, email, role, active FROM users WHERE email='admin@ree.ma';"
fi

echo ""

# 5. Show backend logs
echo -e "${BLUE}5. Dernières lignes des logs du backend${NC}"
docker logs si_releves_backend --tail 10

echo ""
echo -e "${BLUE}=== Fin du diagnostic ===${NC}"
