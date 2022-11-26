import '../boostrap.js';
import Theta from '../services/theta.js';
import Stake from '../models/stake.js';
import BigNumber from 'bignumber.js';
import { THETA_WEI } from '../helpers/constants.js';

(async () => {
  await main().catch(console.error);
  process.exit(0);
})();

async function main() {
  const persistStakes = async (stakes) => {
    const range = 20;
    let i = 0;
    let n = stakes.length;
    while (i < n) {
      const items = stakes.slice(i, Math.min(n, i + range));
      for (const item of items) {
        item.amount = parseFloat(new BigNumber(item.amount).dividedBy(new BigNumber(THETA_WEI)).toString());
      }
      await Stake.saveMany(items);
      i += range;
    }
  }
  await Stake.deleteAll();
  await persistStakes(await Theta.getTfuelStakings());
  await persistStakes(await Theta.getThetaStakings());
}
  