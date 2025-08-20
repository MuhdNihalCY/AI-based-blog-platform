const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createMasterAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'nihalcy1234@gmail.com' },
        { username: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('Master admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      process.exit(0);
    }

    // Create master admin user
    const adminData = {
      username: 'admin',
      email: 'nihalcy1234@gmail.com',
      password: 'Admin@2024!',
      role: 'super_admin',
      profile: {
        firstName: 'Master',
        lastName: 'Admin'
      },
      isActive: true,
      emailVerified: true,
      settings: {
        notifications: {
          email: true,
          browser: true,
          contentGeneration: true,
          systemUpdates: true
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        }
      }
    };

    // Hash password
    const salt = await bcrypt.genSalt(12);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Master admin created successfully!');
    console.log('📧 Email: nihalcy1234@gmail.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: Admin@2024!');
    console.log('🛡️  Role: super_admin');
    console.log('');
    console.log('You can now login to the admin dashboard at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('Error creating master admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the script
createMasterAdmin();
