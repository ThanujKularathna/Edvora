const User = require('../models/userModel');
const Class = require('../models/classModel');
const Assignment = require('../models/assignmentModel');
const Quiz = require('../models/quizModel');
const Video = require('../models/videoModel');
const QuizResult = require('../models/quizResultModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Subject = require('../models/subjectModel');

exports.getStudentDashboard = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;

  // Get student details with populated class info
  const student = await User.findById(studentId);
  console.log(student);

  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  // Extract student's class (now it's an object with className)
  const studentClass = student.classes.className;

  if (!studentClass) {
    return next(new AppError('Student class not found', 404));
  }

  // Get upcoming assignments (homeworks) for the student's class
  const upcomingAssignments = await Assignment.find({
    class: studentClass,
    deadline: { $gte: new Date() } // Only future assignments
  })
    .populate([
      { path: 'teacher', select: 'name' },
      { path: 'subject', select: 'name' }
    ])

    .sort({ deadline: 1 })
    .limit(5);

  // Get class ObjectId for quiz queries
  const classDoc = await Class.findOne({ className: studentClass });
  if (!classDoc) {
    return next(new AppError('Class not found', 404));
  }

  console.log(classDoc);

  res.status(200).json({
    status: 'success',
    data: {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        class: studentClass
      },
      subjects: student.classes?.subjects || [],
      upcomingAssignments
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

exports.getSubjectData = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const { subjectName, className } = req.params;

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  // Get class and subject ObjectIds
  const classDoc = await Class.findOne({ className });
  const subjectDoc = await Subject.findOne({ name: subjectName });

  if (!classDoc) {
    return next(new AppError('Class not found', 404));
  }
  if (!subjectDoc) {
    return next(new AppError('Subject not found', 404));
  }

  // Fetch all data in parallel using ObjectIds
  const [assignments, videos, quizzes, submittedQuizResults] = await Promise.all([
    Assignment.find({ class: className, subject: subjectDoc._id })
      .populate('teacher', 'name')
      .populate('subject', 'name'),
    Video.find({ class: className, subject: subjectDoc._id })
      .populate('teacherId', 'name')
      .populate('subject', 'name'),
    Quiz.find({ class: classDoc._id, subject: subjectDoc._id })
      .populate('teacherId', 'name')
      .populate('subject', 'name'),
    QuizResult.find({ studentId })
  ]);

  // Create a map of quiz results by quizId
  const quizResultsMap = {};
  submittedQuizResults.forEach(result => {
    quizResultsMap[result.quizId.toString()] = result;
  });

  // Add completion status and result data to each quiz
  const quizzesWithStatus = quizzes.map(quiz => {
    const result = quizResultsMap[quiz._id.toString()];
    return {
      ...quiz.toObject(),
      isCompleted: !!result,
      result: result || null
    };
  });

  // Ensure assignments have id field for frontend
  const assignmentsWithId = assignments.map(assignment => {
    const assignmentObj = assignment.toObject();
    assignmentObj.id = assignmentObj._id;
    return assignmentObj;
  });

  res.status(200).json({
    status: 'success',
    data: {
      assignments: assignmentsWithId,
      videos: videos,
      quizzes: quizzesWithStatus
    }
  });
});
