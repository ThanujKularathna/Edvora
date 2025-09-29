const express = require('express');
const authController = require('../controllers/authController');
const classController = require('../controllers/classController');

const router = express.Router();

router.route('/').get(classController.getClasses);

router
  .route('/:id/assign-subject')
  .patch(authController.protect, authController.restrictTo('admin'), classController.assignSubjectToClass);

module.exports = router;
