const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, cancelBooking } = require('../controller/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/', protect, adminOnly, getAllBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
