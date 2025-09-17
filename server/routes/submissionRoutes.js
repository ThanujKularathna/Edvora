const express = require('express');
const authController = require('../controllers/authController');
const submissionController = require('../controllers/submissionController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/assignment/:assignmentId')
  .post(
    authController.restrictTo('student'),
    submissionController.uploadSubmission,
    submissionController.submitHomework
  )
  .get(
    authController.restrictTo('student'),
    submissionController.getMySubmission
  );

router
  .route('/download/:filename')
  .get(submissionController.downloadSubmission);

module.exports = router;