import { Router } from 'express';
import { authMiddleware } from '../controllers/auth.controllers.js';
import {
  getTransactions,
  getTransactionStats,
  getPortfolio,
  getHoldings,
} from '../controllers/portfolio.controllers.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Transaction routes
router.get('/transactions', getTransactions);
router.get('/transactions/stats', getTransactionStats);

// Portfolio routes
router.get('/portfolio', getPortfolio);
router.get('/holdings', getHoldings);

export default router;
