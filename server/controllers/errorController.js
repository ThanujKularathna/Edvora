const AppError = require('../utils/appError');

function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue)[0];
  const code = 409;
  const message = `An account with that ${field} already exists.`;
  return new AppError(message, code);
}

function handlePasswordValidation(err) {
  const code = 400;
  const message = `password is too short`;
  return new AppError(message, code);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.code === 11000) {
    console.log('error ran');
    err = handleDuplicateKeyError(err);
  }

  if (err._message === 'User validation failed') {
    err = handlePasswordValidation(err);
  }

  console.log('consolling=>', err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
