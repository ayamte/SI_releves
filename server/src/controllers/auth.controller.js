import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Tentative de connexion pour:', email);

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ Utilisateur non trouvé:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        console.log('✅ Utilisateur trouvé:', email, '- Role:', user.role);

        const isPasswordValid = await user.validatePassword(password);
        console.log('🔑 Validation du mot de passe:', isPasswordValid ? '✅ Valide' : '❌ Invalide');

        if (isPasswordValid) {
            if (!user.active) {
                console.log('⚠️ Compte désactivé:', email);
                return res.status(401).json({ message: 'Compte désactivé' });
            }

            const token = generateToken(user.id);
            console.log('✅ Connexion réussie pour:', email);

            res.json({
                user: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                },
                token: token,
            });
        } else {
            console.log('❌ Mot de passe incorrect pour:', email);
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['mot_de_passe'] }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Verify old password
        const isMatch = await user.validatePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
        }

        // Update password
        user.mot_de_passe = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
