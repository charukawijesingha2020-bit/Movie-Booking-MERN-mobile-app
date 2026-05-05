const Review = require('../model/Review');

// @route GET /api/reviews/movie/:movieId
const getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/reviews  [User]
const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    if (!movieId || !rating || !comment)
      return res.status(400).json({ message: 'Movie, rating, and comment are required' });

    const existing = await Review.findOne({ user: req.user._id, movie: movieId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this movie' });

    const review = await Review.create({ user: req.user._id, movie: movieId, rating, comment });
    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/reviews/:id  [User — edit own review]
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();
    const populated = await Review.findById(review._id).populate('user', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/reviews/:id  [User or Admin]
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });
    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/reviews/:id/reply  [Admin]
const replyToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.adminReply = req.body.adminReply || '';
    await review.save();
    const populated = await Review.findById(review._id).populate('user', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/reviews  [Admin — all reviews]
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMovieReviews, createReview, updateReview, deleteReview, replyToReview, getAllReviews };
