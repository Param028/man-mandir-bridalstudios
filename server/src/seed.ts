import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin';
import connectDB from './config/db';

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    await Admin.deleteMany({}); // Warning: Clears all admins

    const superAdmin = new Admin({
      name: 'Super Admin',
      email: 'admin@manmandir.com',
      password: 'password123',
      role: 'Super Admin',
      active: true,
    });

    await superAdmin.save();
    console.log('Super Admin seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

seedAdmin();
