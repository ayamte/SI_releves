import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const createUsers = async () => {
    try {
        // Se connecter à MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3307,
            user: 'root',
            password: 'root_password',
            database: 'si_releves'
        });

        console.log('✅ Connecté à MySQL');

        // Hasher les mots de passe
        const adminPassword = await bcrypt.hash('Admin123', 10);
        const userPassword = await bcrypt.hash('User123', 10);

        console.log('✅ Mots de passe hashés');

        // Supprimer les utilisateurs existants (optionnel)
        await connection.execute('DELETE FROM users');
        console.log('🗑️ Utilisateurs existants supprimés');

        // Insérer les nouveaux utilisateurs
        await connection.execute(
            `INSERT INTO users (nom, prenom, email, password, role, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['ADMIN', 'System', 'admin@ree.ma', adminPassword, 'SUPERADMIN', true]
        );

        await connection.execute(
            `INSERT INTO users (nom, prenom, email, password, role, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['BENNANI', 'Ahmed', 'user@ree.ma', userPassword, 'USER', true]
        );

        console.log('✅ Utilisateurs créés avec succès');

        // Vérifier
        const [rows] = await connection.execute('SELECT id, nom, prenom, email, role FROM users');
        console.log('\n📋 Utilisateurs dans la base de données:');
        console.table(rows);

        await connection.end();
        console.log('\n✅ Terminé !');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
};

createUsers();
