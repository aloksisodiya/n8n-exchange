import { Router } from 'express';
import {
  getAllPrices,
  getPriceBySymbol,
  getPriceHistory,
} from '../controllers/price.controllers.js';

const router = Router();

// Public routes (no auth required for price data)
router.get('/', getAllPrices);
router.get('/:symbol', getPriceBySymbol);
router.get('/:symbol/history', getPriceHistory);

export default router;
