import Compteur from '../models/Compteur.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

/**
 * Génère un ID compteur auto-incrémenté (COMP-2025-001, COMP-2025-002, etc.)
 */
const generateCompteurId = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `COMP-${currentYear}-`;

    // Trouver le dernier compteur de l'année
    const lastCompteur = await Compteur.findOne({
        where: {
            id_compteur: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['id_compteur', 'DESC']]
    });

    if (!lastCompteur) {
        // Premier compteur de l'année
        return `${prefix}001`;
    }

    // Extraire le numéro et incrémenter
    const lastNumber = parseInt(lastCompteur.id_compteur.split('-')[2]);
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');

    return `${prefix}${newNumber}`;
};

// @desc    Get all compteurs
// @route   GET /api/compteurs
// @access  Private
export const getAllCompteurs = async (req, res) => {
    try {
        const { type_fluide, quartier, active, user_id } = req.query;

        const where = {};
        if (type_fluide) where.type_fluide = type_fluide;
        if (quartier) where.quartier = { [Op.like]: `%${quartier}%` };
        if (active !== undefined) where.active = active === 'true';
        if (user_id) where.user_id = user_id;

        // Si l'utilisateur connecté est un USER (client), filtrer par ses compteurs uniquement
        if (req.user.role === 'USER') {
            where.user_id = req.user.id;
        }

        const compteurs = await Compteur.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nom', 'prenom', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(compteurs);
    } catch (error) {
        console.error('Erreur récupération compteurs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get single compteur by ID
// @route   GET /api/compteurs/:id
// @access  Private
export const getCompteurById = async (req, res) => {
    try {
        const compteur = await Compteur.findOne({
            where: { id_compteur: req.params.id }
        });

        if (!compteur) {
            return res.status(404).json({ message: 'Compteur non trouvé' });
        }

        res.json(compteur);
    } catch (error) {
        console.error('Erreur récupération compteur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Create new compteur
// @route   POST /api/compteurs
// @access  Private (SUPERADMIN only)
export const createCompteur = async (req, res) => {
    try {
        const {
            user_id,
            type_fluide,
            adresse,
            quartier,
            ville,
            latitude,
            longitude,
            date_installation
        } = req.body;

        // Vérifier que l'utilisateur existe et a le rôle USER
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        if (user.role !== 'USER') {
            return res.status(400).json({ message: 'Seuls les utilisateurs avec le rôle USER peuvent avoir des compteurs' });
        }

        // Générer automatiquement l'ID du compteur
        const id_compteur = await generateCompteurId();

        const compteur = await Compteur.create({
            id_compteur,
            user_id,
            type_fluide,
            adresse,
            quartier,
            ville: ville || 'Rabat',
            latitude,
            longitude,
            date_installation: date_installation || new Date(),
            active: true
        });

        res.status(201).json({
            success: true,
            message: 'Compteur créé avec succès',
            compteur
        });
    } catch (error) {
        console.error('Erreur création compteur:', error);
        res.status(500).json({
            message: 'Erreur lors de la création du compteur',
            error: error.message
        });
    }
};

// @desc    Update compteur
// @route   PUT /api/compteurs/:id
// @access  Private (SUPERADMIN only)
export const updateCompteur = async (req, res) => {
    try {
        const compteur = await Compteur.findOne({
            where: { id_compteur: req.params.id }
        });

        if (!compteur) {
            return res.status(404).json({ message: 'Compteur non trouvé' });
        }

        const {
            type_fluide,
            adresse,
            quartier,
            ville,
            latitude,
            longitude,
            date_installation,
            active
        } = req.body;

        await compteur.update({
            type_fluide: type_fluide || compteur.type_fluide,
            adresse: adresse || compteur.adresse,
            quartier: quartier || compteur.quartier,
            ville: ville || compteur.ville,
            latitude: latitude !== undefined ? latitude : compteur.latitude,
            longitude: longitude !== undefined ? longitude : compteur.longitude,
            date_installation: date_installation || compteur.date_installation,
            active: active !== undefined ? active : compteur.active
        });

        res.json({
            success: true,
            message: 'Compteur mis à jour avec succès',
            compteur
        });
    } catch (error) {
        console.error('Erreur mise à jour compteur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Delete compteur
// @route   DELETE /api/compteurs/:id
// @access  Private (SUPERADMIN only)
export const deleteCompteur = async (req, res) => {
    try {
        const compteur = await Compteur.findOne({
            where: { id_compteur: req.params.id }
        });

        if (!compteur) {
            return res.status(404).json({ message: 'Compteur non trouvé' });
        }

        // Soft delete: marquer comme inactif au lieu de supprimer
        await compteur.update({ active: false });

        res.json({
            success: true,
            message: 'Compteur désactivé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression compteur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get compteurs statistics
// @route   GET /api/compteurs/stats
// @access  Private
export const getCompteursStats = async (req, res) => {
    try {
        const totalCompteurs = await Compteur.count();
        const compteursEau = await Compteur.count({ where: { type_fluide: 'EAU' } });
        const compteursElec = await Compteur.count({ where: { type_fluide: 'ELEC' } });
        const compteursActifs = await Compteur.count({ where: { active: true } });

        res.json({
            total: totalCompteurs,
            eau: compteursEau,
            electricite: compteursElec,
            actifs: compteursActifs,
            inactifs: totalCompteurs - compteursActifs
        });
    } catch (error) {
        console.error('Erreur stats compteurs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
