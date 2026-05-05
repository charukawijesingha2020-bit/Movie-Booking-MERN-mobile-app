const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } = require('../controller/companyController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', protect, adminOnly, createCompany);
router.put('/:id', protect, adminOnly, updateCompany);
router.delete('/:id', protect, adminOnly, deleteCompany);

module.exports = router;
