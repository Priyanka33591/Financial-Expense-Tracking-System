import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const MonthlyBalance = ({ year: initialYear }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [monthlyIncomes, setMonthlyIncomes] = useState(Array(12).fill(0));
  const [monthlyExpenses, setMonthlyExpenses] = useState(Array(12).fill(0));
  const [monthlyBalances, setMonthlyBalances] = useState(Array(12).fill(0));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Generate year options (5 years back and 5 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Update internal year state when prop changes
  useEffect(() => {
    if (initialYear) {
      setYear(initialYear);
    }
  }, [initialYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch income data
        const incomeResponse = await axios.get('/api/income/stats', {
          params: { year }
        });
        
        // Fetch expense data
        const expenseResponse = await axios.get('/api/expenses/stats', {
          params: { year }
        });
        
        // Convert monthly data into array format
        const incomeData = Array(12).fill(0);
        incomeResponse.data.data.monthly.forEach(item => {
          incomeData[item._id - 1] = item.total;
        });
        
        const expenseData = Array(12).fill(0);
        expenseResponse.data.data.monthly.forEach(item => {
          expenseData[item._id - 1] = item.total;
        });
        
        // Calculate monthly balance
        const balanceData = incomeData.map((income, index) => {
          return income - expenseData[index];
        });
        
        setMonthlyIncomes(incomeData);
        setMonthlyExpenses(expenseData);
        setMonthlyBalances(balanceData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load financial data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [year]);

  const chartData = {
    labels: monthsShort,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncomes,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#22c55e',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1
      },
      {
        label: 'Net Balance',
        data: monthlyBalances,
        backgroundColor: monthlyBalances.map(balance => 
          balance >= 0 ? 'rgba(59, 130, 246, 0.6)' : 'rgba(249, 115, 22, 0.6)'
        ),
        borderColor: monthlyBalances.map(balance => 
          balance >= 0 ? '#3b82f6' : '#f97316'
        ),
        borderWidth: 1,
        type: 'bar'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: `Monthly Financial Summary for ${year}`,
        font: {
          size: window.innerWidth < 768 ? 14 : 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    }
  };

  if (loading) {
    return <div>Loading financial data...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Calculate yearly totals
  const totalIncome = monthlyIncomes.reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, amount) => sum + amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="monthly-balance">
      <div className="balance-header">
        <h3>Monthly Financial Balance</h3>
        <select
          className="form-control"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="yearly-summary">
        <div className="summary-item">
          <span className="label">Total Income:</span>
          <span className="value income">₹{totalIncome.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Expenses:</span>
          <span className="value expense">₹{totalExpenses.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Net Balance:</span>
          <span className={`value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
            ₹{Math.abs(totalBalance).toFixed(2)}
            {totalBalance >= 0 ? 
              <FaArrowUp style={{ marginLeft: '5px', color: '#22c55e' }} /> : 
              <FaArrowDown style={{ marginLeft: '5px', color: '#ef4444' }} />
            }
          </span>
        </div>
      </div>

      <div className="chart-container" style={{ height: '300px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="monthly-table">
        <h4>Monthly Breakdown</h4>
        <div className="table-responsive">
          <table className="balance-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthNames.map((month, index) => {
                const income = monthlyIncomes[index];
                const expense = monthlyExpenses[index];
                const balance = monthlyBalances[index];
                
                return (
                  <tr key={index}>
                    <td>{month}</td>
                    <td className="income">₹{income.toFixed(2)}</td>
                    <td className="expense">₹{expense.toFixed(2)}</td>
                    <td className={balance >= 0 ? 'positive' : 'negative'}>
                      ₹{Math.abs(balance).toFixed(2)}
                      {balance !== 0 && (
                        balance >= 0 ? 
                          <FaArrowUp style={{ marginLeft: '5px' }} /> : 
                          <FaArrowDown style={{ marginLeft: '5px' }} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBalance; 