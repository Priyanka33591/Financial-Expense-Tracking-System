import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaChartBar } from 'react-icons/fa';
import MonthlyReport from '../components/MonthlyReport';

const EXPENSE_CATEGORIES = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 
  'Utilities', 'Housing', 'Healthcare', 'Education', 
  'Personal', 'Other'
];

const ExpenseModal = ({ isOpen, onClose, expense, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Other',
    date: new Date().toISOString().slice(0, 10),
    description: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: expense.description || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Other',
        date: new Date().toISOString().slice(0, 10),
        description: ''
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{expense ? 'Edit Expense' : 'Add Expense'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              className="form-control"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              className="form-control"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {expense ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1); // Current month
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [filterCategory, setFilterCategory] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  // Fetch expenses based on filters
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        month: filterMonth,
        year: filterYear
      };
      
      if (filterCategory) {
        params.category = filterCategory;
      }
      
      const response = await axios.get('/api/expenses', { params });
      setExpenses(response.data.data);
      setTotalAmount(response.data.total);
      setLoading(false);
    } catch (error) {
      setError('Failed to load expenses');
      setLoading(false);
    }
  };

  // Fetch expenses on component mount and when filters change
  useEffect(() => {
    fetchExpenses();
  }, [filterMonth, filterYear, filterCategory]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      if (currentExpense) {
        // Update expense
        await axios.put(`/api/expenses/${currentExpense._id}`, formData);
        toast.success('Expense updated successfully');
      } else {
        // Create expense
        await axios.post('/api/expenses', formData);
        toast.success('Expense added successfully');
      }
      
      // Close modal and refresh expenses
      setModalOpen(false);
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process expense');
    }
  };

  // Handle expense deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  // Open modal for editing
  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setModalOpen(true);
  };

  // Open modal for adding
  const handleAdd = () => {
    setCurrentExpense(null);
    setModalOpen(true);
  };

  // Toggle monthly report
  const toggleMonthlyReport = () => {
    setShowMonthlyReport(!showMonthlyReport);
  };

  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate year options (5 years back and 5 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  if (loading && expenses.length === 0) {
    return <div>Loading expenses...</div>;
  }

  return (
    <div>
      <div className="transactions-header">
        <h1>Expenses</h1>
        <div>
          <button 
            className="btn btn-secondary mr-2" 
            onClick={toggleMonthlyReport}
            title="Toggle Monthly Report"
          >
            <FaChartBar /> {showMonthlyReport ? 'Hide Report' : 'Show Report'}
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      {showMonthlyReport && (
        <MonthlyReport 
          type="expense" 
          month={filterMonth} 
          year={filterYear} 
        />
      )}

      <div className="filter-container">
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="month">Month</label>
          <select
            className="form-control"
            id="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="year">Year</label>
          <select
            className="form-control"
            id="year"
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="category">Category</label>
          <select
            className="form-control"
            id="category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="flex justify-between align-center mb-4">
          <h3 style={{ margin: 0 }}>Total: ₹{totalAmount.toFixed(2)}</h3>
          <p>{expenses.length} expense(s) found</p>
        </div>

        {expenses.length === 0 ? (
          <p>No expenses found for the selected period.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td className="transaction-amount amount-expense">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="transaction-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(expense)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(expense._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        expense={currentExpense}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Expenses; 