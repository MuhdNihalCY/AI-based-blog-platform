const mongoose = require('mongoose');
const User = require('../models/User');
const { MASTER_ADMIN } = require('../config/admin');
const logger = require('../utils/logger');
require('dotenv').config();

async function setupMasterAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-blog-platform';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Check if master admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: MASTER_ADMIN.email },
        { username: MASTER_ADMIN.username }
      ]
    });

    if (existingAdmin) {
      logger.info('Master admin account already exists');
      console.log('\n✅ Master admin account already exists');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Create master admin account
    const masterAdmin = new User({
      username: MASTER_ADMIN.username,
      email: MASTER_ADMIN.email,
      password: MASTER_ADMIN.password,
      role: MASTER_ADMIN.role,
      isActive: MASTER_ADMIN.isActive,
      profile: {
        firstName: MASTER_ADMIN.firstName,
        lastName: MASTER_ADMIN.lastName
      }
    });

    await masterAdmin.save();

    logger.info('Master admin account created successfully');
    
    console.log('\n🎉 Master admin account created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Username: ${MASTER_ADMIN.username}`);
    console.log(`   Email: ${MASTER_ADMIN.email}`);
    console.log(`   Password: ${MASTER_ADMIN.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
    console.log('   • Change the default password immediately after first login');
    console.log('   • Store these credentials securely');
    console.log('   • Delete this script after successful setup');
    console.log('\n🚀 You can now login to the admin dashboard!');

  } catch (error) {
    logger.error('Failed to setup master admin:', error);
    console.error('\n❌ Failed to setup master admin account:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupMasterAdmin();
}

module.exports = setupMasterAdmin;
