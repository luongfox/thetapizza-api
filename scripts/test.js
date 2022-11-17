import { useDb } from '../db/db.js';
import { AccountDao } from '../db/account-dao.js';

(async () => {
  await useDb(main).catch(console.error);
})();

async function main(db) {
  const accountDao = new AccountDao(db);
  const accounts = await accountDao.getAll();
  console.log(accounts);
}