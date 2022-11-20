import MDB from './mdb.js';

export default class Account {

  static #collection = 'accounts';

  static async getAll() {
    const collection = await MDB.use(this.#collection);
    const objects = await collection.find().toArray();
    const accounts = [];
    for (const each of objects) {
      accounts[each._id] = each;
    }
    return accounts;
  }
}