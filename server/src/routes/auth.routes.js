import express from 'express';
import { check } from 'express-validator';
import { login, getMe, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post(
    '/login',
    [
        check('email', 'Veuillez fournir un email valide').isEmail(),
        check('password', 'Le mot de passe est requis').exists(),
        validate
    ],
    login
);

router.get('/me', protect, getMe);

router.put(
    '/change-password',
    protect,
    [
        check('oldPassword', 'L\'ancien mot de passe est requis').exists(),
        check('newPassword', 'Le nouveau mot de passe doit contenir au moins 6 caractères')
            .isLength({ min: 6 }),
        validate
    ],
    changePassword
);

export default router;
