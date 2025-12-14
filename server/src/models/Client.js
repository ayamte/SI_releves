import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom du client (MAJUSCULES)'
    },
    prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Prénom du client'
    },
    cin: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        comment: 'Numéro CIN (optionnel)'
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Numéro de téléphone'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        },
        comment: 'Email du client (optionnel)'
    },
    adresse_principale: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Adresse principale du client'
    },
    quartier: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Quartier'
    },
    ville: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Rabat',
        comment: 'Ville'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Statut actif/inactif du client'
    }
}, {
    timestamps: true,
    tableName: 'clients',
    indexes: [
        {
            fields: ['nom', 'prenom']
        },
        {
            fields: ['cin']
        },
        {
            fields: ['telephone']
        },
        {
            fields: ['active']
        }
    ]
});

export default Client;
