import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// GET /api/wallet/balance — returns balance + settings for the wallet page
router.get('/balance', auth, async (req, res) => {
  try {
    const [user, settings] = await Promise.all([
      User.findById(req.user._id),
      Settings.findOne() || new Settings(),
    ]);

    const spxPrice = settings?.spxPrice ?? 0.20;

    res.json({
      spxBalance:        user.spxBalance,
      totalMined:        user.totalMined,
      referralEarnings:  user.referralEarnings,
      spxPrice,
      usdValue:          parseFloat((user.spxBalance * spxPrice).toFixed(2)),
      withdrawalsEnabled: settings?.withdrawalsEnabled ?? false,
      depositsEnabled:    settings?.depositsEnabled    ?? false,
      depositAddress:     settings?.depositAddress     ?? '',
      minWithdrawalAmount: settings?.minWithdrawalAmount ?? 10,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/wallet/withdraw
router.post('/withdraw', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('address').notEmpty().withMessage('Wallet address is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const settings = await Settings.findOne() || new Settings();

    if (!settings.withdrawalsEnabled) {
      return res.status(400).json({ message: 'Withdrawals are currently disabled by admin.' });
    }

    const user = await User.findById(req.user._id);
    const { amount, address } = req.body;
    const numAmount = parseFloat(amount);

    if (numAmount < (settings.minWithdrawalAmount ?? 10)) {
      return res.status(400).json({
        message: `Minimum withdrawal is ${settings.minWithdrawalAmount ?? 10} SPX`,
      });
    }

    if (numAmount > user.spxBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.withdrawalRequests.push({
      amount: numAmount,
      address,
      status: 'pending',
      requestDate: new Date(),
    });
    user.spxBalance -= numAmount; // lock the funds

    await user.save();

    res.json({ message: 'Withdrawal request submitted. Pending admin approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/wallet/deposit — user submits a deposit request (txid proof)
router.post('/deposit', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('txid').notEmpty().withMessage('Transaction ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const settings = await Settings.findOne() || new Settings();

    if (!settings.depositsEnabled) {
      return res.status(400).json({ message: 'Deposits are currently disabled by admin.' });
    }

    const user = await User.findById(req.user._id);
    const { amount, txid } = req.body;

    user.depositRequests = user.depositRequests || [];
    user.depositRequests.push({
      amount: parseFloat(amount),
      txid,
      status: 'pending',
      requestDate: new Date(),
    });

    await user.save();

    res.json({ message: 'Deposit request submitted. Awaiting admin confirmation.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/wallet/withdrawals
router.get('/withdrawals', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      withdrawals: (user.withdrawalRequests || []).sort((a, b) => b.requestDate - a.requestDate),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/wallet/deposits
router.get('/deposits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      deposits: (user.depositRequests || []).sort((a, b) => b.requestDate - a.requestDate),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
