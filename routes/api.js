import express from 'express';
import ThetaController from '../controllers/theta-controller.js';

const router = express.Router();

router.get('/transactions', async (req, res) => {
  ThetaController.searchTransactions(req, res);
});

export default router;