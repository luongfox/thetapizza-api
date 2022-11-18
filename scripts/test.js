import { useDb } from '../db/db.js';
import ThetaApi from '../api/theta-api.js';
import PriceApi from '../api/price-api.js';
import DataFactory from '../helper/data-factory.js';

(async () => {
  await useDb(main).catch(console.error);
  process.exit();
})();

async function main(db) {
  console.log(await PriceApi.getTVL());
  
}