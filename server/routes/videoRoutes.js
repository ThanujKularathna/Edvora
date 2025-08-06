const express = require('express');
const videoController = require('../controllers/videoController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
// router.use(authController.protect);

router.post(
  '/upload',
  authController.protect,
  authController.restrictTo('teacher'),
  videoController.uploadVideo,
  videoController.createVideo
);

router.get('/class/:className', videoController.getVideosByClass);

router.get('/stream/:id', videoController.streamVideo);

router.delete('/:id', videoController.deleteVideo);

module.exports = router;
