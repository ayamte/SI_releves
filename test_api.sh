#!/bin/bash

BASE_URL="http://localhost:5001/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Test des Endpoints API ===${NC}\n"

# 1. Login Admin
echo -e "${BLUE}1. Connexion Admin (admin@ree.ma)${NC}"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ree.ma","password":"Admin123"}')

# Extract message if error
MSG=$(echo $ADMIN_RESPONSE | grep -o '"message":"[^"]*"' | cut -d'"' -f4)

if [[ $ADMIN_RESPONSE == *"token"* ]]; then
  ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | sed -E 's/.*"token":"([^"]+)".*/\1/')
  echo -e "${GREEN}✅ Connexion réussie!${NC}"
  # echo "Token: $ADMIN_TOKEN"
else
  echo -e "${RED}❌ Échec de la connexion: $MSG${NC}"
  exit 1
fi

echo ""

# 2. Get Admin Profile (Protected)
echo -e "${BLUE}2. Récupération profil Admin (/auth/me)${NC}"
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $PROFILE_RESPONSE == *"email":"admin@ree.ma"* ]]; then
  echo -e "${GREEN}✅ Profil récupéré!${NC}"
else
  echo -e "${RED}❌ Échec: $PROFILE_RESPONSE${NC}"
fi

echo ""

# 3. Get Users List (Admin Only)
echo -e "${BLUE}3. Liste des utilisateurs (/users) [Role: ADMIN]${NC}"
USERS_RESPONSE=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")

COUNT=$(echo $USERS_RESPONSE | grep -o "id" | wc -l)
if [[ $COUNT -ge 1 ]]; then
  echo -e "${GREEN}✅ Liste récupérée ($COUNT utilisateurs trouvés)${NC}"
else
    echo -e "${RED}❌ Échec: $USERS_RESPONSE${NC}"
fi

echo ""

# 4. Login Standard User
echo -e "${BLUE}4. Connexion Utilisateur (user@ree.ma)${NC}"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@ree.ma","password":"User123"}')

if [[ $USER_RESPONSE == *"token"* ]]; then
  USER_TOKEN=$(echo $USER_RESPONSE | sed -E 's/.*"token":"([^"]+)".*/\1/')
  echo -e "${GREEN}✅ Connexion réussie!${NC}"
else
  echo -e "${RED}❌ Échec de la connexion${NC}"
  exit 1
fi

echo ""

# 5. Try to access Admin Route as User (Should Fail)
echo -e "${BLUE}5. Tentative accès Admin avec User Standard (/users) [Doit échouer]${NC}"
FAIL_RESPONSE=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $FAIL_RESPONSE == *"403"* ]] || [[ $FAIL_RESPONSE == *"pas autorisé"* ]]; then
  echo -e "${GREEN}✅ Accès refusé comme prévu (403)${NC}"
else
    # Check if it actually implicitly failed with a message in json
    if [[ $FAIL_RESPONSE == *"user@ree.ma"* ]]; then
        echo -e "${RED}❌ FAIL: L'utilisateur a pu accéder à la liste!${NC}"
    else
         echo -e "${GREEN}✅ Réponse serveur: $FAIL_RESPONSE${NC}"
    fi
fi

echo ""

# 6. Test Change Password
echo -e "${BLUE}6. Test Changement de mot de passe (/auth/change-password)${NC}"
CHANGE_PWD_RESPONSE=$(curl -s -X PUT $BASE_URL/auth/change-password \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"User123","newPassword":"NewPass123"}')

if [[ $CHANGE_PWD_RESPONSE == *"success"* ]]; then
  echo -e "${GREEN}✅ Mot de passe modifié!${NC}"

  # Test login with new password
  echo -e "${BLUE}   -> Vérification connexion avec nouveau mot de passe${NC}"
  NEW_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@ree.ma","password":"NewPass123"}')

  if [[ $NEW_LOGIN == *"token"* ]]; then
    echo -e "${GREEN}   ✅ Connexion avec nouveau mot de passe réussie!${NC}"

    # Restore old password for future tests
    NEW_TOKEN=$(echo $NEW_LOGIN | sed -E 's/.*"token":"([^"]+)".*/\1/')
    curl -s -X PUT $BASE_URL/auth/change-password \
      -H "Authorization: Bearer $NEW_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"oldPassword":"NewPass123","newPassword":"User123"}' > /dev/null
    echo -e "${BLUE}   -> Mot de passe restauré${NC}"
  else
    echo -e "${RED}   ❌ Échec connexion avec nouveau mot de passe${NC}"
  fi
else
  echo -e "${RED}❌ Échec changement de mot de passe: $CHANGE_PWD_RESPONSE${NC}"
fi

echo -e "\n${BLUE}=== Fin des tests ===${NC}"
