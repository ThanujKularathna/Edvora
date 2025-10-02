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

exports.assignSubjectToClass = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { subjectId } = req.body;
  
  const classDoc = await Class.findById(id);
  
  if (!classDoc) {
    return next(new AppError('No class found with that ID', 404));
  }
  
  // Add subject to class if not already assigned
  if (!classDoc.subjects.includes(subjectId)) {
    classDoc.subjects.push(subjectId);
    await classDoc.save();
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      class: classDoc
    }
  });
});
