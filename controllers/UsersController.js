// Import sha1 from the hashing library
import sha1 from 'sha1';
// Import the MongoDB client from the utils folder
import dbClient from '../utils/db';

/**
 * Controller class for managing user-related endpoints.
 */
class UsersController {
  /**
   * Creates a new user in the database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {void}
   */
  static async postNew(req, res) {
    // Extract the user email and password from the request body
    const { email, password } = req.body;

    console.log('email:', email);
    console.log('password:', password);

    if (!email) {
      console.log('User email:', email, 'is missing');

      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      console.log('User password:', password, 'is missing');

      return res.status(400).send({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists in the database
      const userEmailExists = await dbClient.db.collection('users').findOne({ email });
      if (userEmailExists) {
        return res.status(400).send({ error: 'Email already exists' });
      }

      // Hash the user password using sha1
      const hashedPassword = sha1(password);

      // Create a new user object
      const newUser = { email, password: hashedPassword };

      console.log('User object:', newUser);

      // Insert the new user into the database
      const userInsertDatabase = await dbClient.db.collection('users').insertOne(newUser);

      // Return the newly created user's ID and email
      return res.status(201).send({ email, id: userInsertDatabase.insertedId });
    } catch (error) {
      console.error('Error creating new user:', error);
      return res.status(500).send({ error: 'Error creating user' });
    }
  }
}

module.exports = UsersController;
