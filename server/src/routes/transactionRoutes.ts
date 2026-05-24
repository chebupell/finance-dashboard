import express from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateTransaction } from '../validators/transaction.validator';

const router = express.Router();

router.get('/', authMiddleware, TransactionController.getAll);
router.post('/', authMiddleware, validateTransaction, TransactionController.create);
router.delete('/:id', authMiddleware, TransactionController.delete);

export default router;
