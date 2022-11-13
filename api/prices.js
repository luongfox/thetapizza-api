import { CMC_KEY, CMC_ENDPOINT, DL_ENDPOINT } from '../helper/constants.js';
import axios from 'axios';

export const getCoins = async () => {
  const url = CMC_ENDPOINT + '/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=' + CMC_KEY + '&symbol=BTC,THETA,TFUEL,TDROP';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    const data = response.data.data;
    const coins = [];
    for (const name in data) {
      const each = data[name][0];
      coins[name] = {
        rank: each.cmc_rank,
        max_supply: each.max_supply,
        circulating_supply: each.circulating_supply,
        total_supply: each.total_supply,
        price: each.quote['USD']['price'],
        volume_24h: each.quote['USD']['volume_24h'],
        volume_change_24h: each.quote['USD']['volume_change_24h'],
        market_cap: each.quote['USD']['market_cap'],
      };
    }
    return coins;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getTVL = async () => {
  const url = DL_ENDPOINT + '/charts/theta';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    const data = response.data;
    const todayStat = data[data.length - 1]['totalLiquidityUSD'];
    const yesterdayStat = data[data.length - 2]['totalLiquidityUSD'];
    return {
      tvl: todayStat,
      tvl_change_24h: (yesterdayStat - todayStat)
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

