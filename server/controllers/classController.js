const User = require('../models/userModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Assignment = require('../models/assignmentModel');
const Quiz = require('../models/quizModel');
const Video = require('../models/videoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { logActivity } = require('../utils/activityLogger');

exports.getClasses = catchAsync(async (req, res, next) => {
  const classes = await Class.find();
  
  // Log class viewing activity
  if (req.user) {
    await logActivity(req.user.id, 'Classes Viewed', 'Viewed class list', req);
  }
  
  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: classes
  });
});
