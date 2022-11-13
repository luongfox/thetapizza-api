import { MONGO_URL } from '../helper/constants.js';
import { MongoClient } from 'mongodb';

export const useDb = async function() {
  const connection = await MongoClient.connect(MONGO_URL);
  const db = await connection.db('theta');
  return { connection, db };
}