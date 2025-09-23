const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all admin routes
router.use(authController.protect);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Data routes
router
  .route('/users')
  .get(adminController.getAllUsers)
  .post(adminController.createUser);

router
  .route('/users/:id')
  .put(adminController.updateUser)
  .delete(adminController.deleteUser);

router.get('/classes', adminController.getAllClasses);
router.get('/subjects', adminController.getAllSubjects);
router.get('/activities', adminController.getUserActivities);

// Teacher management routes
router.post('/assign-teacher-class', adminController.assignTeacherToClass);
router.post('/remove-teacher-class', adminController.removeTeacherFromClass);
router.post('/assign-teacher-subject', adminController.assignSubjectToTeacher);
router.get('/teacher-assignments', adminController.getTeacherAssignments);
router.get('/teacher-classes/:email', adminController.getTeacherClasses);

// Student management routes
router.post('/assign-student-class', adminController.assignStudentToClass);
router.post('/remove-student-class', adminController.removeStudentFromClass);
router.get('/student-assignments', adminController.getStudentAssignments);
router.get('/student-classes/:email', adminController.getStudentClasses);

module.exports = router;
