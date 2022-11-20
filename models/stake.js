import MDB from './mdb.js';

export default class Stake {

  static #collection = 'stakes';

  static async deleteAll() {
    const collection = await MDB.use(this.#collection);
    await collection.deleteMany({});
    return true;
  }

  static async saveMany(stakes) {
    const collection = await MDB.use(this.#collection);
    await collection.insertMany(stakes);
    return true;
  }

  static async countNodeTypes() {
    const collection = await MDB.use(this.#collection);
    const result = await collection.aggregate([
      { $match: { withdrawn: false } },
      { $group: { _id: { 'type': '$type', 'holder': '$holder' } } },
      { $group: { _id: '$_id.type', count: { $sum: 1 } } }
    ]).toArray();
    const nodes = {};
    for (const each of result) {
      nodes[each._id] = each.count;
    }
    return nodes;
  }
}