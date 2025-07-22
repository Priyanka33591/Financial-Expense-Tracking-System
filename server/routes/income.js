const express = require('express');
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
} = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats', getIncomeStats);

// Standard routes
router
  .route('/')
  .get(getIncomes)
  .post(createIncome);

router
  .route('/:id')
  .get(getIncome)
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router; 