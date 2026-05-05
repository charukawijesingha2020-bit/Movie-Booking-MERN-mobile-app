const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CinemaCompany', required: true },
  rows: { type: Number, required: true, min: 1 },         // e.g. 8
  seatsPerRow: { type: Number, required: true, min: 1 },  // e.g. 10
  description: { type: String },
}, { timestamps: true });

// Virtual: total seats
hallSchema.virtual('totalSeats').get(function () {
  return this.rows * this.seatsPerRow;
});

module.exports = mongoose.model('Hall', hallSchema);
