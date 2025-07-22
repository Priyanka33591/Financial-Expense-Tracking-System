import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const MonthlyReport = ({ type, month, year }) => {
  const [data, setData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [previousMonthTotal, setPreviousMonthTotal] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [isIncreased, setIsIncreased] = useState(true);

  useEffect(() => {
    const fetchCurrentMonthData = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'income' ? '/api/income' : '/api/expenses';
        
        // Fetch current month data
        const response = await axios.get(endpoint, {
          params: { month, year }
        });
        
        setData(response.data.data);
        setTotal(response.data.total);
        
        // Prepare category data
        const categoriesMap = {};
        
        response.data.data.forEach(item => {
          if (categoriesMap[item.category]) {
            categoriesMap[item.category] += item.amount;
          } else {
            categoriesMap[item.category] = item.amount;
          }
        });
        
        const categoryEntries = Object.entries(categoriesMap).map(([category, amount]) => ({
          category,
          amount
        }));
        
        setCategoryData(categoryEntries);
        
        // Calculate previous month's data
        let previousMonth = month - 1;
        let previousYear = year;
        
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear--;
        }
        
        const previousResponse = await axios.get(endpoint, {
          params: { month: previousMonth, year: previousYear }
        });
        
        setPreviousMonthTotal(previousResponse.data.total);
        
        // Calculate percentage change
        if (previousResponse.data.total > 0) {
          const change = ((response.data.total - previousResponse.data.total) / previousResponse.data.total) * 100;
          setPercentageChange(Math.abs(change).toFixed(1));
          setIsIncreased(response.data.total >= previousResponse.data.total);
        } else if (response.data.total > 0) {
          setPercentageChange(100);
          setIsIncreased(true);
        } else {
          setPercentageChange(0);
          setIsIncreased(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to load ${type} data`);
        setLoading(false);
      }
    };
    
    fetchCurrentMonthData();
  }, [type, month, year]);

  const chartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => item.amount),
        backgroundColor: [
          '#22c55e', '#ef4444', '#3b82f6', '#f97316', 
          '#8b5cf6', '#ec4899', '#10b981', '#6366f1', 
          '#facc15', '#a3e635'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: `${type === 'income' ? 'Income' : 'Expenses'} by Category`
      }
    }
  };

  if (loading) {
    return <div>Loading {type} report...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Determine if this is a good trend based on the type (income increasing is good, expenses decreasing is good)
  const isGoodTrend = type === 'income' ? isIncreased : !isIncreased;

  return (
    <div className="monthly-report">
      <h3 className="report-title">
        {monthNames[month - 1]} {year} Summary
      </h3>
      
      <div className="report-summary">
        <div className="summary-card">
          <div className="summary-title">Total {type === 'income' ? 'Income' : 'Expenses'}</div>
          <div className="summary-amount">
            ₹{total.toFixed(2)}
          </div>
          <div className={`summary-change ${isGoodTrend ? 'positive' : 'negative'}`}>
            {isIncreased ? <FaArrowUp /> : <FaArrowDown />}
            <span>{percentageChange}% from previous month</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-title">Transactions</div>
          <div className="summary-amount">{data.length}</div>
          <div className="summary-subtitle">
            {type === 'income' ? 'Income' : 'Expense'} entries this month
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-title">Average per Transaction</div>
          <div className="summary-amount">
            ₹{data.length > 0 ? (total / data.length).toFixed(2) : '0.00'}
          </div>
          <div className="summary-subtitle">
            Average {type === 'income' ? 'income' : 'expense'} amount
          </div>
        </div>
      </div>
      
      <div className="report-details">
        <div className="category-chart">
          <h4>Category Breakdown</h4>
          {categoryData.length > 0 ? (
            <div style={{ height: '250px' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p>No data available for this month</p>
          )}
        </div>
        
        <div className="category-list">
          <h4>Categories</h4>
          {categoryData.length > 0 ? (
            <div>
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData
                    .sort((a, b) => b.amount - a.amount)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.category}</td>
                        <td>₹{item.amount.toFixed(2)}</td>
                        <td>{((item.amount / total) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No categories found for this month</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport; 