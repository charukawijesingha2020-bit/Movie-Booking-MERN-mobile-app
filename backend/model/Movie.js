const mongoose = require('mongoose');


const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  genre: { type: [String], required: true },    // e.g. ['Action', 'Thriller']
  duration: { type: Number, required: true },   // minutes
  rating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], default: 'PG' },
  language: { type: String, default: 'English' },
  description: { type: String },
  poster: { type: String, default: '' },        // image URL
  trailer: { type: String, default: '' },       // YouTube URL
  releaseDate: { type: Date },
  cast: { type: [String] },
  director: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
