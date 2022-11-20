import MDB from './mdb.js';

export default class Transaction {

  static #collection = 'transactions';

  static async upsert(item) {
    const collection = await MDB.use(this.#collection);
    return await collection.updateOne(
      { _id: item._id },
      { $set: item },
      { upsert: true }
    );
  }
}