const express = require('express');
const authController = require('../controllers/authController');
const classController = require('../controllers/classController');

const router = express.Router();

router.route('/').get(classController.getClasses);

module.exports = router;
