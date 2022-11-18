import ThetaApi from '../api/theta-api.js';
import DB from '../db/db.js';
import StakeDao from '../db/stake-dao.js';

(async () => {
  await DB.useMongo(main).catch(console.error);
  process.exit(0);
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
  await persistStakes(await ThetaApi.getTfuelStakings());
  await persistStakes(await ThetaApi.getThetaStakings());
}
  