/**
 * PORTFOLIO CONTROLLERS - TO BE IMPLEMENTED
 * ==========================================
 * 
 * Required imports:
 * - Transaction, Portfolio, User models from '../models/index.js'
 * 
 * All functions receive (req, res):
 * - req.user contains { uid, email } from authMiddleware
 */

/**
 * 1. GET /api/portfolio/transactions
 * getTransactions(req, res)
 * 
 * Purpose: Get transaction history for the user
 * Access: req.user.uid
 * Query params:
 *   - limit (default: 50)
 *   - offset (default: 0)
 *   - symbol (optional): filter by cryptocurrency symbol
 *   - type (optional): 'buy' or 'sell'
 *   - startDate, endDate (optional): date range filter
 * Response: Array of transactions sorted by timestamp desc
 */
export const getTransactions = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getTransactions needs to be implemented',
    hint: 'Find Transactions by userId with filters (symbol, type, date range) and pagination'
  });
};

/**
 * 2. GET /api/portfolio/transactions/stats
 * getTransactionStats(req, res)
 * 
 * Purpose: Get aggregated transaction statistics
 * Access: req.user.uid
 * Query params:
 *   - period (optional): 'day', 'week', 'month', 'all' (default: 'all')
 * Response: {
 *   totalTransactions,
 *   totalBuys,
 *   totalSells,
 *   totalVolume,
 *   totalProfitLoss,
 *   bySymbol: { BTC: {...}, ETH: {...} }
 * }
 */
export const getTransactionStats = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getTransactionStats needs to be implemented',
    hint: 'Use Transaction.getUserTransactionStats(userId) or custom aggregation'
  });
};

/**
 * 3. GET /api/portfolio/portfolio
 * getPortfolio(req, res)
 * 
 * Purpose: Get complete portfolio with wallet balance and holdings
 * Access: req.user.uid
 * Response: {
 *   user: { uid, email, wallet: { balance, currency } },
 *   portfolio: { holdings: [], totalValue, totalCost, totalProfitLoss }
 * }
 */
export const getPortfolio = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getPortfolio needs to be implemented',
    hint: 'Find User by uid and Portfolio by userId, calculate totals'
  });
};

/**
 * 4. GET /api/portfolio/holdings
 * getHoldings(req, res)
 * 
 * Purpose: Get just the holdings array (faster than full portfolio)
 * Access: req.user.uid
 * Response: Array of holdings [{ symbol, quantity, averageBuyPrice, currentPrice, profitLoss, profitLossPercent }]
 */
export const getHoldings = async (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'getHoldings needs to be implemented',
    hint: 'Find Portfolio by userId and return holdings array'
  });
};
