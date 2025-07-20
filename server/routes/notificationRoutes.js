const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/send', notificationController.sendNotification);
router.post('/send-to-class', notificationController.sendNotification);
router.post('/send-to-role', notificationController.sendNotification);

module.exports = router;
