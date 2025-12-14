import Releve from '../models/Releve.js';
import Compteur from '../models/Compteur.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    Get all releves with filters
// @route   GET /api/releves
// @access  Private
export const getAllReleves = async (req, res) => {
    try {
        const { compteur_id, agent_id, anomalie, date_debut, date_fin } = req.query;

        const where = {};
        if (compteur_id) where.compteur_id = compteur_id;
        if (agent_id) where.agent_id = agent_id;
        if (anomalie !== undefined) where.anomalie = anomalie === 'true';

        if (date_debut || date_fin) {
            where.date_heure = {};
            if (date_debut) where.date_heure[Op.gte] = new Date(date_debut);
            if (date_fin) where.date_heure[Op.lte] = new Date(date_fin);
        }

        const releves = await Releve.findAll({
            where,
            include: [
                {
                    model: Compteur,
                    as: 'compteur',
                    attributes: ['id_compteur', 'type_fluide', 'adresse', 'quartier']
                },
                {
                    model: User,
                    as: 'agent',
                    attributes: ['id', 'nom', 'prenom', 'email', 'role']
                }
            ],
            order: [['date_heure', 'DESC']]
        });

        res.json(releves);
    } catch (error) {
        console.error('Erreur récupération relevés:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Get single releve by ID
// @route   GET /api/releves/:id
// @access  Private
export const getReleveById = async (req, res) => {
    try {
        const releve = await Releve.findByPk(req.params.id, {
            include: [
                {
                    model: Compteur,
                    as: 'compteur'
                },
                {
                    model: User,
                    as: 'agent',
                    attributes: ['id', 'nom', 'prenom', 'email', 'role']
                }
            ]
        });

        if (!releve) {
            return res.status(404).json({ message: 'Relevé non trouvé' });
        }

        res.json(releve);
    } catch (error) {
        console.error('Erreur récupération relevé:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Create new releve
// @route   POST /api/releves
// @access  Private (SUPERADMIN or AGENT)
export const createReleve = async (req, res) => {
    try {
        const {
            compteur_id,
            agent_id,
            index_actuel,
            date_heure,
            photo,
            anomalie,
            commentaire,
            latitude,
            longitude
        } = req.body;

        // Vérifier que le compteur existe
        const compteur = await Compteur.findOne({ where: { id_compteur: compteur_id } });
        if (!compteur) {
            return res.status(404).json({ message: 'Compteur non trouvé' });
        }

        // Vérifier que l'agent existe
        const agent = await User.findByPk(agent_id);
        if (!agent) {
            return res.status(404).json({ message: 'Agent non trouvé' });
        }

        // Récupérer le dernier relevé pour ce compteur
        const dernierReleve = await Releve.findOne({
            where: { compteur_id },
            order: [['date_heure', 'DESC']]
        });

        const index_precedent = dernierReleve ? dernierReleve.index_actuel : 0;
        const consommation = parseFloat(index_actuel) - parseFloat(index_precedent);

        // Créer le relevé
        const releve = await Releve.create({
            compteur_id,
            agent_id,
            index_actuel: parseFloat(index_actuel),
            index_precedent: parseFloat(index_precedent),
            consommation: consommation > 0 ? consommation : 0,
            date_heure: date_heure || new Date(),
            photo,
            anomalie: anomalie || false,
            commentaire,
            latitude,
            longitude
        });

        // Récupérer le relevé créé avec les relations
        const releveComplet = await Releve.findByPk(releve.id, {
            include: [
                {
                    model: Compteur,
                    as: 'compteur'
                },
                {
                    model: User,
                    as: 'agent',
                    attributes: ['id', 'nom', 'prenom', 'email', 'role']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Relevé créé avec succès',
            releve: releveComplet
        });
    } catch (error) {
        console.error('Erreur création relevé:', error);
        res.status(500).json({
            message: 'Erreur lors de la création du relevé',
            error: error.message
        });
    }
};

// @desc    Update releve
// @route   PUT /api/releves/:id
// @access  Private (SUPERADMIN only)
export const updateReleve = async (req, res) => {
    try {
        const releve = await Releve.findByPk(req.params.id);

        if (!releve) {
            return res.status(404).json({ message: 'Relevé non trouvé' });
        }

        const {
            index_actuel,
            anomalie,
            commentaire,
            photo
        } = req.body;

        // Recalculer la consommation si l'index change
        let consommation = releve.consommation;
        if (index_actuel && index_actuel !== releve.index_actuel) {
            consommation = parseFloat(index_actuel) - parseFloat(releve.index_precedent);
        }

        await releve.update({
            index_actuel: index_actuel || releve.index_actuel,
            consommation: consommation > 0 ? consommation : releve.consommation,
            anomalie: anomalie !== undefined ? anomalie : releve.anomalie,
            commentaire: commentaire || releve.commentaire,
            photo: photo || releve.photo
        });

        const releveUpdated = await Releve.findByPk(releve.id, {
            include: [
                {
                    model: Compteur,
                    as: 'compteur'
                },
                {
                    model: User,
                    as: 'agent',
                    attributes: ['id', 'nom', 'prenom', 'email', 'role']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Relevé mis à jour avec succès',
            releve: releveUpdated
        });
    } catch (error) {
        console.error('Erreur mise à jour relevé:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Delete releve
// @route   DELETE /api/releves/:id
// @access  Private (SUPERADMIN only)
export const deleteReleve = async (req, res) => {
    try {
        const releve = await Releve.findByPk(req.params.id);

        if (!releve) {
            return res.status(404).json({ message: 'Relevé non trouvé' });
        }

        await releve.destroy();

        res.json({
            success: true,
            message: 'Relevé supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression relevé:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get releves statistics
// @route   GET /api/releves/stats
// @access  Private
export const getRelevesStats = async (req, res) => {
    try {
        const totalReleves = await Releve.count();
        const relevesAvecAnomalie = await Releve.count({ where: { anomalie: true } });

        const consommationTotale = await Releve.sum('consommation');
        const consommationMoyenne = totalReleves > 0 ? consommationTotale / totalReleves : 0;

        res.json({
            total: totalReleves,
            anomalies: relevesAvecAnomalie,
            consommation_totale: parseFloat(consommationTotale || 0).toFixed(2),
            consommation_moyenne: parseFloat(consommationMoyenne).toFixed(2)
        });
    } catch (error) {
        console.error('Erreur stats relevés:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
