import express from 'express';
import ThetaController from '../controllers/theta-controller.js';

const router = express.Router();

router.get('/transactions', async (req, res) => {
  ThetaController.searchTransactions(req, res);
});

router.get('/stats', async (req, res) => {
  ThetaController.stats(req, res);
});

router.get('/accounts', async (req, res) => {
  ThetaController.accounts(req, res);
});

router.get('/stake/validators', async (req, res) => {
  ThetaController.validators(req, res);
});

router.get('/stake/withdrawals', async (req, res) => {
  ThetaController.withdrawals(req, res);
});

router.get('/top-wallets', async (req, res) => {
  ThetaController.topWallets(req, res);
});

export default router;