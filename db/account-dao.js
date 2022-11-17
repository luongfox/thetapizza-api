export const AccountDao = class {

  constructor(db) {
    this.db = db;
    this.table = 'accounts';
  }

  async getAll() {
    const objects = await this.db.collection(this.table).find().toArray();
    const accounts = [];
    for (const each of objects) {
      accounts[each._id] = each;
    }
    return accounts;
  }
}