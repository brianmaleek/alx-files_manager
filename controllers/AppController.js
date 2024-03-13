// Import the Redis client from the utils folder
import redisClient from '../utils/redis';
// Import the MongoDB client from the utils folder
import dbClient from '../utils/db';

/**
 * Controller class for handling application-level logic and managing endpoints.
 */
class AppController {
  /**
   * Retrieves the status of Redis and the database (MongoDB).
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {void}
   */
  static getStatus(req, res) {
    // Check if Redis and MongoDB are alive
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    return res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  /**
   * Retrieves statistics such as the number of users and files in the database (MongoDB).
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {void}
   */
  static async getStats(req, res) {
    // Retrieve the total number of users and files from the database
    const userCountTotal = await dbClient.nbUsers();
    const fileCountTotal = await dbClient.nbFiles();
    // Return the statistics with status 200
    return res.status(200).json({ users: userCountTotal, files: fileCountTotal });
  }
}

// Export the AppController class
module.exports = AppController;
