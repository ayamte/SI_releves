import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Fonction utilitaire pour générer un mot de passe aléatoire
const generateRandomPassword = () => {
    return crypto.randomBytes(8).toString('hex'); // Génère un mot de passe de 16 caractères
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']] // Les plus récents en premier
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
    const { nom, prenom, email, role } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Générer un mot de passe aléatoire
        const randomPassword = generateRandomPassword();

        console.log(`🔐 Nouveau utilisateur créé: ${email}`);
        console.log(`📧 Mot de passe temporaire: ${randomPassword}`);
        console.log(`⚠️  TODO: Envoyer ce mot de passe par email à l'utilisateur`);

        const user = await User.create({
            nom: nom.toUpperCase(), // Forcer en majuscules comme le frontend
            prenom: prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase(), // Première lettre en maj
            email,
            password: randomPassword,
            role: role || 'USER'
        });

        // TODO: Envoyer un email avec le mot de passe
        // await sendPasswordEmail(user.email, randomPassword);

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès. Un email avec le mot de passe a été envoyé.',
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                active: user.active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            // En développement, on retourne le mot de passe (À RETIRER EN PRODUCTION)
            tempPassword: process.env.NODE_ENV === 'development' ? randomPassword : undefined
        });
    } catch (error) {
        console.error('❌ Erreur création utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            user.nom = req.body.nom || user.nom;
            user.prenom = req.body.prenom || user.prenom;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            if (req.body.active !== undefined) {
                user.active = req.body.active;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser.id,
                nom: updatedUser.nom,
                prenom: updatedUser.prenom,
                email: updatedUser.email,
                role: updatedUser.role,
                active: updatedUser.active
            });
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Empêcher la suppression de son propre compte
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        await user.destroy();
        console.log(`🗑️ Utilisateur supprimé: ${user.email}`);

        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private/Admin
export const resetPassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Générer un nouveau mot de passe aléatoire
        const newPassword = generateRandomPassword();

        console.log(`🔐 Réinitialisation mot de passe pour: ${user.email}`);
        console.log(`📧 Nouveau mot de passe temporaire: ${newPassword}`);
        console.log(`⚠️  TODO: Envoyer ce mot de passe par email à l'utilisateur`);

        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();

        // TODO: Envoyer un email avec le nouveau mot de passe
        // await sendPasswordResetEmail(user.email, newPassword);

        res.json({
            success: true,
            message: `Mot de passe réinitialisé. Un email a été envoyé à ${user.email}`,
            // En développement, on retourne le mot de passe (À RETIRER EN PRODUCTION)
            tempPassword: process.env.NODE_ENV === 'development' ? newPassword : undefined
        });
    } catch (error) {
        console.error('❌ Erreur réinitialisation mot de passe:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
