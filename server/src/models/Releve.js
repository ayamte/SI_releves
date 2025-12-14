import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Compteur from './Compteur.js';
import User from './User.js';

const Releve = sequelize.define('Releve', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    compteur_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'compteurs',
            key: 'id_compteur'
        },
        comment: 'Référence au compteur'
    },
    agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Référence à l\'agent qui a effectué le relevé'
    },
    index_actuel: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Index relevé sur le compteur'
    },
    index_precedent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Index précédent (calculé automatiquement)'
    },
    consommation: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Consommation calculée (index_actuel - index_precedent)'
    },
    date_heure: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Date et heure du relevé'
    },
    photo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL de la photo du compteur (optionnelle)'
    },
    anomalie: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indique si une anomalie a été détectée'
    },
    commentaire: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Commentaire ou notes sur le relevé'
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude GPS du relevé'
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude GPS du relevé'
    }
}, {
    timestamps: true,
    tableName: 'releves',
    indexes: [
        {
            fields: ['compteur_id']
        },
        {
            fields: ['agent_id']
        },
        {
            fields: ['date_heure']
        },
        {
            fields: ['anomalie']
        }
    ]
});

// Relations
Releve.belongsTo(Compteur, { foreignKey: 'compteur_id', targetKey: 'id_compteur', as: 'compteur' });
Releve.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });

export default Releve;
