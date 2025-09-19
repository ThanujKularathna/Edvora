const User = require('../models/userModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Activity = require('../models/activityModel');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalClasses = await Class.countDocuments();

  // Get recent activities from Activity model
  const recentActivities = await Activity.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(10);

  const formattedActivities = recentActivities.map(activity => ({
    user: activity.user?.name || 'Unknown User',
    action: activity.action,
    details: activity.details,
    createdAt: activity.createdAt
  }));

  res.status(200).json({
    status: 'success',
    stats: {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalClasses
    },
    recentActivities: formattedActivities
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

exports.getAllClasses = catchAsync(async (req, res, next) => {
  const classes = await Class.find();
  
  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: { classes }
  });
});

exports.getAllSubjects = catchAsync(async (req, res, next) => {
  const subjects = await Subject.find();
  
  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: { subjects }
  });
});

exports.getUserActivities = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const activities = await Activity.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalActivities = await Activity.countDocuments();

  res.status(200).json({
    status: 'success',
    results: activities.length,
    totalPages: Math.ceil(totalActivities / limit),
    currentPage: page,
    data: { activities }
  });
});