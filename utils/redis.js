import redis from 'redis';
import { promisify } from 'util';

/**
 * Represents a Redis client for interacting with a Redis server.
 */

class RedisClient {
  /**
   * Creates a new RedisClient instance.
   * Any error of the redis client is displayed in the console.
   */
  constructor() {
    // Create a new Redis client
    this.client = redis.createClient();

    // Display an error message if the client is not connected to the server
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to server: ${error}`);
    });
  }

  // Check if the client is connected to the server
  isAlive() {
    if (this.client.connected) {
      return true;
    }
    return false;
  }

  /**
   * Retrieves the value stored for the given key in Redis.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<any>} A promise that resolves with the value retrieved from Redis,
   *        or rejects with an error.
   */
  async get(key) {
    const redisGet = promisify(this.client.get).bind(this.client);
    const value = await redisGet(key);
    return value;
  }

  /**
     * Stores the given value in Redis under the given key.
     * @param {string} key - The key to store the value under.
     * @param {string} value - The value to store.
     * @param {number} duration - The duration to store the value for.
     * @returns {void}
     */
  async set(key, value, duration) {
    const redisSet = promisify(this.client.set).bind(this.client);
    await redisSet(key, value);
    await this.client.expire(key, duration);
  }

  /**
     * Removes the given key from Redis.
     * @param {string} key - The key to remove.
     * @returns {void}
     */
  async del(key) {
    const redisDel = promisify(this.client.del).bind(this.client);
    await redisDel(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
