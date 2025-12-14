#!/bin/bash

echo "🔧 Création forcée des utilisateurs..."

# Hash bcrypt pour "Admin123"
ADMIN_HASH='$2a$10$VqYG5pXxNnGvLNj5R0YJOePxwQvGRrGjI6Q1C5TKjNkPf8HvXXXXX'

# Hash bcrypt pour "User123"
USER_HASH='$2a$10$VqYG5pXxNnGvLNj5R0YJOePxwQvGRrGjI6Q1C5TKjNkPf8HvYYYYY'

# Supprimer les utilisateurs existants
docker exec si_releves_mysql mysql -uroot -proot_password si_releves -e "DELETE FROM users;"

# Créer l'admin (nous allons régénérer le hash)
docker exec si_releves_backend node -e "
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
    const adminHash = await bcrypt.hash('Admin123', 10);
    const userHash = await bcrypt.hash('User123', 10);

    const conn = await mysql.createConnection({
        host: 'mysql',
        user: 'root',
        password: 'root_password',
        database: 'si_releves'
    });

    await conn.execute(
        'INSERT INTO users (nom, prenom, email, password, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        ['ADMIN', 'System', 'admin@ree.ma', adminHash, 'SUPERADMIN', 1]
    );

    await conn.execute(
        'INSERT INTO users (nom, prenom, email, password, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        ['BENNANI', 'Ahmed', 'user@ree.ma', userHash, 'USER', 1]
    );

    console.log('✅ Utilisateurs créés');
    await conn.end();
})();
"

echo "✅ Utilisateurs créés!"

# Vérifier
docker exec si_releves_mysql mysql -uroot -proot_password -e "USE si_releves; SELECT id, nom, email, role FROM users;"
