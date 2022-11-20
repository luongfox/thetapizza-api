import '../boostrap.js';
import Theta from '../services/theta.js';
import Stake from '../models/stake.js';

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
      await Stake.saveMany(items);
      i += range;
    }
  }
  await Stake.deleteAll();
  await persistStakes(await Theta.getTfuelStakings());
  await persistStakes(await Theta.getThetaStakings());
}
  