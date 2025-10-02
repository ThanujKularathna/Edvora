const User = require('../models/userModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Activity = require('../models/activityModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { logActivity } = require('../utils/activityLogger');

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

  const formattedActivities = recentActivities.map((activity) => ({
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
  const users = await User.find()
    .select('name email _id role city phoneNumber')
    .limit(5);
  // Log user viewing activity
  // await logActivity(req.user._id, 'Users Viewed', 'Viewed all users list', req);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    role,
    classes,
    subjects,
    phoneNumber,
    city
  } = req.body;

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

  // Log user creation activity
  // await logActivity(
  //   req.user._id,
  //   'User Created',
  //   `Created ${role}: ${name}`,
  //   req
  // );

  res.status(201).json({
    status: 'success',
    data: { user: newUser }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    select: '-password'
  });

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Log user update activity
  await logActivity(
    req.user._id,
    'User Updated',
    `Updated user: ${updatedUser.name}`,
    req
  );

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Log user deletion activity
  await logActivity(
    req.user._id,
    'User Deleted',
    `Deleted user: ${deletedUser.name}`,
    req
  );

  res.status(204).json({
    status: 'success',
    data: null
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

// Teacher management methods
exports.assignTeacherToClass = catchAsync(async (req, res, next) => {
  const { email, className } = req.body;

  const teacher = await User.findOne({ email, role: 'teacher' });
  if (!teacher) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Teacher not found' });
  }

  const classDoc = await Class.findOne({ className });
  if (!classDoc) {
    return res.status(404).json({ status: 'fail', message: 'Class not found' });
  }

  await User.findByIdAndUpdate(teacher._id, {
    $addToSet: { classes: classDoc._id }
  });

  await Class.findByIdAndUpdate(classDoc._id, {
    $addToSet: { teachers: teacher._id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Teacher assigned to class successfully'
  });
});

exports.removeTeacherFromClass = catchAsync(async (req, res, next) => {
  const { email, className } = req.body;

  const teacher = await User.findOne({ email, role: 'teacher' });
  if (!teacher) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Teacher not found' });
  }

  const classDoc = await Class.findOne({ className });
  if (!classDoc) {
    return res.status(404).json({ status: 'fail', message: 'Class not found' });
  }

  await User.findByIdAndUpdate(teacher._id, {
    $pull: { classes: classDoc._id }
  });

  await Class.findByIdAndUpdate(classDoc._id, {
    $pull: { teachers: teacher._id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Teacher removed from class successfully'
  });
});

exports.assignSubjectToTeacher = catchAsync(async (req, res, next) => {
  const { email, subjectName } = req.body;

  const teacher = await User.findOne({ email, role: 'teacher' });
  if (!teacher) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Teacher not found' });
  }

  const subject = await Subject.findOne({ name: subjectName });
  if (!subject) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Subject not found' });
  }

  await User.findByIdAndUpdate(teacher._id, {
    $addToSet: { subjects: subject._id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Subject assigned to teacher successfully'
  });
});

exports.getTeacherAssignments = catchAsync(async (req, res, next) => {
  const teachers = await User.find({ role: 'teacher' })
    .populate('classes', 'className')
    .populate('subjects', 'name')
    .select('email');

  const assignments = {};
  teachers.forEach((teacher) => {
    assignments[teacher.email.toLowerCase()] = {
      classes: teacher.classes?.map((c) => c.className) || [],
      subjects: teacher.subjects?.map((s) => s.name) || []
    };
  });

  res.status(200).json({
    status: 'success',
    data: { assignments }
  });
});

exports.getTeacherClasses = catchAsync(async (req, res, next) => {
  const { email } = req.params;

  const teacher = await User.findOne({ email, role: 'teacher' }).populate(
    'classes',
    'className'
  );

  if (!teacher) {
    return res.status(404).json({
      status: 'fail',
      message: 'Teacher not found'
    });
  }

  const classes = teacher.classes?.map((c) => c.className) || [];

  res.status(200).json({
    status: 'success',
    data: { classes }
  });
});

// Student management methods
exports.assignStudentToClass = catchAsync(async (req, res, next) => {
  const { email, className } = req.body;

  const student = await User.findOne({ email, role: 'student' });
  if (!student) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Student not found' });
  }

  const classDoc = await Class.findOne({ className });
  if (!classDoc) {
    return res.status(404).json({ status: 'fail', message: 'Class not found' });
  }

  await User.findByIdAndUpdate(student._id, {
    classes: classDoc._id.toString()
  });

  await Class.findByIdAndUpdate(classDoc._id, {
    $addToSet: { students: student._id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Student assigned to class successfully'
  });
});

exports.removeStudentFromClass = catchAsync(async (req, res, next) => {
  const { email, className } = req.body;

  const student = await User.findOne({ email, role: 'student' });
  if (!student) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Student not found' });
  }

  const classDoc = await Class.findOne({ className });
  if (!classDoc) {
    return res.status(404).json({ status: 'fail', message: 'Class not found' });
  }

  await User.findByIdAndUpdate(student._id, {
    classes: null
  });

  await Class.findByIdAndUpdate(classDoc._id, {
    $pull: { students: student._id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Student removed from class successfully'
  });
});

exports.getStudentAssignments = catchAsync(async (req, res, next) => {
  const students = await User.find({ role: 'student' })
    .select('email classes');

  const assignments = {};
  for (const student of students) {
    let classes = [];
    if (student.classes) {
      try {
        const classDoc = await Class.findById(student.classes).select('className');
        if (classDoc) {
          classes = [classDoc.className];
        }
      } catch (error) {
        console.error('Error fetching class:', error);
      }
    }
    assignments[student.email.toLowerCase()] = { classes };
  }

  res.status(200).json({
    status: 'success',
    data: { assignments }
  });
});

exports.getStudentClasses = catchAsync(async (req, res, next) => {
  const { email } = req.params;

  const student = await User.findOne({ email, role: 'student' }).select('classes');

  if (!student) {
    return res.status(404).json({
      status: 'fail',
      message: 'Student not found'
    });
  }

  let classes = [];
  if (student.classes) {
    try {
      const classDoc = await Class.findById(student.classes).select('className');
      if (classDoc) {
        classes = [classDoc.className];
      }
    } catch (error) {
      console.error('Error fetching class:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { classes }
  });
});
