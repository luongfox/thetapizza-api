import Utils from './utils.js';
import Web3Contract from 'web3-eth-contract';
import { THETA_EXPLORER_ENDPOINT, THETA_RPC } from './constants.js';

export default class Contract {

  constructor(address) {
    this.address = address;
    this.smartContract = null;
  }

  async connect() {
    Web3Contract.setProvider(THETA_RPC);
    this.smartContract = new Web3Contract(await this.getAbi(), this.address);
  }

  async exec(method, params, options, fx) {
    return await this.smartContract.methods[method](...params).call(options, fx);
  }

  async getAbi() {
    return await Utils.doSimpleRequest(THETA_EXPLORER_ENDPOINT + '/api/smartcontract/abi/' + this.address, (data) => {
      return data['body']['abi'];
    });
  }
}