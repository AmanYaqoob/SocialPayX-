import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Submit KYC with TID
router.post('/submit', [
  auth,
  body('tid').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const settings = await Settings.findOne() || new Settings();
    
    if (!settings.kycEnabled) {
      return res.status(400).json({ message: 'KYC submissions are currently disabled' });
    }

    const user = await User.findById(req.user.id);
    
    if (user.kycStatus === 'approved') {
      return res.status(400).json({ message: 'KYC already approved' });
    }

    const { tid } = req.body;

    user.kycTID = tid;
    user.kycStatus = 'pending';
    user.kycSubmissionDate = new Date();
    user.kycRejectionReason = null;

    await user.save();

    res.json({ 
      message: 'KYC submitted successfully', 
      kycStatus: 'pending',
      submissionDate: user.kycSubmissionDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get KYC status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne() || new Settings();

    res.json({
      kycStatus: user.kycStatus,
      kycSubmissionDate: user.kycSubmissionDate,
      kycRejectionReason: user.kycRejectionReason,
      kycTID: user.kycTID,
      kycEnabled: settings.kycEnabled,
      usdtAmount: settings.kycUsdtAmount,
      usdtWalletAddress: settings.usdtWalletAddress
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;