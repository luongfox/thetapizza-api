import { THETA_EXPLORER_URL } from './constants.js'
import axios from 'axios';
import RC from './rc.js';

export default class Utils {

  static makeTransactionUrl(transactionId) {
      return THETA_EXPLORER_URL + '/txs/' +  transactionId;
  }

  static formatNumber(number, precision = 0, unit = '') {
    let unit2 = '';
    if (unit == 'auto') {
      if (number >= 1000000000) {
        unit2 = 'B';
      } else if (number >= 1000000) {
        unit2 = 'M';
      } else if (number >= 1000) {
        unit2 = 'K';
      }
    } else {
      unit2 = unit;
    }
    let number2 = parseFloat(number);
    if (unit2 == 'B') {
      number2 = number2 / 1000000000;
    } else if (unit2 == 'M') {
      number2 = number2 / 1000000;
    } else if (unit2 == 'K') {
      number2 = number2 / 1000;
    }
    let number3 = parseFloat(number2.toFixed(precision)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 }).replace(/\.0+$/, '');
    return number3 + unit2;
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

  static async doSimpleCache(key, valueFx, expire, json = false) {
    let usingValue = await RC.get(key);
    if (!usingValue) {
      usingValue = await valueFx();
      await RC.set(key, json ? JSON.stringify(usingValue) : usingValue, expire);      
    } else if (json) {
      usingValue = JSON.parse(usingValue);
    }
    return usingValue;
  }

}