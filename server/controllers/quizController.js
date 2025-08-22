const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Quiz = require('../models/quizModel');

exports.createQuiz = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newQuiz = await Quiz.create(req.body);
  if (!newQuiz) return next(new AppError('Quiz not created', 400));

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

  // Log the query we're about to execute
  console.log('Executing query:', { teacherId, class: className });

  const quizzes = await Quiz.find({
    teacherId,
    class: className
  })
    .populate({ path: 'subject', select: 'name' })
    .sort({ createdAt: -1 }); // Sort by creation date, newest first

  console.log(`Found ${quizzes.length} quizzes`);

  // If no quizzes found, return empty array instead of error
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
