const express = require('express');
const router = express.Router();
const { getMovieReviews, createReview, updateReview, deleteReview, replyToReview, getAllReviews } = require('../controller/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllReviews);
router.get('/movie/:movieId', getMovieReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/reply', protect, adminOnly, replyToReview);

module.exports = router;
