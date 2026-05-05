const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  date: { type: String, required: true },       // "YYYY-MM-DD"
  showtime: { type: String, required: true },   // "14:30"
  ticketPrice: { type: Number, required: true },
  bookedSeats: { type: [String], default: [] }, // ["A1","A2","B3",...]
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Screening', screeningSchema);
