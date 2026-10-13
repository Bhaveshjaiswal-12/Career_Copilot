import crypto from 'crypto';
import User from '../models/User.js';
import InterviewReport from '../models/InterviewReport.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { sendTokenResponse } from '../middleware/auth.js';

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  // Check duplicates explicitly for better error messages
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new AppError('An account with that email already exists.', 409);
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw new AppError('That username is already taken.', 409);
  }

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email,
    password,
  });

  sendTokenResponse(user, 201, res);
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  sendTokenResponse(user, 200, res);
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In production, send email here. For now, return the token in dev.
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  if (process.env.NODE_ENV === 'development') {
    return res.json({
      success: true,
      message: 'Password reset token generated.',
      resetUrl, // Only exposed in development
    });
  }

  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  });
});

/**
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token.', 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found.', 404);

  const { name, profile } = req.body;
  if (name) user.name = name;
  if (profile) {
    user.profile = {
      ...user.profile.toObject(),
      ...profile,
    };
  }

  await user.save();
  res.json({ success: true, user });
});

/**
 * PUT /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found.', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully.' });
});

import SavedJob from '../models/SavedJob.js';

/**
 * GET /api/auth/export-data
 * Export all personal user data (profile, reports, saved jobs) as JSON
 */
export const exportData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [user, reports, savedJobs] = await Promise.all([
    User.findById(userId).lean(),
    InterviewReport.find({ userId }).lean(),
    SavedJob.find({ userId }).lean(),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    account: {
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      profile: user.profile,
    },
    interviewReports: reports,
    savedJobs: savedJobs,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="career-copilot-data-${user.username || 'user'}.json"`);
  res.json(exportPayload);
});

/**
 * DELETE /api/auth/account
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete all reports belonging to user
  await InterviewReport.deleteMany({ userId });

  // Delete all saved jobs
  await SavedJob.deleteMany({ userId });

  // Delete user
  await User.findByIdAndDelete(userId);

  // Clear cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  res.json({ success: true, message: 'Account and associated data deleted successfully.' });
});
