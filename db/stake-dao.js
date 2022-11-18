export default class StakeDao {

  constructor(db) {
    this.db = db;
    this.table = 'stakes';
  }

  async deleteAll() {
    await this.db.collection(this.table).deleteMany({});
    return true;
  }

  async saveMany(stakes) {
    await this.db.collection(this.table).insertMany(stakes);
    return true;
  }

  async countNodeTypes() {
    const result = await this.db.collection(this.table).aggregate([
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