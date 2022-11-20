import { MongoClient } from 'mongodb';

export default class MDB {

  static #db = null;

  static async getDb() {
    if (!this.#db) {
      const mongoClient = new MongoClient(process.env.MONGO_URL);
      await mongoClient.connect();
      this.#db = await mongoClient.db(process.env.MONGO_DB);
    }
    return this.#db;
  }

  static async use(collection) {
    const db = await this.getDb();
    return await db.collection(collection);
  }
}