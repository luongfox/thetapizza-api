import Pricing from '../services/pricing.js';
import Utils from '../helpers/utils.js';
import { CACHE_LIFETIME_MEDIUM } from '../helpers/constants.js';

export default class Factory {

  static async getCoins() {
    return await Utils.doSimpleCache('factory.coins', async () => await Pricing.getCoins(), CACHE_LIFETIME_MEDIUM, true);
  }

}
