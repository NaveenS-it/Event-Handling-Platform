const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
    .get(getEvents)
    .post(protect, authorize('admin', 'organizer'), createEvent);

router.route('/:id')
    .get(getEvent)
    .put(protect, authorize('admin', 'organizer'), updateEvent)
    .delete(protect, authorize('admin', 'organizer'), deleteEvent);

module.exports = router;
