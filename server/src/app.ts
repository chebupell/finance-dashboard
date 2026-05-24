import express from 'express';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/error.middleware';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

export default app;
