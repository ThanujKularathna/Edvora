const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.getUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
});

exports.uploadUserPhoto = upload.single('photo');

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, address } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { photo: req.file.filename },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3) Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return next(new AppError('New password and confirm password do not match.', 400));
  }

  // 4) Update password
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});
