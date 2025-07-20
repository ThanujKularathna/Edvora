// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const User = require('../models/userModel');

exports.getUser = catchAsync(async (req, res, next) => {
  // const query = User.findById(req.params.id);
  // // const user = await query;
  // if (!doc) {
  //   return next(new AppError('No tour document with that ID', 404));
  // }
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     data: doc
  //   }
  // });

  res.status(200).json({
    status: 'success',
    user: req.user
  });
});
