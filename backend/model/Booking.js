const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
  seats: { type: [String], required: true },       // ["A1","A2"]
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
  bookingRef: { type: String, unique: true },
  paymentRef: { type: String },
  paymentMethod: { type: String, default: 'card' },
  cardLast4: { type: String },
}, { timestamps: true });

// Auto-generate booking reference before save
bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    this.bookingRef = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
