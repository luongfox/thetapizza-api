import Account from '../models/account.js';
import MDB from '../models/mdb.js';
import Stake from '../models/stake.js';
import Factory from '../services/factory.js';

export default class ThetaController {
    
  static async searchTransactions(req, res) {
    const currency = req.query.currency;
    const type = req.query.type;
    const account = req.query.account;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const sort = req.query.sort ? req.query.sort : 'date';
    const date = req.query.date ? req.query.date : '30D'; // 1D - 3D - 7D - 14D - 30D

    const transactionCollection = await MDB.use('transactions');

    const pines = [];
    if (currency) {
      pines.push({ $match: { 'currency':  currency  } });
    }
    if (type) {
      pines.push({ $match: { 'type_name':  { $regex: (type + ".*"), $options: 'i' } } });
    }
    if (date) {
      const subTime =  Math.floor(new Date().getTime() / 1000) - parseInt(date) * 24 * 60 * 60;
      pines.push({ $match: { 'date': { $gte: String(subTime) } } });
    }
    pines.push({ $lookup: { from: 'accounts', localField: 'from', foreignField: '_id', as: 'from_account' } });
    pines.push({ $lookup: { from: 'accounts', localField: 'to', foreignField: '_id', as: 'to_account' } });
    if (account) {
      const itext = ".*" + account + ".*";
      pines.push({ $match: { $or: [ { 'from': { $regex: itext, $options: 'i' } }, { 'to': { $regex: itext, $options: 'i' } }, { 'from_account.name': { $regex: itext, $options: 'i' } }, { 'to_account.name': { $regex: itext, $options: 'i' } } , { 'from_account.tags': account }, { 'to_account.tags': account } ] } });
    }
    if (sort == 'date') {
      pines.push({ $sort: { 'date': -1 } });
    } else if (sort == 'amount') {
      pines.push({ $sort: { 'usd': -1 } });
    }
    pines.push({ $limit: limit });
    const transactions = await transactionCollection.aggregate(pines).toArray();

    res.status(200).json({
      success: true,
      data: transactions
    });
  }

  static async stats(req, res) {
    res.status(200).json({
      success: true,
      data: await Factory.getStats()
    });
  }

  static async accounts(req, res) {
    res.status(200).json({
      success: true,
      data: await Account.getAll()
    });
  }

  static async validators(req, res) {
    res.status(200).json({
      success: true,
      data: await Stake.getValidators()
    });
  }

  static async withdrawals(req, res) {
    res.status(200).json({
      success: true,
      data: await Stake.getWithdrawals()
    });
  }
}