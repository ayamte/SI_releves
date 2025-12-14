import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database.js';
import User from './src/models/User.js';
import Compteur from './src/models/Compteur.js';
import Releve from './src/models/Releve.js';

const seedData = async () => {
    try {
        console.log('🌱 Démarrage du seed des données...\n');

        // 1. Créer les utilisateurs
        console.log('1️⃣ Création des utilisateurs...');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.bulkCreate([
            {
                nom: 'ADMIN',
                prenom: 'Super',
                email: 'admin@ree.ma',
                password: hashedPassword,
                role: 'SUPERADMIN',
                active: true
            },
            {
                nom: 'ALAMI',
                prenom: 'Mohamed',
                email: 'mohamed.alami@gmail.com',
                password: hashedPassword,
                role: 'USER',
                active: true
            },
            {
                nom: 'BENNANI',
                prenom: 'Fatima',
                email: 'fatima.bennani@gmail.com',
                password: hashedPassword,
                role: 'USER',
                active: true
            },
            {
                nom: 'TAZI',
                prenom: 'Ahmed',
                email: 'ahmed.tazi@gmail.com',
                password: hashedPassword,
                role: 'USER',
                active: true
            },
            {
                nom: 'IDRISSI',
                prenom: 'Karim',
                email: 'karim.idrissi@gmail.com',
                password: hashedPassword,
                role: 'USER',
                active: true
            },
            {
                nom: 'AGENT',
                prenom: 'Releveur',
                email: 'agent@ree.ma',
                password: hashedPassword,
                role: 'AGENT',
                active: true
            }
        ]);

        console.log(`   ✅ ${users.length} utilisateurs créés`);
        console.log('   📧 Email: admin@ree.ma / password123 (SUPERADMIN)');
        console.log('   📧 Email: agent@ree.ma / password123 (AGENT)');
        console.log('   📧 Email: mohamed.alami@gmail.com / password123 (USER/Client)\n');

        // 2. Créer les compteurs
        console.log('2️⃣ Création des compteurs...');

        const compteurs = await Compteur.bulkCreate([
            {
                id_compteur: 'COMP-2025-001',
                user_id: users[1].id, // Mohamed ALAMI
                type_fluide: 'EAU',
                adresse: '15 Avenue Mohammed V, Agdal',
                quartier: 'Agdal',
                ville: 'Rabat',
                latitude: 34.020882,
                longitude: -6.841650,
                date_installation: new Date('2024-01-15'),
                active: true
            },
            {
                id_compteur: 'COMP-2025-002',
                user_id: users[1].id, // Mohamed ALAMI
                type_fluide: 'ELEC',
                adresse: '15 Avenue Mohammed V, Agdal',
                quartier: 'Agdal',
                ville: 'Rabat',
                latitude: 34.020882,
                longitude: -6.841650,
                date_installation: new Date('2024-01-15'),
                active: true
            },
            {
                id_compteur: 'COMP-2025-003',
                user_id: users[2].id, // Fatima BENNANI
                type_fluide: 'EAU',
                adresse: '23 Rue des Orangers, Hassan',
                quartier: 'Hassan',
                ville: 'Rabat',
                latitude: 34.017056,
                longitude: -6.825417,
                date_installation: new Date('2024-02-10'),
                active: true
            },
            {
                id_compteur: 'COMP-2025-004',
                user_id: users[2].id, // Fatima BENNANI
                type_fluide: 'ELEC',
                adresse: '23 Rue des Orangers, Hassan',
                quartier: 'Hassan',
                ville: 'Rabat',
                latitude: 34.017056,
                longitude: -6.825417,
                date_installation: new Date('2024-02-10'),
                active: true
            },
            {
                id_compteur: 'COMP-2025-005',
                user_id: users[3].id, // Ahmed TAZI
                type_fluide: 'EAU',
                adresse: '8 Boulevard Al Alaouiyine, Souissi',
                quartier: 'Souissi',
                ville: 'Rabat',
                latitude: 33.969697,
                longitude: -6.850847,
                date_installation: new Date('2024-03-20'),
                active: true
            },
            {
                id_compteur: 'COMP-2025-006',
                user_id: users[3].id, // Ahmed TAZI
                type_fluide: 'ELEC',
                adresse: '8 Boulevard Al Alaouiyine, Souissi',
                quartier: 'Souissi',
                ville: 'Rabat',
                latitude: 33.969697,
                longitude: -6.850847,
                date_installation: new Date('2024-03-20'),
                active: true
            },
            {
                id_compteur: 'COMP-2025-007',
                user_id: users[4].id, // Karim IDRISSI
                type_fluide: 'EAU',
                adresse: '45 Rue Patrice Lumumba, Océan',
                quartier: 'Océan',
                ville: 'Rabat',
                latitude: 33.987654,
                longitude: -6.834356,
                date_installation: new Date('2024-04-05'),
                active: true
            }
        ]);

        console.log(`   ✅ ${compteurs.length} compteurs créés\n`);

        // 3. Créer des relevés
        console.log('3️⃣ Création des relevés...');

        const releves = await Releve.bulkCreate([
            {
                compteur_id: 'COMP-2025-001',
                agent_id: users[5].id, // AGENT
                index_actuel: 12543.50,
                index_precedent: 12500.00,
                consommation: 43.50,
                date_heure: new Date('2025-01-10 09:30:00'),
                anomalie: false,
                commentaire: 'Relevé normal',
                latitude: 34.020882,
                longitude: -6.841650
            },
            {
                compteur_id: 'COMP-2025-002',
                agent_id: users[5].id,
                index_actuel: 8765.20,
                index_precedent: 8650.00,
                consommation: 115.20,
                date_heure: new Date('2025-01-10 09:35:00'),
                anomalie: false,
                commentaire: 'Relevé normal',
                latitude: 34.020882,
                longitude: -6.841650
            },
            {
                compteur_id: 'COMP-2025-003',
                agent_id: users[5].id,
                index_actuel: 9876.30,
                index_precedent: 9820.00,
                consommation: 56.30,
                date_heure: new Date('2025-01-11 10:15:00'),
                anomalie: false,
                commentaire: 'RAS',
                latitude: 34.017056,
                longitude: -6.825417
            },
            {
                compteur_id: 'COMP-2025-004',
                agent_id: users[5].id,
                index_actuel: 15432.80,
                index_precedent: 15200.00,
                consommation: 232.80,
                date_heure: new Date('2025-01-11 10:20:00'),
                anomalie: true,
                commentaire: 'Consommation élevée - À vérifier',
                latitude: 34.017056,
                longitude: -6.825417
            },
            {
                compteur_id: 'COMP-2025-005',
                agent_id: users[5].id,
                index_actuel: 7654.90,
                index_precedent: 7600.00,
                consommation: 54.90,
                date_heure: new Date('2025-01-12 14:00:00'),
                anomalie: false,
                commentaire: 'Relevé OK',
                latitude: 33.969697,
                longitude: -6.850847
            }
        ]);

        console.log(`   ✅ ${releves.length} relevés créés\n`);

        console.log('✅ Seed terminé avec succès!\n');
        console.log('📋 Résumé:');
        console.log(`   - ${users.length} utilisateurs (1 SUPERADMIN, 1 AGENT, 4 USERS/Clients)`);
        console.log(`   - ${compteurs.length} compteurs (4 EAU, 3 ELEC)`);
        console.log(`   - ${releves.length} relevés`);
        console.log('\n🔑 Identifiants de connexion:');
        console.log('   SUPERADMIN: admin@ree.ma / password123');
        console.log('   AGENT: agent@ree.ma / password123');
        console.log('   CLIENT: mohamed.alami@gmail.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seed:', error);
        process.exit(1);
    }
};

// Exécuter le seed
seedData();
