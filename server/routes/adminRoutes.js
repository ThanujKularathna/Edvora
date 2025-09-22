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

module.exports = router;
