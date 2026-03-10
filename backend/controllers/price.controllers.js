/**
 * PRICE CONTROLLERS
 * ======================================
 *
 * Required imports:
 * - MarketPrice, PriceHistory models from '../models/index.js'
 * - pricePollingService from '../services/pricePoller.js'
 *
 * NOTE: These routes are PUBLIC (no authentication required)
 */

import { MarketPrice, PriceHistory } from "../models/index.js";
import pricePollingService from "../services/pricePoller.js";

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
  try {
    const prices = await pricePollingService.getAllPrices();

    res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching all prices:", error);
    res.status(500).json({
      error: "Failed to fetch prices",
      message: error.message,
    });
  }
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
  try {
    const { symbol } = req.params;

    const marketPrice = await MarketPrice.findOne({
      symbol: symbol.toUpperCase(),
    });

    if (!marketPrice) {
      return res.status(404).json({
        error: "Symbol not found",
        message: `No price data available for symbol: ${symbol.toUpperCase()}`,
      });
    }

    res.status(200).json(marketPrice);
  } catch (error) {
    console.error(`Error fetching price for ${req.params.symbol}:`, error);
    res.status(500).json({
      error: "Failed to fetch price",
      message: error.message,
    });
  }
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
  try {
    const { symbol } = req.params;
    const { interval = "1h", limit = 100 } = req.query;

    const validIntervals = ["1m", "5m", "15m", "1h", "4h", "1d"];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({
        error: "Invalid interval",
        message: `Interval must be one of: ${validIntervals.join(", ")}`,
        received: interval,
      });
    }

    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
      return res.status(400).json({
        error: "Invalid limit",
        message: "Limit must be a number between 1 and 1000",
        received: limit,
      });
    }

    const priceHistory = await PriceHistory.findOne({
      symbol: symbol.toUpperCase(),
      interval,
    });

    if (!priceHistory) {
      return res.status(404).json({
        error: "History not found",
        message: `No price history available for ${symbol.toUpperCase()} with interval ${interval}`,
      });
    }

    const dataPoints = priceHistory.getLatestDataPoints(parsedLimit);

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      interval,
      data: dataPoints,
      count: dataPoints.length,
    });
  } catch (error) {
    console.error(`Error fetching price history for ${req.params.symbol}:`, error);
    res.status(500).json({
      error: "Failed to fetch price history",
      message: error.message,
    });
  }
};
