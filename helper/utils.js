import { THETA_EXPLORER_URL } from './constants.js'
import axios from 'axios';
import Cache from './cache.js';

export default class Utils {

  static makeTransactionUrl(transactionId) {
      return THETA_EXPLORER_URL + '/txs/' +  transactionId;
  }

  static formatNumber(number, precision) {
      return parseFloat(parseFloat(number).toFixed(precision)).toLocaleString().replace(/\.0+$/, '');
  }

  static async doSimpleRequest(endpoint, fx) {
    try {
      const response = await axios.get(endpoint);
      if (response.status !== 200) {
        return false;
      }
      return fx(response.data);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async doSimpleCache(key, value, expire, json = false) {
    let usingValue = await Cache.get(key);
    if (!usingValue) {
      usingValue = value;
      await Cache.set(key, json ? JSON.stringify(value) : value, expire);
    } else if (json) {
      usingValue = JSON.parse(usingValue);
    }
    return usingValue;
  }

}