const Booking = require('../model/Booking');
const Screening = require('../model/Screening');

// @route POST /api/bookings  [User]
const createBooking = async (req, res) => {
  try {
    const { screeningId, seats } = req.body;
    if (!screeningId || !seats || seats.length === 0)
      return res.status(400).json({ message: 'Screening and seats are required' });

    const screening = await Screening.findById(screeningId);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });

    // Check seat conflicts
    const conflicts = seats.filter(s => screening.bookedSeats.includes(s));
    if (conflicts.length > 0)
      return res.status(400).json({ message: `Seats already booked: ${conflicts.join(', ')}` });

    // Reserve seats
    screening.bookedSeats.push(...seats);
    await screening.save();

    const totalPrice = seats.length * screening.ticketPrice;
    const booking = await Booking.create({
      user: req.user._id,
      screening: screeningId,
      seats,
      totalPrice,
    });

    const populated = await Booking.findById(booking._id)
      .populate({ path: 'screening', populate: [{ path: 'movie', select: 'title poster' }, { path: 'hall', populate: { path: 'company', select: 'name' } }] });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/bookings/my  [User]
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'screening', populate: [{ path: 'movie', select: 'title poster genre duration' }, { path: 'hall', select: 'name', populate: { path: 'company', select: 'name' } }] })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/bookings  [Admin]
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'screening', populate: [{ path: 'movie', select: 'title' }, { path: 'hall', select: 'name', populate: { path: 'company', select: 'name' } }] })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/bookings/:id/cancel  [User]
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Booking already cancelled' });

    // Release seats
    const screening = await Screening.findById(booking.screening);
    if (screening) {
      screening.bookedSeats = screening.bookedSeats.filter(s => !booking.seats.includes(s));
      await screening.save();
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, cancelBooking };
