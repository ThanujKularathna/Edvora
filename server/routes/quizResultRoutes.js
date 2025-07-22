const express = require('express');
const authController = require('../controllers/authController');
const quizResultController = require('../controllers/quizResultController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('student'),
    quizResultController.submitQuizAnswers
  );

router
  .route('/download')
  .get(
    authController.restrictTo('teacher'),
    quizResultController.downloadQuizResults
  );

module.exports = router;
