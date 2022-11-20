import '../boostrap.js';
import MDB from '../models/mdb.js';
import RC from '../helpers/rc.js';
import Account from '../models/account.js';
import Factory from '../services/factory.js';

(async () => {
  await main();
  process.exit();
})();

async function main() {
  console.log(await Factory.getCoins());
}