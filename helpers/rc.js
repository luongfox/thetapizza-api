import { createClient } from 'redis';

export default class RC {

  static #client = null;

  static async getClient() {
    if (!this.#client) {
      this.#client = createClient({ url: process.env.REDIS_URL });
      await this.#client.connect();
    }
    return this.#client;
  }

  static async get(key) {
    const client = await this.getClient();
    return await client.get(key);
  }

  static async set(key, value, expire = null) {
    const client = await this.getClient();
    if (expire) {
      await client.set(key, value, { EX: expire });
    } else {
      await client.set(key, value);
    }
  }

}
