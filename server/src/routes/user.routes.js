import express from 'express';
import { check } from 'express-validator';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All routes are protected and restricted to Admin/SuperAdmin
router.use(protect);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.route('/')
    .get(getUsers)
    .post(
        [
            check('nom', 'Le nom est requis').not().isEmpty(),
            check('prenom', 'Le prénom est requis').not().isEmpty(),
            check('email', 'Veuillez fournir un email valide').isEmail(),
            // Le mot de passe n'est plus requis car il est généré automatiquement
            validate
        ],
        createUser
    );

router.route('/:id')
    .get(getUserById)
    .put(
        [
            check('nom', 'Le nom est requis').optional().not().isEmpty(),
            check('prenom', 'Le prénom est requis').optional().not().isEmpty(),
            validate
        ],
        updateUser
    )
    .delete(deleteUser);

// Route pour réinitialiser le mot de passe
router.post('/:id/reset-password', resetPassword);

export default router;
