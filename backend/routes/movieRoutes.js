const express = require('express');
const router = express.Router();
const { getMovies, getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require('../controller/movieController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getMovies);
router.get('/all', protect, adminOnly, getAllMovies);
router.get('/:id', getMovieById);
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
