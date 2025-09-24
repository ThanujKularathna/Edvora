const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
// const studentRoutes = require('./studentRoutes');

const router = express.Router();

//Auth routes
router.get('/logout', authController.logout);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// router.get('/isLoggedIn', authController.isLoggedIn);

router.get('/me', authController.protect, userController.getUser);
router.patch('/updateProfile', authController.protect, userController.updateProfile);
router.patch('/updatePhoto', authController.protect, userController.uploadUserPhoto, userController.updatePhoto);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

//Student routes

module.exports = router;
