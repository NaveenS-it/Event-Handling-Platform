const express = require('express');
const router = express.Router();
const { bookTickets, getMyBookings, getBookingDetails } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All booking routes require auth

router.post('/book', bookTickets);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingDetails);

module.exports = router;
