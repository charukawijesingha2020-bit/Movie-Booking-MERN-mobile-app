const mongoose = require('mongoose');

const cinemaCompanySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  phone: { type: String },
  description: { type: String },
  logo: { type: String, default: '' }, // URL to logo image
}, { timestamps: true });

module.exports = mongoose.model('CinemaCompany', cinemaCompanySchema);
