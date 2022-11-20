import { THETA_EXPLORER_ENDPOINT, TDROP_CONTRACT_ID, TDROP_STAKING_ADDRESS, THETA_WEI } from '../helpers/constants.js';
import BigNumber from 'bignumber.js';
import Utils from '../helpers/utils.js';
import Contract from '../helpers/contract.js';

export default class Theta {

  static async getTfuelTotalAmountStaked() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/totalAmount?type=tfuel', (data) => {
      return parseFloat(new BigNumber(data['body']['totalAmount']).dividedBy(new BigNumber(THETA_WEI)).toString()).toFixed(2);
    });
  }

  static async getTfuelTotalNodesStaked() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/totalAmount?type=tfuel', (data) => {
      return data['body']['totalNodes'];
    });
  }

  static async getThetaTotalAmountStaked() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/totalAmount?type=theta', (data) => {
      return parseFloat(new BigNumber(data['body']['totalAmount']).dividedBy(new BigNumber(THETA_WEI)).toString()).toFixed(2);
    });
  }

  static async getThetaTotalNodesStaked() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/totalAmount?type=theta', (data) => {
      return data['body']['totalNodes'];
    });
  }

  static async getTfuelSupply() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/supply/tfuel', (data) => {
      return data['circulation_supply'];
    });
  }

  static async getTfuelStakings() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/all?types[]=eenp', (data) => {
      return data['body'];
    });
  }

  static async getThetaStakings() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/all?types[]=gcp&types[]=vcp', (data) => {
      return data['body'];
    });
  }

  static async getLatestTransactions(limit = 100) {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/transactions/range?limit=' + limit, (data) => {
      return data['body'];
    });
  }

  static async getLatestTdropTransfers(limit = 100) {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/token/' + TDROP_CONTRACT_ID + '/?pageNumber=1&limit=' + limit, (data) => {
      return data['body'];
    });
  }

  static async getStakeBySource(source) {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/' + source + '?types[]=vcp&types[]=gcp&types[]=eenp', (data) => {
      return data['body'];
    });
  }

  static async getStakeBySourceAndHolder(source, holder) {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/stake/' + source + '?types[]=vcp&types[]=gcp&types[]=eenp', (data) => {
      for (const each of data['body']['sourceRecords']) {
        if (each.holder == holder) {
          return each;
        }
      }
      return false;
    });
  }

  static async getBlocks24h() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/blocks/number/24', (data) => {
      return data['body']['total_num_block'];
    });
  }

  static async getTransactions24h() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/transactions/number/24', (data) => {
      return data['body']['total_num_tx'];
    });
  }

  static async getOnChainWallets() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/account/total/number', (data) => {
      return data['total_number_account'];
    });
  }

  static async getActiveWallets() {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/activeAccount/latest', (data) => {
      return data['body']['amount'];
    });
  }

  static async getContractSummary(contractId) {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/tokenSummary/' + contractId, (data) => {
      return data['body'];
    });
  }

  static async getTdropSupply() {
    const tdropContract = await this.getContractSummary(TDROP_CONTRACT_ID);
    return new BigNumber(tdropContract.max_total_supply).dividedBy(new BigNumber(THETA_WEI)).toString();
  }

  static async getTdropBalance(address) {
    const contract = new Contract(TDROP_CONTRACT_ID);
    await contract.connect();
    const balance = await contract.exec('balanceOf', [address], {});
    return parseFloat(new BigNumber(balance).dividedBy(new BigNumber(THETA_WEI)).toString()).toFixed(2);
  }

  static async getTdropTotalStaked() {
    return await this.getTdropBalance(TDROP_STAKING_ADDRESS);
  }

  static async getTdropTotalRewarded() {
    const contract = new Contract(TDROP_CONTRACT_ID);
    await contract.connect();
    const balance = await contract.exec('stakeRewardAccumulated', [], {});
    return parseFloat(new BigNumber(balance).dividedBy(new BigNumber(THETA_WEI)).toString()).toFixed(2);
  }

  static async getTdropStakingRate() {
    const remainingYears = (new Date('2026-02-01').getTime() - Date.now()) / 1000 / 86400 / 365;
    const remainingRewards = 4000000000 - await this.getTdropTotalRewarded();
    const rewardsPerYear = remainingRewards / remainingYears;
    const totalStaked = await this.getTdropTotalStaked();
    const rate = rewardsPerYear / totalStaked;
    return rate;
  }

  static async getTfuelDailyBurnt(timestamp = null) {
    return Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/supply/dailyTfuelBurnt?timestamp=' + timestamp, (data) => {
      return parseFloat(new BigNumber(data['body'][0]['dailyTfuelBurnt']).dividedBy(new BigNumber(THETA_WEI)).toString()).toFixed(2);
    });
  }

}