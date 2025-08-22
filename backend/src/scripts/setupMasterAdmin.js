const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');
require('dotenv').config();

// Master Admin Credentials
const MASTER_ADMIN = {
  username: 'admin',
  email: 'nihalcy1234@gmail.com',
  password: 'Admin@2024!',
  role: 'super_admin',
  profile: {
    firstName: 'Master',
    lastName: 'Admin'
  },
  isActive: true,
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      dashboard: true
    }
  }
};

async function setupMasterAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: MASTER_ADMIN.email },
        { username: MASTER_ADMIN.username },
        { role: { $in: ['admin', 'super_admin'] } }
      ]
    });

    if (existingAdmin) {
      logger.warn('Admin user already exists');
      console.log('❌ Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Create master admin user
    const adminUser = new User(MASTER_ADMIN);
    await adminUser.save();

    logger.info('Master admin user created successfully');
    console.log('✅ Master admin user created successfully!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log(`   Username: ${MASTER_ADMIN.username}`);
    console.log(`   Email: ${MASTER_ADMIN.email}`);
    console.log(`   Password: ${MASTER_ADMIN.password}`);
    console.log(`   Role: ${MASTER_ADMIN.role}`);
    console.log('');
    console.log('🔐 Please change the password after first login for security!');
    console.log('');
    console.log('📧 Forgot password feature is available with SMTP OTP method');
    console.log('   Make sure to configure SMTP settings in your .env file');

    process.exit(0);

  } catch (error) {
    logger.error('Failed to setup master admin:', error);
    console.error('❌ Failed to setup master admin:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupMasterAdmin();
