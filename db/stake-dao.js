export const StakeDao = class {

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

}