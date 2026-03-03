const express = require('express');
const router = express.Router();
const { getCalendarData, createAppointment, saveDailyNote } = require('../controllers/calendarController');

router.get('/', getCalendarData);
router.post('/appointments', createAppointment);
router.post('/notes', saveDailyNote);

module.exports = router;
