#!/bin/bash

# ==============================================
# SI RELEVES - STAGING BACKUP SCRIPT
# ==============================================

set -e

# Load environment variables
if [ -f .env.staging ]; then
    export $(grep -v '^#' .env.staging | xargs)
else
    echo "❌ Error: .env.staging file not found!"
    exit 1
fi

# Configuration
BACKUP_DIR="./backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/si_releves_staging_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "💾 Starting database backup..."

# Create backup
docker-compose -f docker-compose.staging.yml exec -T mysql mysqldump \
    --single-transaction \
    --quick \
    --lock-tables=false \
    -u ${MYSQL_USER} \
    -p${MYSQL_PASSWORD} \
    ${MYSQL_DATABASE} > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup created: $BACKUP_FILE"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "📦 Backup size: $SIZE"

# Delete old backups
echo "🗑️ Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed successfully!"
