import Utils from '../helpers/utils.js';

export default class Pricing {

  static async getCoins() {
    return Utils.doSimpleRequest(process.env.CMC_ENDPOINT + '/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=' + process.env.CMC_KEY + '&symbol=BTC,THETA,TFUEL,TDROP', (data) => {
      const body = data['data']
      const coins = {};
      for (const name in body) {
        const each = body[name][0];
        coins[name] = {
          rank: each.cmc_rank,
          max_supply: each.max_supply,
          circulating_supply: each.circulating_supply,
          total_supply: each.total_supply,
          price: each.quote['USD']['price'],
          price_change_24h: each.quote['USD']['percent_change_24h'],
          volume_24h: each.quote['USD']['volume_24h'],
          volume_change_24h: each.quote['USD']['volume_change_24h'],
          market_cap: each.quote['USD']['market_cap'],
        };
      }
      return coins;
    });
  }

  static async getCoinsFromCGK() {
    return Utils.doSimpleRequest(process.env.CGK_ENDPOINT + '/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,theta-fuel,theta-token,thetadrop&price_change_percentage=24h,1y', (data) => {
      const body = data
      const coins = {};
      for (const each of body) {
        coins[each.symbol.toUpperCase()] = {
          rank: each.market_cap_rank,
          max_supply: each.max_supply,
          circulating_supply: each.circulating_supply,
          total_supply: each.total_supply,
          price: each.current_price,
          price_change_24h: each.price_change_percentage_24h,
          volume_24h: each.total_volume,
          volume_change_24h: '',
          market_cap: each.market_cap,
        };
      }
      return coins;
    });
  }

  static async getTVL() {
    return Utils.doSimpleRequest(process.env.DL_ENDPOINT + '/charts/theta', (data) => {
      const todayStat = data[data.length - 1]['totalLiquidityUSD'];
      const yesterdayStat = data[data.length - 2]['totalLiquidityUSD'];
      return {
        tvl: todayStat,
        tvl_change_24h: (yesterdayStat - todayStat)
      };
    });
  }

}

