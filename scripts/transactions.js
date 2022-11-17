import { getLatestTdropTransfers, getLatestTransactions, getStakeBySourceAndHolder } from '../api/theta.js';
import { getCoins } from '../api/prices.js';
import { THETA_WEI, DECIMALS, TDROP_STAKING_ADDRESS, TRACKING_USD_MIN } from '../helper/constants.js';
import BigNumber from 'bignumber.js';
import { useDb } from '../db/db.js';
import { AccountDao } from '../db/account-dao.js';
import { formatNumber, makeTransactionUrl } from '../helper/utils.js';
import { tweet } from '../api/twitter.js';

BigNumber.config({ DECIMAL_PLACES: DECIMALS });

(async () => {
  await useDb(main).catch(console.error);
})();

async function main(db) {
  const coins = await getCoins();
  const transactions = await getLatestTransactions();

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

  const tdropTransfers = await getLatestTdropTransfers();
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

  const accountDao = new AccountDao(db);
  const accounts = await accountDao.getAll();
  const formatAmount = (item) => {
    return formatNumber(item.coins, 2) + ' $' + item.currency + ' ($' + formatNumber(item.usd, 2) + ')';
  }

  for (let item of data) {
    const result = await db.collection('transactions').updateOne(
      { _id: item._id },
      { $set: item },
      { upsert: true }
    );
    if (!result.upsertedId) {
      continue;
    }

    if (item.usd >= TRACKING_USD_MIN) {
      if (item.type_name == 'transfer') {
        let fromTo = 'from an unknown wallet';
        if (accounts[item.from] && accounts[item.to]) {
          fromTo = 'from ' + accounts[item.from]['name'] + ' to ' + accounts[item.to]['name'];
        } else if (accounts[item.from]) {
          fromTo = 'from ' + accounts[item.from]['name'];
        } else if (accounts[item.to]) {
          fromTo = 'to ' + accounts[item.to]['name'];
        }
        const text = formatAmount(item) + ' transferred ' + fromTo + ' ' + makeTransactionUrl(item._id);
        tweet(text);

      } else if (item.type_name == 'stake_tdrop') {

      } else if (item.type_name == 'stake_elite') {

      } else if (item.type_name == 'stake_guardian') {

      } else if (item.type_name == 'stake_validator') {

      } else if (item.type_name == 'withdraw_tdrop') {

      } else if (item.type_name == 'withdraw_elite') {

      } else if (item.type_name == 'withdraw_guardian') {

      } else if (item.type_name == 'withdraw_validator') {
        
      }
    }
  }
 
}
  