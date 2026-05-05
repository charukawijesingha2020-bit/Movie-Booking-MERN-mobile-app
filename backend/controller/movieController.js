const Movie = require('../model/Movie');

// @route GET /api/movies
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/movies/all  [Admin — includes inactive]
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/movies/:id
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/movies  [Admin]
const createMovie = async (req, res) => {
  try {
    const { title, genre, duration, rating, language, description, poster, trailer, releaseDate, cast, director } = req.body;
    if (!title || !genre || !duration)
      return res.status(400).json({ message: 'Title, genre, and duration are required' });
    const movie = await Movie.create({ title, genre, duration, rating, language, description, poster, trailer, releaseDate, cast, director });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/movies/:id  [Admin]
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/movies/:id  [Admin]
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMovies, getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
