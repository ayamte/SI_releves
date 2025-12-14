import express from 'express';
import { check } from 'express-validator';
import {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} from '../controllers/client.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', protect, getAllClients);
router.get('/:id', protect, getClientById);

// Routes admin uniquement
router.post(
    '/',
    protect,
    authorize('SUPERADMIN'),
    [
        check('nom', 'Le nom est requis').notEmpty(),
        check('prenom', 'Le prénom est requis').notEmpty(),
        check('telephone', 'Le téléphone est requis').notEmpty(),
        check('adresse_principale', 'L\'adresse est requise').notEmpty(),
        validate
    ],
    createClient
);

router.put(
    '/:id',
    protect,
    authorize('SUPERADMIN'),
    updateClient
);

router.delete(
    '/:id',
    protect,
    authorize('SUPERADMIN'),
    deleteClient
);

export default router;
