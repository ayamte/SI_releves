#!/bin/bash

# ==============================================
# SI RELEVES - STAGING DEPLOYMENT SCRIPT
# ==============================================

set -e  # Exit on error

echo "🚀 Starting SI Releves Staging Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.staging exists
if [ ! -f .env.staging ]; then
    echo -e "${RED}❌ Error: .env.staging file not found!${NC}"
    echo -e "${YELLOW}📝 Please copy .env.staging.example to .env.staging and configure it.${NC}"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.staging | xargs)

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Pull latest changes (if deploying from git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes from git..."
    git pull origin staging || git pull origin main
    echo -e "${GREEN}✅ Git pull completed${NC}"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.staging.yml down

# Remove old images (optional - uncomment to force rebuild)
# echo "🗑️ Removing old images..."
# docker-compose -f docker-compose.staging.yml rm -f
# docker image prune -f

# Build images
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.staging.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.staging.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
docker-compose -f docker-compose.staging.yml ps

# Run database migrations (if needed)
echo "📊 Running database migrations..."
docker-compose -f docker-compose.staging.yml exec -T backend npm run migrate || echo -e "${YELLOW}⚠️ No migrations to run${NC}"

# Create backup of database
echo "💾 Creating database backup..."
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
docker-compose -f docker-compose.staging.yml exec -T mysql mysqldump \
    -u ${MYSQL_USER} \
    -p${MYSQL_PASSWORD} \
    ${MYSQL_DATABASE} > $BACKUP_FILE
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.staging.yml logs --tail=50

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "🌐 Services:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3001}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-5002}"
echo "   MySQL:    localhost:${MYSQL_PORT:-3308}"
echo ""
echo "📊 View logs:"
echo "   docker-compose -f docker-compose.staging.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.staging.yml down"
echo ""
