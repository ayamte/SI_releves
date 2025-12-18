import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'mot_de_passe'
    },
    role: {
        type: DataTypes.ENUM('SUPERADMIN', 'ADMIN', 'USER', 'AGENT'),
        defaultValue: 'USER',
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'utilisateurs',
    hooks: {
        beforeCreate: async (user) => {
            if (user.mot_de_passe) {
                const salt = await bcrypt.genSalt(10);
                user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('mot_de_passe')) {
                const salt = await bcrypt.genSalt(10);
                user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
            }
        }
    }
});

User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.mot_de_passe);
};

export default User;
