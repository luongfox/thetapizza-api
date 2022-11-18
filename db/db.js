import { MONGO_URL, MONGO_DB } from '../helper/constants.js';
import { MongoClient } from 'mongodb';

export default class DB {

  static async useMongo(fx) {
    const mongoClient = new MongoClient(MONGO_URL);
    try {
      await mongoClient.connect();
      const db = mongoClient.db(MONGO_DB);
      await fx(db);
    } finally {
      await mongoClient.close();
    }
  }
}