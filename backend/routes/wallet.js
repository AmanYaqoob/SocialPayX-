import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// GET /api/wallet/balance
router.get('/balance', auth, async (req, res) => {
  try {
    const [user, settings] = await Promise.all([
      User.findById(req.user._id),
      Settings.findOne(),
    ]);
    const s = settings || {};

    const tokenPrice = parseFloat(s.tokenPrice) || 0.01;
    const spxPrice   = parseFloat(s.spxPrice)   || 0.20;

    // Guarantee every user has at least 25 SPX coins
    if ((user.spxCoinBalance ?? 0) < 25) {
      user.spxCoinBalance = 25;
      await user.save();
    }

    // All token sources merged into one total
    const miningTokens    = parseFloat(user.tokenBalance     ?? 0) || 0;
    const taskTokens      = parseFloat(user.spxBalance       ?? 0) || 0; // tasks wrote here
    const referralTokens  = parseFloat(user.referralEarnings ?? 0) || 0;
    const totalTokens     = miningTokens + taskTokens + referralTokens;

    const spxCoinBalance  = parseFloat(user.spxCoinBalance   ?? 25) || 25;
    const totalMined      = parseFloat(user.totalMined       ?? 0)  || 0;

    res.json({
      tokenBalance:    totalTokens,   // all tokens combined
      miningTokens,
      taskTokens,
      referralEarnings: referralTokens,
      tokenPrice,
      tokenUsdValue: parseFloat((totalTokens * tokenPrice).toFixed(2)),

      spxCoinBalance,
      spxPrice,
      spxUsdValue: parseFloat((spxCoinBalance * spxPrice).toFixed(2)),

      totalMined,
      spxBalance: taskTokens,

      totalUsdValue: parseFloat(
        (totalTokens * tokenPrice + spxCoinBalance * spxPrice).toFixed(2)
      ),

      withdrawalsEnabled:  s.withdrawalsEnabled  ?? false,
      depositsEnabled:     s.depositsEnabled      ?? false,
      depositAddress:      s.depositAddress       ?? '',
      minWithdrawalAmount: parseFloat(s.minWithdrawalAmount) || 10,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/wallet/withdraw — withdraw SPX coins
router.post('/withdraw', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('address').notEmpty().withMessage('Wallet address is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const settings = await Settings.findOne() || {};
    if (!settings.withdrawalsEnabled) {
      return res.status(400).json({ message: 'Withdrawals are currently disabled by admin.' });
    }

    const user = await User.findById(req.user._id);
    const { amount, address } = req.body;
    const numAmount = parseFloat(amount);
    const minWithdraw = settings.minWithdrawalAmount ?? 10;

    if (numAmount < minWithdraw) {
      return res.status(400).json({ message: `Minimum withdrawal is ${minWithdraw} SPX` });
    }

    const spxCoinBalance = user.spxCoinBalance ?? 0;
    if (numAmount > spxCoinBalance) {
      return res.status(400).json({ message: 'Insufficient SPX coin balance' });
    }

    user.spxCoinBalance = spxCoinBalance - numAmount;  // lock funds
    user.withdrawalRequests.push({
      amount: numAmount,
      address,
      status: 'pending',
      requestDate: new Date(),
    });

    await user.save();
    res.json({ message: 'Withdrawal request submitted. Pending admin approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/wallet/deposit — user submits deposit proof
router.post('/deposit', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('txid').notEmpty().withMessage('Transaction ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const settings = await Settings.findOne() || {};
    if (!settings.depositsEnabled) {
      return res.status(400).json({ message: 'Deposits are currently disabled by admin.' });
    }

    const user = await User.findById(req.user._id);
    user.depositRequests = user.depositRequests || [];
    user.depositRequests.push({
      amount: parseFloat(req.body.amount),
      txid: req.body.txid,
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
