import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const importData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database...');

        await sequelize.sync({ force: true });
        console.log('✅ Database synced...');

        const users = [
            {
                nom: 'ADMIN',
                prenom: 'System',
                email: 'admin@ree.ma',
                password: 'Admin123',
                role: 'SUPERADMIN'
            },
            {
                nom: 'BENNANI',
                prenom: 'Ahmed',
                email: 'user@ree.ma',
                password: 'User123',
                role: 'USER'
            }
        ];

        for (const user of users) {
            await User.create(user);
        }

        console.log('✅ Data Imported!');
        process.exit();
    } catch (err) {
        console.error('❌ Error with data import:', err);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.drop();
        console.log('✅ Data Destroyed!');
        process.exit();
    } catch (err) {
        console.error('❌ Error with data destroy:', err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
