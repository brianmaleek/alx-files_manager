import { MongoClient } from 'mongodb';

/**
 * Represents a MongoDB client for interacting with a MongoDB server.
 */
class DBClient {
  /**
   * Creates a new DBClient instance.
   * The client connects to MongoDB using the provided or default connection options.
   * @constructor
   */
  constructor() {
    // MongoDB connection options
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    // Create a MongoDB client
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Connect to the MongoDB server
    this.client.connect()
      .then(() => {
        // If connection is successful, initialize the database object
        this.db = this.client.db(database);
        console.log('Connection to MongoDB initiated');
      })
      .catch((error) => {
        // If connection is unsuccessful, display an error message and exit the process
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
      });
  }

  // Returns the MongoDB client if the connection is active
  isAlive() {
    if (this.client.connected) {
      return true;
    }
    return false;
  }

  /**
   * Retrieves the number of documents in the 'users' collection.
   * @returns {Promise<number>} A promise that resolves with the number of documents
   *        in the 'users' collection, or rejects with an error.
   */
  async nbUsers() {
    const users = this.db.collection('users');
    const userDocCount = await users.countDocuments();
    return userDocCount;
  }

  /**
   * Retrieves the number of documents in the 'files' collection.
   * @returns {Promise<number>} A promise that resolves with the number of documents
   *        in the 'files' collection, or rejects with an error.
   */
  async nbFiles() {
    const files = this.db.collection('files');
    const fileDocCount = await files.countDocuments();
    return fileDocCount;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
