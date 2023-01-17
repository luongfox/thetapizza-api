import '../boostrap.js';
import Theta from '../services/theta.js';
import { THETA_WEI, DECIMALS, TDROP_STAKING_ADDRESS } from '../helpers/constants.js';
import BigNumber from 'bignumber.js';
import Account from '../models/account.js';
import Transaction from '../models/transaction.js';
import Factory from '../services/factory.js';
import Utils from '../helpers/utils.js';
import Twitter from '../services/twitter.js';
import Logger from '../helpers/logger.js';

(async () => {
  await main().catch(console.error);
  setTimeout(() => {
    process.exit(0);
  }, 5000);
})();

async function main() {
  const coins = await Factory.getCoins();
  const transactions = await Theta.getLatestTransactions();

  const data = [];
  for (const transaction of transactions) {
    if (transaction.type === 2) { // transfer
      const theta = parseFloat(new BigNumber(transaction['data']['outputs'][0]['coins']['thetawei']).dividedBy(new BigNumber(THETA_WEI)).toString());
      const tfuel = parseFloat(new BigNumber(transaction['data']['outputs'][0]['coins']['tfuelwei']).dividedBy(new BigNumber(THETA_WEI)).toString());
      if (theta > 0) {
        const usd = theta * coins['THETA']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'transfer',
          date: transaction['timestamp'],
          from: transaction['data']['inputs'][0]['address'],
          to: transaction['data']['outputs'][0]['address'],
          coins: theta,
          currency: 'theta',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      } else {
        const usd = tfuel * coins['TFUEL']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'transfer',
          date: transaction['timestamp'],
          from: transaction['data']['inputs'][0]['address'],
          to: transaction['data']['outputs'][0]['address'],
          coins: tfuel,
          currency: 'tfuel',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      }

    } else if (transaction.type === 8 || transaction.type === 10) { // stake as validator / guardian / elite
      if (transaction['data']['purpose'] === 0) {
        const theta = parseFloat(new BigNumber(transaction['data']['source']['coins']['thetawei']).dividedBy(new BigNumber(THETA_WEI)).toString());
        const usd = theta * coins['THETA']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'stake_validator',
          date: transaction['timestamp'],
          from: transaction['data']['source']['address'],
          to: transaction['data']['holder']['address'],
          coins: theta,
          currency: 'theta',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      } else if (transaction['data']['purpose'] === 1) {
        const theta = parseFloat(new BigNumber(transaction['data']['source']['coins']['thetawei']).dividedBy(new BigNumber(THETA_WEI)).toString());
        const usd = theta * coins['THETA']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'stake_guardian',
          date: transaction['timestamp'],
          from: transaction['data']['source']['address'],
          to: transaction['data']['holder']['address'],
          coins: theta,
          currency: 'theta',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      } else if (transaction['data']['purpose'] === 2) {
        const tfuel = parseFloat(new BigNumber(transaction['data']['source']['coins']['tfuelwei']).dividedBy(new BigNumber(THETA_WEI)).toString());
        const usd = tfuel * coins['TFUEL']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'stake_elite',
          date: transaction['timestamp'],
          from: transaction['data']['source']['address'],
          to: transaction['data']['holder']['address'],
          coins: tfuel,
          currency: 'tfuel',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      }

    } else if (transaction.type === 9) { // withdraw
      const stake = await Theta.getStakeBySourceAndHolder(transaction['data']['source']['address'], transaction['data']['holder']['address']);
      if (!stake) {
        continue;
      }
      if (transaction['data']['purpose'] === 0) {
        const theta = parseFloat(new BigNumber(stake.amount).dividedBy(new BigNumber(THETA_WEI)).toString());
        const usd = theta * coins['THETA']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'withdraw_validator',
          date: transaction['timestamp'],
          from: transaction['data']['holder']['address'],
          to: transaction['data']['source']['address'],
          coins: theta,
          currency: 'theta',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      } else if (transaction['data']['purpose'] === 1) {
        const theta = parseFloat(new BigNumber(stake.amount).dividedBy(new BigNumber(THETA_WEI)).toString());
        const usd = theta * coins['THETA']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'withdraw_guardian',
          date: transaction['timestamp'],
          from: transaction['data']['holder']['address'],
          to: transaction['data']['source']['address'],
          coins: theta,
          currency: 'theta',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      } else if (transaction['data']['purpose'] === 2) {
        const tfuel = parseFloat(new BigNumber(stake.amount).dividedBy(new BigNumber(THETA_WEI)).toString());
        const usd = tfuel * coins['TFUEL']['price'];
        data.push({
          _id: transaction['_id'],
          type: transaction['type'],
          type_name: 'withdraw_elite',
          date: transaction['timestamp'],
          from: transaction['data']['holder']['address'],
          to: transaction['data']['source']['address'],
          coins: tfuel,
          currency: 'tfuel',
          usd: parseFloat(usd.toFixed(DECIMALS))
        });
      }

    } else if (transaction.type === 5 || transaction.type === 201) {
      Logger.debug(transaction);
    }

  }

  const tdropTransfers = await Theta.getLatestTdropTransfers();
  for (const transfer of tdropTransfers) {
    let type = 100;
    let transferType = 'transfer';
    if (transfer['to'].toLowerCase() == TDROP_STAKING_ADDRESS.toLowerCase()) {
      type = 101;
      transferType = 'stake_tdrop';
    } else if (transfer['from'].toLowerCase() == TDROP_STAKING_ADDRESS.toLowerCase()) {
      type = 102;
      transferType = 'withdraw_tdrop';
    }
    const tdrop = parseFloat(new BigNumber(transfer['value']).dividedBy(new BigNumber(THETA_WEI)).toString());
    const usd = tdrop * coins['TDROP']['price'];
    data.push({
      _id: transfer['hash'],
      type: type,
      type_name: transferType,
      date: transfer['timestamp'],
      from: transfer['from'],
      to: transfer['to'],
      coins: tdrop,
      currency: 'tdrop',
      usd: parseFloat(usd.toFixed(DECIMALS))
    });
  }

  const accounts = await Account.getAll();

  const formatAmount = (item) => {
    return Utils.formatNumber(item.coins, 2) + ' $' + item.currency + ' ($' + Utils.formatNumber(item.usd, 2) + ')';
  };

  const tweetTransaction = (item, gapText) => {
    let fromTo = 'from an unknown wallet';
    if (accounts[item.from] && accounts[item.to]) {
      fromTo = 'from ' + accounts[item.from]['name'] + ' to ' + accounts[item.to]['name'];
    } else if (accounts[item.from]) {
      fromTo = 'from ' + accounts[item.from]['name'];
    } else if (accounts[item.to]) {
      fromTo = 'to ' + accounts[item.to]['name'];
    }
    const text = formatAmount(item) + ' ' + gapText + ' ' + fromTo + ' ' + Utils.makeTransactionUrl(item._id);
    Twitter.tweet(text);
  };

  for (let item of data) {
    const result = await Transaction.upsert(item);
    if (!result.upsertedId) {
      continue;
    }

    let canTweet = item.usd >= 300000;
    canTweet = canTweet || (item.currency == 'tdrop' && item.usd >= 100000);
    canTweet = canTweet || ['stake_validator', 'withdraw_validator'].includes(item.type_name);

    if (canTweet) {
      if (item.type_name == 'transfer') {
        tweetTransaction(item, 'transferred');
      } else if (item.type_name == 'stake_tdrop') {
        tweetTransaction(item, 'staked');
      } else if (item.type_name == 'stake_elite') {
        tweetTransaction(item, 'staked as elite');
      } else if (item.type_name == 'stake_guardian') {
        tweetTransaction(item, 'staked as guardian');
      } else if (item.type_name == 'stake_validator') {
        tweetTransaction(item, 'staked as validator');
      } else if (item.type_name == 'withdraw_tdrop') {
        tweetTransaction(item, 'withdrawn');
      } else if (item.type_name == 'withdraw_elite') {
        tweetTransaction(item, 'withdrawn as lite');
      } else if (item.type_name == 'withdraw_guardian') {
        tweetTransaction(item, 'withdrawn as guardian');
      } else if (item.type_name == 'withdraw_validator') {
        tweetTransaction(item, 'withdrawn as validator');
      }
    }
  }
 
}
  