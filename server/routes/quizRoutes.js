const express = require('express');
const authController = require('../controllers/authController');
const quizController = require('../controllers/quizController');
const quizResultRoutes = require('./quizResultRoutes');

const router = express.Router();

// Nested routes for quiz results & answers
router.use('/:quizId/results', quizResultRoutes);

router
  .route('/create')
  .post(
    authController.protect,
    authController.restrictTo('teacher'),
    quizController.createQuiz
  );

// Route to get quizzes by teacher ID and class
router
  .route('/teacher/:teacherId/class/:className')
  .get(authController.protect, quizController.getQuizzesByTeacherAndClass);

// Route to get all quizzes by teacher ID
router
  .route('/teacher/:teacherId')
  .get(authController.protect, quizController.getQuizzesByTeacher);

// Route to get quizzes by class
router
  .route('/class/:className')
  .get(authController.protect, quizController.getQuizzesByClass);

// Route to get, update or delete a specific quiz
router
  .route('/:id')
  .get(authController.protect, quizController.getQuiz)
  .patch(
    authController.protect,
    authController.restrictTo('teacher'),
    quizController.updateQuiz
  )
  .delete(
    authController.protect,
    authController.restrictTo('teacher'),
    quizController.deleteQuiz
  );

module.exports = router;
