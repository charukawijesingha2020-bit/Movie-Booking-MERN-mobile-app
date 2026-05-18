const Screening = require('../model/Screening');

// @route GET /api/screenings
const getScreenings = async (req, res) => {
  try {
    // Only expose active screenings to users; getAllScreenings (admin) returns all.
    const screenings = await Screening.find({ isActive: true })
      .populate('movie', 'title poster duration genre rating')
      .populate({ path: 'hall', populate: { path: 'company', select: 'name' } })
      .sort({ date: 1, showtime: 1 });
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/screenings/hall/:hallId
const getScreeningsByHall = async (req, res) => {
  try {
    const screenings = await Screening.find({ hall: req.params.hallId, isActive: true })
      .populate('movie', 'title poster duration genre rating')
      .populate('hall', 'name rows seatsPerRow')
      .sort({ date: 1, showtime: 1 });
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/screenings/movie/:movieId
const getScreeningsByMovie = async (req, res) => {
  try {
    const screenings = await Screening.find({ movie: req.params.movieId, isActive: true })
      .populate('hall', 'name rows seatsPerRow')
      .populate({ path: 'hall', populate: { path: 'company', select: 'name address' } })
      .sort({ date: 1, showtime: 1 });
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/screenings/:id
const getScreeningById = async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.id)
      .populate('movie')
      .populate({ path: 'hall', populate: { path: 'company', select: 'name address' } });
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.json(screening);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/screenings  [Admin]
const createScreening = async (req, res) => {
  try {
    const { movie, hall, date, showtime, ticketPrice } = req.body;
    if (!movie || !hall || !date || !showtime || !ticketPrice)
      return res.status(400).json({ message: 'All fields are required' });
    const screening = await Screening.create({ movie, hall, date, showtime, ticketPrice });
    const populated = await Screening.findById(screening._id)
      .populate('movie', 'title poster')
      .populate({ path: 'hall', populate: { path: 'company', select: 'name' } });
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/screenings/:id  [Admin]
const updateScreening = async (req, res) => {
  try {
    const screening = await Screening.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('movie', 'title poster')
      .populate({ path: 'hall', populate: { path: 'company', select: 'name' } });
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.json(screening);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/screenings/:id  [Admin]
const deleteScreening = async (req, res) => {
  try {
    const screening = await Screening.findByIdAndDelete(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.json({ message: 'Screening removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/screenings/all  [Admin — includes inactive]
const getAllScreenings = async (req, res) => {
  try {
    const screenings = await Screening.find()
      .populate('movie', 'title poster duration genre rating')
      .populate({ path: 'hall', populate: { path: 'company', select: 'name' } })
      .sort({ date: 1, showtime: 1 });
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getScreenings, getAllScreenings, getScreeningsByHall, getScreeningsByMovie,
  getScreeningById, createScreening, updateScreening, deleteScreening
};
