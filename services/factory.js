import Pricing from '../services/pricing.js';
import Utils from '../helpers/utils.js';
import Theta from '../services/theta.js';
import Stake from '../models/stake.js';
import { CACHE_LIFETIME_MEDIUM, CACHE_LIFETIME_SHORT, TDROP_MAX_SUPPLY, THETA_SUPPLY } from '../helpers/constants.js';

export default class Factory {

  static async getCoins() {
    return await Utils.doSimpleCache('factory.coins', async () => await Pricing.getCoins(), CACHE_LIFETIME_MEDIUM, true);
  }

  static async getStats() {
    return await Utils.doSimpleCache('factory.stats', async () => this.#getStatsData(), CACHE_LIFETIME_SHORT, true);
  }

  static async #getStatsData() {
    const coins =  await this.getCoins();
    const tvl = await Pricing.getTVL();
    const nodes = await Stake.countNodeTypes();
    const activeWallets = await Theta.getActiveWallets();
    const transactions24h = await Theta.getTransactions24h();

    const tdropTotalStaked = await Theta.getTdropTotalStaked();
    const tdropSupply = await Theta.getTdropSupply();
    const tdropTotalStakedPercentage = (tdropTotalStaked / tdropSupply) * 100;
    const tdropSupplyPercentage = (tdropSupply / TDROP_MAX_SUPPLY) * 100;
    const tdropStakingRate = await Theta.getTdropStakingRate() * 100;

    const thetaTotalStaked = await Theta.getThetaTotalAmountStaked();
    const thetaTotalStakedPercentage = Utils.formatNumber((thetaTotalStaked / 1000000000) * 100, 2);

    const tfuelTotalStaked = await Theta.getTfuelTotalAmountStaked();
    const tfuelTotalSupply = await Theta.getTfuelSupply();
    const tfuelTotalStaledPercentage = (tfuelTotalStaked / tfuelTotalSupply) * 100;
    const dailyBurnt = await Theta.getTfuelDailyBurnt();

    const data = {
      network: {
        tvl: tvl.tvl,
        tvl_change_24h: tvl.tvl_change_24h,
        validators: nodes.vcp,
        guardians: nodes.gcp,
        elites: nodes.eenp,
        active_wallets: activeWallets,
        transactions_24h: transactions24h
      },
      theta: {
        rank: coins.THETA.rank,
        price: coins.THETA.price,
        price_change_percent_24h: coins.THETA.price_change_24h,
        volume_24h: coins.THETA.volume_24h,
        volume_change_percent_24h: coins.THETA.volume_change_24h,
        market_cap: coins.THETA.market_cap,
        stakes: thetaTotalStaked,
        stakes_percent: thetaTotalStakedPercentage,
        supply: THETA_SUPPLY
      },
      tfuel: {
        rank: coins.TFUEL.rank,
        price: coins.TFUEL.price,
        price_change_percent_24h: coins.TFUEL.price_change_24h,
        volume_24h: coins.TFUEL.volume_24h,
        volume_change_percent_24h: coins.TFUEL.volume_change_24h,
        market_cap: coins.TFUEL.market_cap,
        stakes: tfuelTotalStaked,
        stakes_percent: tfuelTotalStaledPercentage,
        supply: tfuelTotalSupply,
        daily_burnt: dailyBurnt
      },
      tdrop: {
        rank: coins.TDROP.rank,
        price: coins.TDROP.price,
        price_change_percent_24h: coins.TDROP.price_change_24h,
        volume_24h: coins.TDROP.volume_24h,
        volume_change_percent_24h: coins.TDROP.volume_change_24h,
        market_cap: coins.TDROP.market_cap,
        stakes: tdropTotalStaked,
        stakes_percent: tdropTotalStakedPercentage,
        stakes_apy_percent: tdropStakingRate,
        supply: tdropSupply,
        supply_percent: tdropSupplyPercentage
      }
    };
    return data;
  }

}
