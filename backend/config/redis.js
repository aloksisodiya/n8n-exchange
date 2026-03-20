import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (!process.env.REDIS_ENABLED || process.env.REDIS_ENABLED === "false") {
      console.log("⚠️  Redis caching disabled");
      return this;
    }

    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.log("❌ Redis: Max reconnection attempts reached");
              return new Error("Max reconnection attempts");
            }
            return retries * 100;
          },
        },
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("✅ Redis connected");
      });

      this.client.on("error", (err) => {
        console.error("❌ Redis error:", err.message);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        console.log("🔌 Redis connection closed");
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
      return this;
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error.message);
      this.isConnected = false;
      return this;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log("🔌 Redis disconnected");
    }
  }

  // Get value from cache
  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error.message);
      return null;
    }
  }

  // Set value in cache with optional TTL (in seconds)
  async set(key, value, ttl = 3600) {
    if (!this.isConnected || !this.client) return false;
    try {
      const options = { EX: ttl };
      await this.client.set(key, JSON.stringify(value), options);
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error.message);
      return false;
    }
  }

  // Delete key from cache
  async del(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error.message);
      return false;
    }
  }

  // Delete multiple keys matching pattern
  async delPattern(pattern) {
    if (!this.isConnected || !this.client) return 0;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      console.error(`Redis DELPATTERN error for pattern ${pattern}:`, error.message);
      return 0;
    }
  }

  // Increment counter
  async incr(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error.message);
      return null;
    }
  }

  // Expire key after seconds
  async expire(key, seconds) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error.message);
      return false;
    }
  }

  // Push to list
  async lpush(key, values) {
    if (!this.isConnected || !this.client) return false;
    try {
      const stringValues = Array.isArray(values)
        ? values.map((v) => JSON.stringify(v))
        : [JSON.stringify(values)];
      await this.client.lPush(key, stringValues);
      return true;
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error.message);
      return false;
    }
  }

  // Get list range
  async lrange(key, start, stop) {
    if (!this.isConnected || !this.client) return [];
    try {
      const values = await this.client.lRange(key, start, stop);
      return values.map((v) => JSON.parse(v));
    } catch (error) {
      console.error(`Redis LRANGE error for key ${key}:`, error.message);
      return [];
    }
  }

  // Flush all
  async flushAll() {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.flushAll();
      console.log("🗑️  Redis: All data flushed");
      return true;
    } catch (error) {
      console.error("Redis FLUSHALL error:", error.message);
      return false;
    }
  }
}

// Export singleton instance
const redisClient = new RedisClient();
export default redisClient;
