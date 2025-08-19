const User = require('../models/userModel');
const Class = require('../models/classModel');
const Assignment = require('../models/assignmentModel');
const Quiz = require('../models/quizModel');
const Video = require('../models/videoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getStudentDashboard = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;

  // Get student details with populated class info
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  const studentWithClass = await student.populateClasses();
  const studentClass = student.classes;
  // console.log(studentClass);
  const classDetails = studentWithClass.classDetails;
  if (!classDetails) {
    return next(new AppError('Class not found', 404));
  }

  // Get upcoming assignments (homeworks) for the student's class
  const upcomingAssignments = await Assignment.find({
    class: studentClass,
    deadline: { $gte: new Date() } // Only future assignments
  })
    .populate('teacherId', 'name')
    .sort({ deadline: 1 })
    .limit(5);

  // Get all assignments for the student's class
  const allAssignments = await Assignment.find({
    class: studentClass
  }).populate('teacherId', 'name');

  // Get quizzes for the student's class
  const quizzes = await Quiz.find({
    class: studentClass
  }).populate('teacherId', 'name');

  // Get videos for the student's class
  const videos = await Video.find({
    class: studentClass
  }).populate('teacherId', 'name');

  res.status(200).json({
    status: 'success',
    data: {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        class: studentClass
      },
      subjects: classDetails.subjects,
      upcomingAssignments,
      assignments: allAssignments,
      quizzes,
      videos
    }
  });
});

exports.getStudentSubjects = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  const classDetails = await Class.findOne({ className: student.classes });
  if (!classDetails) {
    return next(new AppError('Class not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subjects: classDetails.subjects,
      className: student.classes
    }
  });
});

exports.getStudentAssignments = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  const assignments = await Assignment.find({
    class: student.classes
  }).populate('teacherId', 'name');

  res.status(200).json({
    status: 'success',
    results: assignments.length,
    data: assignments
  });
});
