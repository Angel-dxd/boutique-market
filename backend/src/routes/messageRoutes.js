const express = require('express');
const router = express.Router();
const { remindAppointment, contactProvider } = require('../controllers/messageController');

router.post('/remind-client', remindAppointment);
router.post('/contact-provider', contactProvider);

module.exports = router;
