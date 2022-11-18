import PriceApi from '../api/price-api.js';
import Utils from './utils.js';
import { CACHE_LIFETIME_MEDIUM } from './constants.js';

export default class Factory {

  static async getCoins() {
    return await Utils.doSimpleCache('factory.coins', await PriceApi.getCoins(), CACHE_LIFETIME_MEDIUM, true);
  }

}
