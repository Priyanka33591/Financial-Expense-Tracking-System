import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <p>Financial Expense Tracker &copy; {currentYear}</p>
    </footer>
  );
};

export default Footer; 