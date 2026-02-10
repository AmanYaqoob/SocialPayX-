import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const existingUser = await User.findOne({ email: 'aman@gmail.com' });
    if (existingUser) {
      console.log('User already exists');
      process.exit(0);
    }

    const user = new User({
      email: 'aman@gmail.com',
      password: 'zx@123ASDF',
      username: 'aman',
      referralCode: 'AMAN001',
      kycStatus: 'approved'
    });

    await user.save();
    console.log('Test user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser();