const express = require('express');
const subjectController = require('../controllers/subjectController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Admin only routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(subjectController.getAllSubjects)
  .post(subjectController.createSubject);

router
  .route('/:id')
  .delete(subjectController.deleteSubject);

module.exports = router;