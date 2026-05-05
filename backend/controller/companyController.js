const CinemaCompany = require('../model/CinemaCompany');

// @route GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const companies = await CinemaCompany.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/companies/:id
const getCompanyById = async (req, res) => {
  try {
    const company = await CinemaCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/companies  [Admin]
const createCompany = async (req, res) => {
  try {
    const { name, address, phone, description, logo } = req.body;
    if (!name || !address) return res.status(400).json({ message: 'Name and address are required' });
    const company = await CinemaCompany.create({ name, address, phone, description, logo });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/companies/:id  [Admin]
const updateCompany = async (req, res) => {
  try {
    const company = await CinemaCompany.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/companies/:id  [Admin]
const deleteCompany = async (req, res) => {
  try {
    const company = await CinemaCompany.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany };
