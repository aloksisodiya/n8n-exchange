import redisClient from "../config/redis.js";

class CacheService {
  // Cache key prefixes
  static PREFIXES = {
    PRICE: "price:",
    POSITION: "position:",
    USER: "user:",
    PORTFOLIO: "portfolio:",
    WORKFLOW: "workflow:",
    EXECUTION: "execution:",
  };

  /**
   * Get cached data or fetch from source
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to call if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>}
   */
  static async getOrFetch(key, fetchFn, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await redisClient.get(key);
      if (cached) {
        console.log(`✅ Cache HIT: ${key}`);
        return cached;
      }

      // Cache miss - fetch from source
      console.log(`⚠️  Cache MISS: ${key}`);
      const data = await fetchFn();

      // Store in cache
      if (data) {
        await redisClient.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error.message);
      // On error, try to call the fetch function directly
      try {
        return await fetchFn();
      } catch (e) {
        console.error("Failed to fetch data:", e.message);
        throw e;
      }
    }
  }

  // ============ PRICE CACHING ============
  static async cachePrice(symbol, priceData, ttl = 60) {
    const key = `${this.PREFIXES.PRICE}${symbol}`;
    return await redisClient.set(key, priceData, ttl);
  }

  static async getPrice(symbol) {
    const key = `${this.PREFIXES.PRICE}${symbol}`;
    return await redisClient.get(key);
  }

  static async invalidatePrices() {
    return await redisClient.delPattern(`${this.PREFIXES.PRICE}*`);
  }

  // ============ POSITION CACHING ============
  static async cachePosition(positionId, positionData, ttl = 1800) {
    const key = `${this.PREFIXES.POSITION}${positionId}`;
    return await redisClient.set(key, positionData, ttl);
  }

  static async getPosition(positionId) {
    const key = `${this.PREFIXES.POSITION}${positionId}`;
    return await redisClient.get(key);
  }

  static async invalidatePosition(positionId) {
    const key = `${this.PREFIXES.POSITION}${positionId}`;
    return await redisClient.del(key);
  }

  static async invalidateAllPositions() {
    return await redisClient.delPattern(`${this.PREFIXES.POSITION}*`);
  }

  // ============ USER CACHING ============
  static async cacheUser(userId, userData, ttl = 1800) {
    const key = `${this.PREFIXES.USER}${userId}`;
    return await redisClient.set(key, userData, ttl);
  }

  static async getUser(userId) {
    const key = `${this.PREFIXES.USER}${userId}`;
    return await redisClient.get(key);
  }

  static async invalidateUser(userId) {
    const key = `${this.PREFIXES.USER}${userId}`;
    return await redisClient.del(key);
  }

  // ============ PORTFOLIO CACHING ============
  static async cachePortfolio(userId, portfolioData, ttl = 1800) {
    const key = `${this.PREFIXES.PORTFOLIO}${userId}`;
    return await redisClient.set(key, portfolioData, ttl);
  }

  static async getPortfolio(userId) {
    const key = `${this.PREFIXES.PORTFOLIO}${userId}`;
    return await redisClient.get(key);
  }

  static async invalidatePortfolio(userId) {
    const key = `${this.PREFIXES.PORTFOLIO}${userId}`;
    return await redisClient.del(key);
  }

  // ============ WORKFLOW CACHING ============
  static async cacheWorkflow(workflowId, workflowData, ttl = 3600) {
    const key = `${this.PREFIXES.WORKFLOW}${workflowId}`;
    return await redisClient.set(key, workflowData, ttl);
  }

  static async getWorkflow(workflowId) {
    const key = `${this.PREFIXES.WORKFLOW}${workflowId}`;
    return await redisClient.get(key);
  }

  static async invalidateWorkflow(workflowId) {
    const key = `${this.PREFIXES.WORKFLOW}${workflowId}`;
    return await redisClient.del(key);
  }

  static async invalidateAllWorkflows() {
    return await redisClient.delPattern(`${this.PREFIXES.WORKFLOW}*`);
  }

  // ============ EXECUTION CACHING ============
  static async cacheExecution(executionId, executionData, ttl = 7200) {
    const key = `${this.PREFIXES.EXECUTION}${executionId}`;
    return await redisClient.set(key, executionData, ttl);
  }

  static async getExecution(executionId) {
    const key = `${this.PREFIXES.EXECUTION}${executionId}`;
    return await redisClient.get(key);
  }

  static async invalidateExecution(executionId) {
    const key = `${this.PREFIXES.EXECUTION}${executionId}`;
    return await redisClient.del(key);
  }

  // ============ LIST OPERATIONS FOR REAL-TIME DATA ============
  static async addToRecentList(listKey, value, maxSize = 100) {
    await redisClient.lpush(listKey, value);
    // Keep only recent items
    const list = await redisClient.lrange(listKey, 0, maxSize - 1);
    return list;
  }

  static async getRecentList(listKey, limit = 100) {
    return await redisClient.lrange(listKey, 0, limit - 1);
  }

  // ============ UTILITY METHODS ============
  static async clear() {
    return await redisClient.flushAll();
  }

  static isConnected() {
    return redisClient.isConnected;
  }
}

export default CacheService;
