/**
 * PRICE CONTROLLERS - TO BE IMPLEMENTED
 * ======================================
 * 
 * Required imports:
 * - MarketPrice, PriceHistory models from '../models/index.js'
 * - pricePollingService from '../services/pricePoller.js'
 * 
 * NOTE: These routes are PUBLIC (no authentication required)
 */

/**
 * 1. GET /api/prices
 * getAllPrices(req, res)
 * 
 * Purpose: Get current prices for all tracked cryptocurrencies
 * Response: Array of market prices [{
 *   symbol, price, marketCap, volume24h, 
 *   percentChange1h, percentChange24h, percentChange7d,
 *   lastUpdated, rank
 * }]
 * 
 * Can use: pricePollingService.getCurrentPrices() or MarketPrice.find()
 */
export const getAllPrices = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getAllPrices needs to be implemented',
    hint: 'Use pricePollingService.getCurrentPrices() or MarketPrice.find()'
  });
};

/**
 * 2. GET /api/prices/:symbol
 * getPriceBySymbol(req, res)
 * 
 * Purpose: Get current price for a specific cryptocurrency
 * Params: req.params.symbol (e.g., 'BTC', 'ETH')
 * Response: Single market price object or 404 if not found
 */
export const getPriceBySymbol = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getPriceBySymbol needs to be implemented',
    hint: 'Find MarketPrice by symbol (case-insensitive), return 404 if not found'
  });
};

/**
 * 3. GET /api/prices/:symbol/history
 * getPriceHistory(req, res)
 * 
 * Purpose: Get historical price data for charting
 * Params: req.params.symbol
 * Query params:
 *   - interval: '1m', '5m', '15m', '1h', '4h', '1d' (default: '1h')
 *   - limit: number of data points (default: 100, max: 1000)
 * Response: {
 *   symbol,
 *   interval,
 *   data: [{ timestamp, open, high, low, close, volume }]
 * }
 */
export const getPriceHistory = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getPriceHistory needs to be implemented',
    hint: 'Find PriceHistory by symbol and interval, use getLatestDataPoints(limit)'
  });
};
