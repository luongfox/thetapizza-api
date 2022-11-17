import { THETA_EXPLORER_URL } from './constants.js'

export const makeTransactionUrl = (transactionId) => {
    return THETA_EXPLORER_URL + '/txs/' +  transactionId;
}

export const formatNumber = (number, precision) => {
    return parseFloat(parseFloat(number).toFixed(precision)).toLocaleString().replace(/\.0+$/, '');
}