const express = require('express');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('student'));

router.get('/dashboard', studentController.getStudentDashboard);
router.get('/subjects', studentController.getStudentSubjects);
router.get('/assignments', studentController.getStudentAssignments);
router.get('/subject/:subjectName/class/:className', studentController.getSubjectData);

module.exports = router;