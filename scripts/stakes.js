import { getTfuelStakings, getThetaStakings } from '../api/theta.js';
import { useDb } from '../db/db.js';

(async () => {
  await main().catch(console.error);
  process.exit();
})();

async function main() {
  const { connection, db } = await useDb();
  try {
    await db.collection('stakes').deleteMany({});
    const persistStakes = async (stakes) => {
      const range = 20;
      let i = 0;
      let n = stakes.length;
      while (i < n) {
        const items = stakes.slice(i, i + range);
        await db.collection('stakes').insertMany(items);
        i += range;
      }
    }
    await persistStakes(await getTfuelStakings());
    await persistStakes(await getThetaStakings());
    
  } catch(err) {
    console.log(err);
    return false;
  }
  return true;
}
  