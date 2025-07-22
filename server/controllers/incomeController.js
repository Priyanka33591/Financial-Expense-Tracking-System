const Income = require('../models/Income');

// @desc    Get all income for a user
// @route   GET /api/income
// @access  Private
exports.getIncomes = async (req, res) => {
  try {
    let query = { user: req.user.id };
    
    // Filter by month and year if provided
    if (req.query.month && req.query.year) {
      const month = parseInt(req.query.month) - 1; // JS months are 0-indexed
      const year = parseInt(req.query.year);
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const incomes = await Income.find(query).sort({ date: -1 });
    
    // Calculate total income
    const total = incomes.reduce((acc, income) => acc + income.amount, 0);
    
    res.status(200).json({
      success: true,
      count: incomes.length,
      total,
      data: incomes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get a single income entry
// @route   GET /api/income/:id
// @access  Private
exports.getIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }
    
    // Make sure user owns the income entry
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this income entry'
      });
    }
    
    res.status(200).json({
      success: true,
      data: income
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Create a new income entry
// @route   POST /api/income
// @access  Private
exports.createIncome = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    const income = await Income.create(req.body);
    
    res.status(201).json({
      success: true,
      data: income
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update an income entry
// @route   PUT /api/income/:id
// @access  Private
exports.updateIncome = async (req, res) => {
  try {
    let income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }
    
    // Make sure user owns the income entry
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this income entry'
      });
    }
    
    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: income
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete an income entry
// @route   DELETE /api/income/:id
// @access  Private
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }
    
    // Make sure user owns the income entry
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this income entry'
      });
    }
    
    // Use findByIdAndDelete instead of deleteOne or remove
    await Income.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get income statistics
// @route   GET /api/income/stats
// @access  Private
exports.getIncomeStats = async (req, res) => {
  try {
    // Filter by year if provided, otherwise use current year
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    // Aggregate income by month
    const monthlyIncome = await Income.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Aggregate income by category
    const categoryIncome = await Income.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        monthly: monthlyIncome,
        byCategory: categoryIncome
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
}; 