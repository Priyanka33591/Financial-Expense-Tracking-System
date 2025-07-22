import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  FaChartBar, 
  FaChartPie, 
  FaChartLine, 
  FaDownload, 
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    income: [],
    expenses: [],
    categories: []
  });
  
  // Generate year options (5 years back and 5 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Month options
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
  
  // Chart colors
  const chartColors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#10b981', '#6366f1',
    '#a855f7', '#14b8a6', '#f43f5e', '#eab308'
  ];
  
  useEffect(() => {
    fetchReportData();
  }, [reportType, year, month]);
  
  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      let incomeResponse, expenseResponse;
      
      if (reportType === 'monthly') {
        // Fetch monthly data for the selected year
        incomeResponse = await axios.get('/api/income/stats', {
          params: { year }
        });
        
        expenseResponse = await axios.get('/api/expenses/stats', {
          params: { year }
        });
      } else if (reportType === 'yearly') {
        // For yearly report, we'd need different endpoints
        // Using the same endpoints for demo purposes
        incomeResponse = await axios.get('/api/income/stats', {
          params: { year }
        });
        
        expenseResponse = await axios.get('/api/expenses/stats', {
          params: { year }
        });
      } else {
        // For custom report, we'd need different endpoints
        // Using the same endpoints for demo purposes
        incomeResponse = await axios.get('/api/income', {
          params: { year, month }
        });
        
        expenseResponse = await axios.get('/api/expenses', {
          params: { year, month }
        });
      }
      
      setReportData({
        income: incomeResponse.data.data.monthly || [],
        expenses: expenseResponse.data.data.monthly || [],
        categories: expenseResponse.data.data.byCategory || []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
    }
  };
  
  // Prepare data for monthly comparison chart
  const monthlyComparisonData = {
    labels: months.map(month => month.label.substring(0, 3)),
    datasets: [
      {
        label: 'Income',
        data: Array(12).fill(0).map((_, index) => {
          const monthData = reportData.income.find(item => item._id === index + 1);
          return monthData ? monthData.total : 0;
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#22c55e',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: Array(12).fill(0).map((_, index) => {
          const monthData = reportData.expenses.find(item => item._id === index + 1);
          return monthData ? monthData.total : 0;
        }),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for expense categories chart
  const categoriesData = {
    labels: reportData.categories.map(cat => cat._id),
    datasets: [
      {
        data: reportData.categories.map(cat => cat.total),
        backgroundColor: chartColors.slice(0, reportData.categories.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };
  
  // Calculate savings trend data
  const savingsTrendData = {
    labels: months.map(month => month.label.substring(0, 3)),
    datasets: [
      {
        label: 'Savings',
        data: Array(12).fill(0).map((_, index) => {
          const incomeData = reportData.income.find(item => item._id === index + 1);
          const expenseData = reportData.expenses.find(item => item._id === index + 1);
          const income = incomeData ? incomeData.total : 0;
          const expense = expenseData ? expenseData.total : 0;
          return income - expense;
        }),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`
        }
      }
    }
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Expense Categories'
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
    }
  };
  
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Savings Trend'
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `₹${value}`
        }
      }
    }
  };
  
  const handleExportReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      
      let title = '';
      if (reportType === 'monthly') {
        title = `Monthly Financial Report - ${year}`;
      } else if (reportType === 'yearly') {
        title = `Yearly Financial Report - ${year}`;
      } else {
        title = `Financial Report - ${months.find(m => m.value === month)?.label} ${year}`;
      }
      
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add financial summary
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Financial Summary', 14, 45);
      
      const totalIncome = reportData.income.reduce((sum, item) => sum + item.total, 0);
      const totalExpenses = reportData.expenses.reduce((sum, item) => sum + item.total, 0);
      const netSavings = totalIncome - totalExpenses;
      
      const summaryData = [
        ['Total Income', `₹${totalIncome.toFixed(2)}`],
        ['Total Expenses', `₹${totalExpenses.toFixed(2)}`],
        ['Net Savings', `₹${Math.abs(netSavings).toFixed(2)}`]
      ];
      
      doc.autoTable({
        startY: 50,
        head: [['Category', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 }
      });
      
      // Add monthly breakdown
      doc.setFontSize(14);
      doc.text('Monthly Breakdown', 14, doc.lastAutoTable.finalY + 15);
      
      const monthlyData = [];
      
      for (let i = 0; i < 12; i++) {
        const incomeData = reportData.income.find(item => item._id === i + 1);
        const expenseData = reportData.expenses.find(item => item._id === i + 1);
        
        const income = incomeData ? incomeData.total : 0;
        const expense = expenseData ? expenseData.total : 0;
        const balance = income - expense;
        
        monthlyData.push([
          months[i].label,
          `₹${income.toFixed(2)}`,
          `₹${expense.toFixed(2)}`,
          `₹${Math.abs(balance).toFixed(2)}`,
          balance >= 0 ? 'Positive' : 'Negative'
        ]);
      }
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Month', 'Income', 'Expenses', 'Balance', 'Status']],
        body: monthlyData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 }
      });
      
      // Add expense categories
      if (reportData.categories.length > 0) {
        doc.setFontSize(14);
        doc.text('Expense Categories', 14, doc.lastAutoTable.finalY + 15);
        
        const categoriesTableData = reportData.categories.map(cat => [
          cat._id,
          `₹${cat.total.toFixed(2)}`,
          `${((cat.total / totalExpenses) * 100).toFixed(1)}%`
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Category', 'Amount', '% of Total']],
          body: categoriesTableData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          styles: { fontSize: 10 }
        });
      }
      
      // Save the PDF
      doc.save(`financial_report_${year}_${reportType}.pdf`);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report. Please try again.');
    }
  };
  
  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Financial Reports</h1>
        <p>Analyze your financial data with detailed reports</p>
      </div>
      
      <div className="reports-filters">
        <div className="filter-group">
          <label><FaFilter /> Report Type</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="form-control"
          >
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
            <option value="custom">Custom Report</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label><FaCalendarAlt /> Year</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="form-control"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        
        {reportType === 'custom' && (
          <div className="filter-group">
            <label><FaCalendarAlt /> Month</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              className="form-control"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="filter-group export-button-container">
          <button className="btn btn-primary export-report-btn" onClick={handleExportReport}>
            <FaDownload /> <span className="export-btn-text">Export Report</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading report data...</p>
        </div>
      ) : (
        <div className="reports-content">
          <div className="report-card">
            <div className="report-header">
              <h3><FaChartBar /> Income vs Expenses</h3>
            </div>
            <div className="report-body">
              <Bar data={monthlyComparisonData} options={{
                ...barOptions,
                responsive: true,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
          
          <div className="report-card">
            <div className="report-header">
              <h3><FaChartPie /> Expense Breakdown</h3>
            </div>
            <div className="report-body">
              <div style={{ height: '300px' }}>
                <Doughnut data={categoriesData} options={{
                  ...pieOptions,
                  responsive: true,
                  maintainAspectRatio: false
                }} />
              </div>
            </div>
          </div>
          
          <div className="report-card">
            <div className="report-header">
              <h3><FaChartLine /> Savings Trend</h3>
            </div>
            <div className="report-body">
              <Line data={savingsTrendData} options={{
                ...lineOptions,
                responsive: true,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
          
          <div className="report-card">
            <div className="report-header">
              <h3>Financial Summary</h3>
            </div>
            <div className="report-body">
              <div className="summary-stats">
                <div className="summary-stat">
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value income">
                    ₹{reportData.income.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="summary-stat">
                  <div className="stat-label">Total Expenses</div>
                  <div className="stat-value expense">
                    ₹{reportData.expenses.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="summary-stat">
                  <div className="stat-label">Net Savings</div>
                  <div className={`stat-value ${
                    reportData.income.reduce((sum, item) => sum + item.total, 0) - 
                    reportData.expenses.reduce((sum, item) => sum + item.total, 0) >= 0 ? 
                    'positive' : 'negative'
                  }`}>
                    ₹{Math.abs(
                      reportData.income.reduce((sum, item) => sum + item.total, 0) - 
                      reportData.expenses.reduce((sum, item) => sum + item.total, 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 