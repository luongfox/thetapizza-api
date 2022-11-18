export default class TransactionDao {

  constructor(db) {
    this.db = db;
    this.table = 'transactions';
  }

  async upsert(item) {
    return await this.db.collection(this.table).updateOne(
      { _id: item._id },
      { $set: item },
      { upsert: true }
    );
  }
}