const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all admin routes
router.use(authController.protect);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Data routes
router.get('/users', adminController.getAllUsers);
router.get('/classes', adminController.getAllClasses);
router.get('/subjects', adminController.getAllSubjects);
router.get('/activities', adminController.getUserActivities);

module.exports = router;