import DB from '../db/db.js';
import ThetaApi from '../api/theta-api.js';
import PriceApi from '../api/price-api.js';
import Factory from '../helper/factory.js';
import Contract from '../helper/contract.js';
import { THETA_EXPLORER_ENDPOINT, TDROP_CONTRACT_ID, TDROP_STAKING_ADDRESS } from '../helper/constants.js';
import Utils from '../helper/utils.js';


(async () => {
  await DB.useMongo(main).catch(console.error);
  process.exit();
})();

async function main(db) {
  console.log(Utils.formatNumber(0.005279919890236563, 5));
}