const express = require('express');
const authController = require('../controllers/authController');
const assignmentController = require('../controllers/assignmentController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    assignmentController.getAllAssignments
  )
  .post(
    authController.protect,
    authController.restrictTo('teacher'),
    assignmentController.uploadAssignment,
    assignmentController.createAssignment
  );

// router
//   .route('/filter')
//   .get(
//     authController.protect,
//     authController.restrictTo('student', 'teacherj'),
//     assignmentController.getAssignmentsByClassAndSubject
//   );

// Route to download assignment PDF files
router
  .route('/download/:filename')
  .get(authController.protect, assignmentController.downloadAssignment);

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('teacher'),
    assignmentController.uploadAssignment,
    assignmentController.updateAssignment
  )
  .delete(
    authController.protect,
    authController.restrictTo('teacher'),
    assignmentController.deleteAssignment
  );

module.exports = router;
