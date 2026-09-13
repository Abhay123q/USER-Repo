const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /send - send notification email
router.post('/send', notificationController.sendNotification);

// GET / - get notification history
router.get('/', notificationController.getHistory);

module.exports = router;
