import express from 'express';
import * as walletController from '../controllers/wallet.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/balance', authMiddleware, walletController.getBalance);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.get('/packages', authMiddleware, walletController.getPackages);
router.post('/purchase', authMiddleware, walletController.purchaseFichas);

export default router;
