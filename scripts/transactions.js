import ThetaApi from '../api/theta-api.js';
import { THETA_WEI, DECIMALS, TDROP_STAKING_ADDRESS, TRACKING_USD_MIN } from '../helper/constants.js';
import BigNumber from 'bignumber.js';
import DB from '../db/db.js';
import AccountDao from '../db/account-dao.js';
import TransactionDao from '../db/transaction-dao.js';
import Factory from '../helper/factory.js';
import Utils from '../helper/utils.js';
import TwitterApi from '../api/twitter-api.js';

BigNumber.config({ DECIMAL_PLACES: DECIMALS });

(async () => {
  await DB.useMongo(main).catch(console.error);
  process.exit(0);
})();

async function main(db) {
  const coins = await Factory.getCoins();
  const transactions = await ThetaApi.getLatestTransactions();

  const data = [];
  for (const transaction of transactions) {
    if (transaction.type === 2) { // transfer
      const theta = new BigNumber(transaction['data']['outputs'][0]['coins']['thetawei']).dividedBy(new BigNumber(THETA_WEI)).toString();
      const tfuel = new BigNumber(transaction['data']['outputs'][0]['coins']['tfuelwei']).dividedBy(new BigNumber(THETA_WEI)).toString();
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
          usd: usd.toFixed(DECIMALS)
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
          usd: usd.toFixed(DECIMALS)
        });
      }

    } else if (transaction.type === 10) { // stake as guardian / elite
      const theta = new BigNumber(transaction['data']['source']['coins']['thetawei']).dividedBy(new BigNumber(THETA_WEI)).toString();
      const tfuel = new BigNumber(transaction['data']['source']['coins']['tfuelwei']).dividedBy(new BigNumber(THETA_WEI)).toString();
      if (theta > 0) {
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
          usd: usd.toFixed(DECIMALS)
        });
      } else {
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
          usd: usd.toFixed(DECIMALS)
        });
      }

    } else if (transaction.type === 8) { // stake as validator
      const theta = new BigNumber(transaction['data']['source']['coins']['thetawei']).dividedBy(new BigNumber(THETA_WEI)).toString();
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
        usd: usd.toFixed(DECIMALS)
      });

    } else if (transaction.type === 9) { // withdraw
      const stake = await getStakeBySourceAndHolder(transaction['data']['source']['address'], transaction['data']['holder']['address']);
      if (!stake) {
        continue;
      }
      if (transaction['data']['purpose'] === 0) {
        const theta = new BigNumber(stake.amount).dividedBy(new BigNumber(THETA_WEI)).toString();
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
          usd: usd.toFixed(DECIMALS)
        });
      } else if (transaction['data']['purpose'] === 1) {
        const theta = new BigNumber(stake.amount).dividedBy(new BigNumber(THETA_WEI)).toString();
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
          usd: usd.toFixed(DECIMALS)
        });
      } else if (transaction['data']['purpose'] === 2) {
        const tfuel = new BigNumber(stake.amount).dividedBy(new BigNumber(THETA_WEI)).toString();
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
          usd: usd.toFixed(DECIMALS)
        });
      }
    }
  }

  const tdropTransfers = await ThetaApi.getLatestTdropTransfers();
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
    const tdrop = new BigNumber(transfer['value']).dividedBy(new BigNumber(THETA_WEI)).toString();
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
      usd: usd.toFixed(DECIMALS)
    });
  }

  const transactionDao = new TransactionDao(db);
  const accountDao = new AccountDao(db);
  const accounts = await accountDao.getAll();

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
    const text = formatAmount(item) + ' ' + gapText + ' ' + fromTo + ' ' + makeTransactionUrl(item._id);
    TwitterApi.tweet(text);
  };

  for (let item of data) {
    const result = await transactionDao.upsert(item);
    if (!result.upsertedId) {
      continue;
    }

    if (item.usd >= TRACKING_USD_MIN || ['stake_validator', 'withdraw_validator'].includes(item.type_name)) {
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
  