const authService = require('./auth.service');

// --- Registration Controllers ---
const handleRequestRegistrationOtp = async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    const result = await authService.requestRegistrationOtp(phone_number);
    // In a real app, DO NOT send OTP back in the response.
    // It's included here for easier testing during development ONLY.
    res.status(200).json({ message: result.message, otp: result.otp });
  } catch (error) {
    // console.error('Request Registration OTP Error:', error);
    res.status(400).json({ message: error.message || 'Failed to send OTP.' });
    // next(error); // Pass to global error handler
  }
};

const handleVerifyOtpAndRegister = async (req, res, next) => {
  try {
    const { phone_number, otp, password } = req.body;
    const result = await authService.verifyOtpAndRegisterUser(phone_number, otp, password);
    res.status(201).json(result);
  } catch (error) {
    // console.error('Verify OTP and Register Error:', error);
    res.status(400).json({ message: error.message || 'Registration failed.' });
    // next(error);
  }
};

// --- Login Controller ---
const handleLogin = async (req, res, next) => {
  try {
    const { phone_number, password } = req.body;
    const result = await authService.loginUser(phone_number, password);
    res.status(200).json(result);
  } catch (error) {
    // console.error('Login Error:', error);
    res.status(401).json({ message: error.message || 'Login failed. Invalid credentials.' });
    // next(error);
  }
};

// --- Password Reset Controllers ---
const handleRequestPasswordResetOtp = async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    const result = await authService.requestPasswordResetOtp(phone_number);
    // DO NOT send OTP in response in production.
    res.status(200).json({ message: result.message, otp: result.otp });
  } catch (error) {
    // console.error('Request Password Reset OTP Error:', error);
    res.status(400).json({ message: error.message || 'Failed to send password reset OTP.' });
    // next(error);
  }
};

const handleVerifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { phone_number, otp } = req.body;
    const result = await authService.verifyPasswordResetOtp(phone_number, otp);
    res.status(200).json(result);
  } catch (error) {
    // console.error('Verify Password Reset OTP Error:', error);
    res.status(400).json({ message: error.message || 'OTP verification failed.' });
    // next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { phone_number, otp, new_password } = req.body;
    const result = await authService.resetPassword(phone_number, otp, new_password);
    res.status(200).json(result);
  } catch (error) {
    // console.error('Reset Password Error:', error);
    res.status(400).json({ message: error.message || 'Password reset failed.' });
    // next(error);
  }
};

module.exports = {
  handleRequestRegistrationOtp,
  handleVerifyOtpAndRegister,
  handleLogin,
  handleRequestPasswordResetOtp,
  handleVerifyPasswordResetOtp,
  handleResetPassword,
};
