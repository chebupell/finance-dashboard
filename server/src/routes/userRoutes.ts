import express from 'express';
const router = express.Router();
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth.middleware';

router.get('/', authMiddleware, userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.delete('/:id', authMiddleware, userController.delete);

export default router;
