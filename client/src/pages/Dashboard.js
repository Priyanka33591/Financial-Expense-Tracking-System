import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaCalendarAlt, 
  FaWallet, 
  FaChartPie,
  FaMoneyBillWave,
  FaShoppingCart,
  FaExchangeAlt
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import MonthlyBalance from '../components/MonthlyBalance';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentMonth] = useState(new Date().getMonth() + 1); // JS months are 0-indexed
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentIncome, setRecentIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  // Generate year options (5 years back and 5 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Get current month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[new Date().getMonth()];

  // Chart colors
  const chartColors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#10b981', '#6366f1',
    '#a855f7', '#14b8a6', '#f43f5e', '#eab308'
  ];

  // Fetch data when selectedYear changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch expenses
        const expensesResponse = await axios.get('/api/expenses/stats', {
          params: { year: selectedYear }
        });

        // Fetch income
        const incomeResponse = await axios.get('/api/income/stats', {
          params: { year: selectedYear }
        });

        // Fetch current month's expenses
        const currentMonthExpensesResponse = await axios.get('/api/expenses', {
          params: { year: selectedYear, month: currentMonth }
        });

        // Fetch current month's income
        const currentMonthIncomeResponse = await axios.get('/api/income', {
          params: { year: selectedYear, month: currentMonth }
        });

        // Set state with the fetched data
        setExpenseData(expensesResponse.data.data.monthly);
        setIncomeData(incomeResponse.data.data.monthly);
        setExpensesByCategory(expensesResponse.data.data.byCategory);
        setIncomeByCategory(incomeResponse.data.data.byCategory);
        setRecentExpenses(currentMonthExpensesResponse.data.data.slice(0, 5));
        setRecentIncome(currentMonthIncomeResponse.data.data.slice(0, 5));

        setLoading(false);
      } catch (error) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, currentMonth]);

  // Calculate totals
  const totalExpenses = expenseData.reduce((acc, month) => acc + month.total, 0);
  const totalIncome = incomeData.reduce((acc, month) => acc + month.total, 0);
  const balance = totalIncome - totalExpenses;
  
  // Calculate current month totals
  const currentMonthExpenses = recentExpenses.reduce((acc, expense) => acc + expense.amount, 0);
  const currentMonthIncome = recentIncome.reduce((acc, income) => acc + income.amount, 0);
  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  // Format data for charts
  const monthShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Map month numbers to totals for charts
  const expenseByMonth = Array(12).fill(0);
  expenseData.forEach(item => {
    expenseByMonth[item._id - 1] = item.total;
  });

  const incomeByMonth = Array(12).fill(0);
  incomeData.forEach(item => {
    incomeByMonth[item._id - 1] = item.total;
  });

  // Expense by category data
  const expenseCategoryData = {
    labels: expensesByCategory.map(cat => cat._id),
    datasets: [
      {
        data: expensesByCategory.map(cat => cat.total),
        backgroundColor: chartColors.slice(0, expensesByCategory.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };
  
  // Donut chart options
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend, we'll create a custom one
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  // Render custom legend
  const renderCustomLegend = () => {
    if (!expensesByCategory || expensesByCategory.length === 0) return null;
    
    // Sort categories by amount (descending)
    const sortedCategories = [...expensesByCategory].sort((a, b) => b.total - a.total);
    
    return (
      <div className="custom-legend">
        {sortedCategories.map((category, index) => {
          const percentage = Math.round((category.total / totalExpenses) * 100);
          return (
            <div className="legend-item" key={index}>
              <div 
                className="legend-color" 
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              ></div>
              <span className="legend-text">{category._id}</span>
              <span className="legend-value">{percentage}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="container alert alert-danger">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1><FaWallet style={{ marginRight: '10px' }} /> Financial Dashboard</h1>
          <p>Welcome back, {user?.user?.name || 'User'}!</p>
        </div>
        <div className="year-selector">
          <div className="form-group">
            <label htmlFor="year">
              <FaCalendarAlt /> Year
            </label>
            <select
              className="form-control"
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="stats-container">
        <div className="stat-card">
          <div className="stat-title"><FaMoneyBillWave style={{ marginRight: '5px' }} /> Total Income ({selectedYear})</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            ₹{totalIncome.toFixed(2)}
          </div>
          <div className="stat-info">
            <span>₹{currentMonthIncome.toFixed(2)} in {currentMonthName}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title"><FaShoppingCart style={{ marginRight: '5px' }} /> Total Expenses ({selectedYear})</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            ₹{totalExpenses.toFixed(2)}
          </div>
          <div className="stat-info">
            <span>₹{currentMonthExpenses.toFixed(2)} in {currentMonthName}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title"><FaExchangeAlt style={{ marginRight: '5px' }} /> Net Balance ({selectedYear})</div>
          <div
            className="stat-value"
            style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}
          >
            ₹{Math.abs(balance).toFixed(2)}
          </div>
          <div className={`stat-trend ${balance >= 0 ? 'trend-up' : 'trend-down'}`}>
            {balance >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            <span style={{ marginLeft: '5px' }}>
              {balance >= 0 ? 'Positive balance' : 'Negative balance'}
            </span>
          </div>
        </div>
      </section>

      {/* Monthly Balance Component - pass the selected year */}
      <MonthlyBalance year={selectedYear} />

      <section className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title"><FaChartPie style={{ marginRight: '8px' }} /> Expense by Category ({selectedYear})</h3>
        </div>
        {expensesByCategory.length > 0 ? (
          <>
            <div className="expense-category-chart">
              <Doughnut 
                data={expenseCategoryData} 
                options={{
                  ...donutOptions,
                  responsive: true,
                  maintainAspectRatio: false
                }} 
                ref={chartRef}
              />
              <div className="chart-total">
                <div className="total-amount">₹{totalExpenses.toFixed(2)}</div>
                <div className="total-label">Total Expenses</div>
              </div>
            </div>
            {renderCustomLegend()}
          </>
        ) : (
          <div className="no-data-message">
            <p>No expense data available for {selectedYear}</p>
            <p>Add expenses to see your spending breakdown by category</p>
          </div>
        )}
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="flex justify-between align-center mb-4">
            <h3 style={{ margin: 0 }}>Recent Expenses</h3>
            <Link to="/expenses" className="btn btn-outline">
              View All
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="table-responsive">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>
                        <div className="transaction-title">{expense.title}</div>
                        <div className="transaction-category">{expense.category}</div>
                      </td>
                      <td className="transaction-amount amount-expense">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-message">
              <p>No recent expenses to display</p>
              <Link to="/expenses" className="btn btn-primary btn-sm">
                Add Expense
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex justify-between align-center mb-4">
            <h3 style={{ margin: 0 }}>Recent Income</h3>
            <Link to="/income" className="btn btn-outline">
              View All
            </Link>
          </div>
          {recentIncome.length > 0 ? (
            <div className="table-responsive">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncome.map((income) => (
                    <tr key={income._id}>
                      <td>{new Date(income.date).toLocaleDateString()}</td>
                      <td>
                        <div className="transaction-title">{income.title}</div>
                        <div className="transaction-category">{income.category}</div>
                      </td>
                      <td className="transaction-amount amount-income">
                        ₹{income.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-message">
              <p>No recent income to display</p>
              <Link to="/income" className="btn btn-primary btn-sm">
                Add Income
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 