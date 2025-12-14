import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const Compteur = sequelize.define('Compteur', {
    id_compteur: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        comment: 'Identifiant unique du compteur (ex: COMP-2025-001)'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Référence à l\'utilisateur propriétaire (role USER)'
    },
    type_fluide: {
        type: DataTypes.ENUM('EAU', 'ELEC'),
        allowNull: false,
        comment: 'Type de fluide: Eau ou Électricité'
    },
    adresse: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Adresse complète du compteur'
    },
    quartier: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Quartier où se trouve le compteur'
    },
    ville: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Rabat',
        comment: 'Ville du compteur'
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude GPS du compteur'
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude GPS du compteur'
    },
    date_installation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'installation du compteur'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Statut actif/inactif du compteur'
    }
}, {
    timestamps: true,
    tableName: 'compteurs',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['type_fluide']
        },
        {
            fields: ['quartier']
        },
        {
            fields: ['active']
        }
    ]
});

// Relations
Compteur.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Compteur;
