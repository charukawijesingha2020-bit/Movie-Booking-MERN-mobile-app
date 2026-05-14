const Hall = require('../model/Hall');

// @route GET /api/halls
const getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().populate('company', 'name address');
    res.json(halls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/halls/company/:companyId
const getHallsByCompany = async (req, res) => {
  try {
    const halls = await Hall.find({ company: req.params.companyId }).populate('company', 'name');
    res.json(halls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/halls/:id
const getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id).populate('company', 'name address phone');
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json(hall);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/halls  [Admin]
const createHall = async (req, res) => {
  try {
    const { name, company, rows, seatsPerRow, description, image } = req.body;
    if (!name || !company || !rows || !seatsPerRow)
      return res.status(400).json({ message: 'Name, company, rows, and seatsPerRow are required' });
    const hall = await Hall.create({ name, company, rows, seatsPerRow, description, image });
    const populated = await Hall.findById(hall._id).populate('company', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/halls/:id  [Admin]
const updateHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('company', 'name');
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json(hall);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/halls/:id  [Admin]
const deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json({ message: 'Hall removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHalls, getHallsByCompany, getHallById, createHall, updateHall, deleteHall };
