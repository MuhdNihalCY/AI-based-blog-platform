// Master Admin Account Configuration
// This is the default admin account created on first system setup

const MASTER_ADMIN = {
  username: 'admin',
  email: 'admin@aiblogplatform.com',
  password: 'Admin@2024!', // This should be changed after first login
  firstName: 'Master',
  lastName: 'Administrator',
  role: 'super_admin',
  isActive: true
};

// Password requirements for admin accounts
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  // Password must contain at least one uppercase letter, one lowercase letter, 
  // one number, and one special character
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// OTP Configuration
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  cooldownMinutes: 5
};

module.exports = {
  MASTER_ADMIN,
  PASSWORD_REQUIREMENTS,
  OTP_CONFIG
};
