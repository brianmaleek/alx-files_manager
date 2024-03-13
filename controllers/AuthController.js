// Import sha1 from the hashing library
import sha1 from 'sha1';
// Import uuidv4 from the UUID library
import { v4 as uuidv4 } from 'uuid';
// Import the Redis client from the utils folder
import redisClient from '../utils/redis';
// Import the MongoDB client from the utils folder
import dbClient from '../utils/db';

/**
 * Controller class for managing authentication-related endpoints.
 */
class AuthController {
  /**
   * Signs in the user and generates an authentication token.
   * @param {Object} request - The request object.
   * @param {Object} response - The response object.
   * @returns {void}
   */
  static async getConnect(request, response) {
    try {
      const authHeader = request.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return response.status(401).send({ error: 'Unauthorized' });
      }

      // Extract the email and password from the Authorization header
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const email = auth[0];
      const password = auth[1];

      // Check if the email and password are missing
      if (!email || !password) {
        return response.status(401).send({ error: 'Unauthorized' });
      }

      // Hash the user password using sha1
      const hashedPassword = sha1(password);
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      // Check if the user exists
      if (!user) {
        return response.status(401).send({ error: 'Unauthorized' });
      }

      // Randomly generate the authentication token
      const token = uuidv4();

      // Store the authentication token in Redis
      const redisKey = `auth_${token}`;
      const redisUserValue = user._id.toString();
      const duration = 86400; // 24 hours * 60 minutes * 60 seconds

      // Store the authentication token in Redis with an expiration of 24 hours
      await redisClient.set(redisKey, redisUserValue, duration);
      return response.status(200).send({ token });
    } catch (error) {
      console.error('AuthController.getConnect', error);
      return response.status(500).send({ error: 'Internal Server Error' });
    }
  }

  /**
   * Signs out the user based on the token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {void}
   */
  static async getDisconnect(request, response) {
    try {
      const token = request.header('X-Token');
      if (!token) {
        return response.status(401).send({ error: 'Unauthorized' });
      }

      const redisToken = await redisClient.get(`auth_${token}`);
      if (!redisToken) {
        return response.status(401).send({ error: 'Unauthorized' });
      }

      await redisClient.delAsync(`auth_${token}`);
      return response.status(204).send();
    } catch (error) {
      console.error('AuthController.getDisconnect', error);
      return response.status(500).send({ error: 'Internal Server Error' });
    }
  }
}

// Export the AuthController class
module.exports = AuthController;
