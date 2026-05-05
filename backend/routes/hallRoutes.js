const express = require('express');
const router = express.Router();
const { getHalls, getHallsByCompany, getHallById, createHall, updateHall, deleteHall } = require('../controller/hallController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getHalls);
router.get('/company/:companyId', getHallsByCompany);
router.get('/:id', getHallById);
router.post('/', protect, adminOnly, createHall);
router.put('/:id', protect, adminOnly, updateHall);
router.delete('/:id', protect, adminOnly, deleteHall);

module.exports = router;
