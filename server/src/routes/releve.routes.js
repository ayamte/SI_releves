import express from 'express';
import { check } from 'express-validator';
import {
    getAllReleves,
    getReleveById,
    createReleve,
    updateReleve,
    deleteReleve,
    getRelevesStats
} from '../controllers/releve.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', protect, getAllReleves);
router.get('/stats', protect, getRelevesStats);
router.get('/:id', protect, getReleveById);

// Routes pour création (SUPERADMIN et AGENT)
router.post(
    '/',
    protect,
    authorize('SUPERADMIN', 'AGENT'),
    [
        check('compteur_id', 'L\'ID du compteur est requis').notEmpty(),
        check('agent_id', 'L\'ID de l\'agent est requis').isInt(),
        check('index_actuel', 'L\'index actuel est requis').isNumeric(),
        validate
    ],
    createReleve
);

// Routes admin uniquement
router.put(
    '/:id',
    protect,
    authorize('SUPERADMIN'),
    updateReleve
);

router.delete(
    '/:id',
    protect,
    authorize('SUPERADMIN'),
    deleteReleve
);

export default router;
