import express from 'express';
import ThetaController from '../controllers/theta-controller.js';

const router = express.Router();

router.get('/market/prices', async (req, res) => {
  ThetaController.prices(req, res);
});

export default router;