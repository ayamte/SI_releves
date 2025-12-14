import Client from '../models/Client.js';
import { Op } from 'sequelize';

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getAllClients = async (req, res) => {
    try {
        const { search, active } = req.query;

        const where = {};
        if (search) {
            where[Op.or] = [
                { nom: { [Op.like]: `%${search}%` } },
                { prenom: { [Op.like]: `%${search}%` } },
                { cin: { [Op.like]: `%${search}%` } },
                { telephone: { [Op.like]: `%${search}%` } }
            ];
        }
        if (active !== undefined) where.active = active === 'true';

        const clients = await Client.findAll({
            where,
            order: [['nom', 'ASC'], ['prenom', 'ASC']]
        });

        res.json(clients);
    } catch (error) {
        console.error('Erreur récupération clients:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        res.json(client);
    } catch (error) {
        console.error('Erreur récupération client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private (SUPERADMIN only)
export const createClient = async (req, res) => {
    try {
        const {
            nom,
            prenom,
            cin,
            telephone,
            email,
            adresse_principale,
            quartier,
            ville
        } = req.body;

        // Vérifier si le CIN existe déjà (si fourni)
        if (cin) {
            const existingClient = await Client.findOne({ where: { cin } });
            if (existingClient) {
                return res.status(400).json({ message: 'Un client avec ce CIN existe déjà' });
            }
        }

        const client = await Client.create({
            nom: nom.toUpperCase(),
            prenom: prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase(),
            cin,
            telephone,
            email,
            adresse_principale,
            quartier,
            ville: ville || 'Rabat',
            active: true
        });

        res.status(201).json({
            success: true,
            message: 'Client créé avec succès',
            client
        });
    } catch (error) {
        console.error('Erreur création client:', error);
        res.status(500).json({
            message: 'Erreur lors de la création du client',
            error: error.message
        });
    }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (SUPERADMIN only)
export const updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        const {
            nom,
            prenom,
            cin,
            telephone,
            email,
            adresse_principale,
            quartier,
            ville,
            active
        } = req.body;

        // Vérifier si le nouveau CIN existe déjà (si changé)
        if (cin && cin !== client.cin) {
            const existingClient = await Client.findOne({ where: { cin } });
            if (existingClient) {
                return res.status(400).json({ message: 'Un client avec ce CIN existe déjà' });
            }
        }

        await client.update({
            nom: nom ? nom.toUpperCase() : client.nom,
            prenom: prenom ? (prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase()) : client.prenom,
            cin: cin || client.cin,
            telephone: telephone || client.telephone,
            email: email || client.email,
            adresse_principale: adresse_principale || client.adresse_principale,
            quartier: quartier || client.quartier,
            ville: ville || client.ville,
            active: active !== undefined ? active : client.active
        });

        res.json({
            success: true,
            message: 'Client mis à jour avec succès',
            client
        });
    } catch (error) {
        console.error('Erreur mise à jour client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Delete client (soft delete)
// @route   DELETE /api/clients/:id
// @access  Private (SUPERADMIN only)
export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        // Soft delete: marquer comme inactif
        await client.update({ active: false });

        res.json({
            success: true,
            message: 'Client désactivé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
