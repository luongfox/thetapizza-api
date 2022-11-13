import { THETA_EXPLORER_ENDPOINT, TDROP_CONTRACT_ID } from '../helper/constants.js';
import axios from 'axios';

export const getTfuelSupply = async () => {
  const url = THETA_EXPLORER_ENDPOINT + '/api/supply/tfuel';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    return response.data['circulation_supply'];
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getTfuelStakings = async () => {
  const url = THETA_EXPLORER_ENDPOINT + '/api/stake/all?types[]=eenp';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    return response.data.body;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getThetaStakings = async () => {
  const url = THETA_EXPLORER_ENDPOINT + '/api/stake/all?types[]=gcp&types[]=vcp';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    return response.data.body;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getLatestTransactions = async (limit = 100) => {
  const url = THETA_EXPLORER_ENDPOINT + '/api/transactions/range?limit=' + limit;
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    return response.data.body;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getLatestTdropTransfers = async (limit = 100) => {
  const url = THETA_EXPLORER_ENDPOINT + '/api/token/' + TDROP_CONTRACT_ID + '/?pageNumber=1&limit=' + limit;
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    return response.data.body;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getStakeBySourceAndHolder = async (source, holder) => {
  const url = THETA_EXPLORER_ENDPOINT + '/api/stake/' + source + '?types[]=vcp&types[]=gcp&types[]=eenp';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      return false;
    }
    const data = response.data.body;
    for (const each of data.sourceRecords) {
      if (each.holder = holder) {
        return each;
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}