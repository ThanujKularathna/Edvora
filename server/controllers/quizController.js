const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Quiz = require('../models/quizModel');
const Class = require('../models/classModel');
const { logActivity } = require('../utils/activityLogger');

exports.createQuiz = catchAsync(async (req, res, next) => {
  const teacherClass = await Class.findOne({ className: req.body.class });
  const quizDetails = {
    ...req.body,
    class: teacherClass._id
  };
  const newQuiz = await Quiz.create(quizDetails);
  if (!newQuiz) return next(new AppError('Quiz not created', 400));

  // Log quiz creation activity
  await logActivity(req.user._id, 'Quiz Created', `Created quiz: ${newQuiz.title}`, req);

  // Send notification to all users
  // sendQuizNotification(req, newQuiz);
  console.log('Quiz created successfully');

  res.status(201).json({
    status: 'success',
    data: {
      quiz: newQuiz
    }
  });
});

exports.deleteQuiz = catchAsync(async (req, res, next) => {
  const deleteQ = await Quiz.findByIdAndDelete(req.params.id);
  if (!deleteQ) return next(new AppError('Quiz not found', 404));
  
  // Log quiz deletion activity
  await logActivity(req.user._id, 'Quiz Deleted', `Deleted quiz: ${deleteQ.title}`, req);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateQuiz = catchAsync(async (req, res, next) => {
  const updateQ = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updateQ) return next(new AppError('Quiz not found', 404));
  res.status(200).json({
    status: 'success',
    data: {
      quiz: updateQ
    }
  });
});

/**
 * Get all quizzes by teacher ID and class
 * @route GET /api/v1/quizzes/teacher/:teacherId/class/:className
 */
exports.getQuizzesByTeacherAndClass = catchAsync(async (req, res, next) => {
  const { teacherId, className } = req.params;
  console.log('Fetching quizzes with params:', { teacherId, className });

  if (!teacherId || !className) {
    return next(new AppError('Teacher ID and class name are required', 400));
  }

  const classDoc = await Class.findOne({ className });
  if (!classDoc) {
    return next(new AppError('Class not found', 404));
  }

  const quizzes = await Quiz.find({
    teacherId,
    class: classDoc._id
  })
    .populate('subject', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    data: {
      quizzes
    }
  });
});

/**
 * Get all quizzes by teacher ID
 * @route GET /api/v1/quizzes/teacher/:teacherId
 */
exports.getQuizzesByTeacher = catchAsync(async (req, res, next) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    return next(new AppError('Teacher ID is required', 400));
  }

  const quizzes = await Quiz.find({ teacherId }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    data: {
      quizzes
    }
  });
});

/**
 * Get a quiz by ID
 * @route GET /api/v1/quizzes/:id
 */
exports.getQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      quiz
    }
  });
});

/**
 * Get quizzes by class
 * @route GET /api/v1/quizzes/class/:className
 */
exports.getQuizzesByClass = catchAsync(async (req, res, next) => {
  const { className } = req.params;

  if (!className) {
    return next(new AppError('Class name is required', 400));
  }

  const quizzes = await Quiz.find({ class: className })
    .populate('teacherId', 'name')
    .populate('subject', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    data: {
      quizzes
    }
  });
});

/**
 * Submit quiz result
 * @route POST /api/v1/quizzes/submit-result
 */
exports.submitQuizResult = catchAsync(async (req, res, next) => {
  const { quizId, answers, score, totalQuestions } = req.body;
  const studentId = req.user._id;

  const QuizResult = require('../models/quizResultModel');

  // Create quiz result
  const result = await QuizResult.findOneAndUpdate(
    { quizId, studentId },
    {
      answers,
      score,
      totalQuestions,
      submittedAt: Date.now()
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Log quiz submission activity
  await logActivity(studentId, 'Quiz Submitted', `Submitted quiz with score: ${score}/${totalQuestions}`, req);

  res.status(201).json({
    status: 'success',
    data: {
      result
    }
  });
});
