const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification', 'login_verification'],
    default: 'password_reset'
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && !this.isExpired() && this.attempts < this.maxAttempts;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to mark as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Static method to create OTP
otpSchema.statics.createOTP = function(email, type = 'password_reset', expiryMinutes = 10) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return this.create({
    email,
    otp,
    type,
    expiresAt
  });
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, type = 'password_reset') {
  const otpRecord = await this.findOne({
    email: email.toLowerCase(),
    type,
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error('No OTP found for this email');
  }

  if (otpRecord.isExpired()) {
    throw new Error('OTP has expired');
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    throw new Error('Maximum attempts exceeded');
  }

  if (otpRecord.otp !== otp) {
    await otpRecord.incrementAttempts();
    throw new Error('Invalid OTP');
  }

  return otpRecord;
};

// Static method to invalidate all OTPs for an email
otpSchema.statics.invalidateAllOTPs = function(email, type = 'password_reset') {
  return this.updateMany(
    { email: email.toLowerCase(), type, isUsed: false },
    { isUsed: true }
  );
};

module.exports = mongoose.model('OTP', otpSchema);
