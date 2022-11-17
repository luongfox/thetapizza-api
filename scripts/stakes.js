import { getTfuelStakings, getThetaStakings } from '../api/theta.js';
import { useDb } from '../db/db.js';
import { StakeDao } from '../db/stake-dao.js';

(async () => {
  await useDb(main).catch(console.error);
})();

async function main(db) {
  const stakeDao = new StakeDao(db);
  const persistStakes = async (stakes) => {
    const range = 20;
    let i = 0;
    let n = stakes.length;
    while (i < n) {
      const items = stakes.slice(i, Math.min(n, i + range));
      await stakeDao.saveMany(items);
      i += range;
    }
  }
  await stakeDao.deleteAll();
  await persistStakes(await getTfuelStakings());
  await persistStakes(await getThetaStakings());
}
  