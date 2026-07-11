import express from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegister, validateLogin } from '../validators/auth.validator';

const router = express.Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);

export default router;
