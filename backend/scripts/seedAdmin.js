import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');

    const adminEmail = 'admin@mockmate.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin user '${adminEmail}' already exists in database.`);
    } else {
      const admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        authProvider: 'local'
      });
      console.log(`Admin user created successfully: ${admin.email} (role: ${admin.role})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
