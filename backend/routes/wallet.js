import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      spxBalance: user.spxBalance,
      totalMined: user.totalMined,
      referralEarnings: user.referralEarnings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('address').notEmpty().withMessage('Wallet address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const settings = await Settings.findOne() || new Settings();
    
    if (!settings.withdrawalsEnabled) {
      return res.status(400).json({ message: 'Withdrawals are currently disabled' });
    }

    const user = await User.findById(req.user.id);
    const { amount, address } = req.body;

    if (amount < settings.minWithdrawalAmount) {
      return res.status(400).json({ 
        message: `Minimum withdrawal amount is ${settings.minWithdrawalAmount} SPX` 
      });
    }

    if (amount > user.spxBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create withdrawal request
    const withdrawalRequest = {
      amount,
      address,
      status: 'pending',
      requestDate: new Date()
    };

    user.withdrawalRequests.push(withdrawalRequest);
    user.spxBalance -= amount; // Lock the amount

    await user.save();

    res.json({ message: 'Withdrawal request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get withdrawal history
router.get('/withdrawals', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      withdrawals: user.withdrawalRequests.sort((a, b) => b.requestDate - a.requestDate)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;