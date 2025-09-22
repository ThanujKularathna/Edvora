const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// const { sendEmail } = require('../utils/email');
const Email = require('../utils/email');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { path } = require('../models/questionModel');
const { logActivity } = require('../utils/activityLogger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECURITY_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIERS_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  // Classes will be automatically populated by post-find middleware
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role, classes, subjects, phoneNumber, city } =
    req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
    classes,
    subjects,
    phoneNumber,
    city
  });

  // Log signup activity
  await logActivity(
    newUser._id,
    'User Registration',
    `New ${newUser.role} account created`,
    req
  );

  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email or password!', 400));
  }

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Log login activity
  await logActivity(user._id, 'User Login', `${user.role} logged in`, req);

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  // Log logout activity if user is authenticated
  if (req.user) {
    await logActivity(
      req.user._id,
      'User Logout',
      `${req.user.role} logged out`,
      req
    );
  }

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('user not logged in, please log in', 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECURITY_KEY
  );

  //CHECK USER STILL EXIST
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('user no longer exists', 401));
  }

  //CHECK PASSWORD CHANGE AFTER JWT ISSUED
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password, please log in again', 401)
    );
  }

  req.user = currentUser;
  // console.log(req.user);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(`restric to ${req.user.role}`);
      return next(
        new AppError('You do not have permision to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on posted email
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Can't find a user with that email", 401));
  }

  //2)Genarate the random reset token
  const resetToken = await user.createResetToken();
  await user.save({ validateBeforeSave: false });

  //3)send email

  try {
    const resetURL = `${req.protocol}://${process.env.CLIENT_HOST}/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('there is a error sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Log password reset activity
  await logActivity(
    user._id,
    'Password Reset',
    'Password reset successfully',
    req
  );

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Check if req.user exists and has an id
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (
    !req.body.passwordCurrent ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError('Please provide current password and new password', 400)
    );
  }

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect current password', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log password update activity
  await logActivity(
    user._id,
    'Password Updated',
    'Password changed successfully',
    req
  );

  createSendToken(user, 200, res);
});

// only for render pages, no errors
/*exports.isLoggedIn = async (req, res, next) => {
  console.log(req.cookies.jwt);
  if (req.cookies.jwt) {
    //1)Verification token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    //2)check if user still exist //what if user deleted it mean time but token till exist
    const CurrentUser = await User.findById(decoded.id);
    if (!CurrentUser) {
      return next(new AppError('user no longer exists', 401));
    }
    //3)check if user changed passoword after jwd was issued
    if (CurrentUser.changePasswordAfter(decoded.iat)) {
      return next(
        new AppError('user recently changed password, please log in again', 401)
      );
    }

    //THERE IS A LOGGED IN USER
    res.status(200).json({
      status: 'success',
      user: CurrentUser
    });
  }
};
*/
