import { getCoins, getTVL } from '../api/prices.js';
import { getStakeBySourceAndHolder } from '../api/theta.js';

(async () => {
  const data = await getStakeBySourceAndHolder('0x25c8629c2a5b4fd2407c420d8debd0a2916bf54b', '0x00163a6949a9197e44f7ecb614e75eed26797881');
  console.log(data);
})();

