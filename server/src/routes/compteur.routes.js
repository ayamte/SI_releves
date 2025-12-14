import express from 'express';
import { check } from 'express-validator';
import {
    getAllCompteurs,
    getCompteurById,
    createCompteur,
    updateCompteur,
    deleteCompteur,
    getCompteursStats
} from '../controllers/compteur.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Routes publiques (protégées par authentification)
router.get('/', protect, getAllCompteurs);
router.get('/stats', protect, getCompteursStats);
router.get('/:id', protect, getCompteurById);

// Routes admin uniquement
router.post(
    '/',
    protect,
    authorize('SUPERADMIN'),
    [
        check('user_id', 'L\'utilisateur est requis').isInt(),
        check('type_fluide', 'Le type de fluide est requis').isIn(['EAU', 'ELEC']),
        check('adresse', 'L\'adresse est requise').notEmpty(),
        validate
    ],
    createCompteur
);

router.put(
    '/:id',
    protect,
    authorize('SUPERADMIN'),
    updateCompteur
);

router.delete(
    '/:id',
    protect,
    authorize('SUPERADMIN'),
    deleteCompteur
);

export default router;
