const express = require('express');
const router = express.Router();
const {
  getScreenings, getAllScreenings, getScreeningsByHall, getScreeningsByMovie,
  getScreeningById, createScreening, updateScreening, deleteScreening
} = require('../controller/screeningController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getScreenings);
router.get('/all', protect, adminOnly, getAllScreenings);
router.get('/hall/:hallId', getScreeningsByHall);
router.get('/movie/:movieId', getScreeningsByMovie);
router.get('/:id', getScreeningById);
router.post('/', protect, adminOnly, createScreening);
router.put('/:id', protect, adminOnly, updateScreening);
router.delete('/:id', protect, adminOnly, deleteScreening);

module.exports = router;
