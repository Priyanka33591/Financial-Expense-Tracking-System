import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaChartLine, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FaTachometerAlt />
    },
    {
      path: '/income',
      name: 'Income',
      icon: <FaMoneyBillWave />
    },
    {
      path: '/expenses',
      name: 'Expenses',
      icon: <FaShoppingCart />
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
        <h1>Budget<span>Track</span></h1>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.user?.name ? user.user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <h3>{user?.user?.name || 'User'}</h3>
            <p>{user?.user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <NavLink 
              to={item.path} 
              key={index}
              className={({ isActive }) => 
                isActive ? 'sidebar-item active' : 'sidebar-item'
              }
              onClick={isOpen && window.innerWidth < 992 ? toggleSidebar : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
              {item.path === location.pathname && <span className="active-indicator"></span>}
            </NavLink>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <button className={`sidebar-toggle ${isOpen ? 'hidden' : ''}`} onClick={toggleSidebar}>
        <FaBars />
      </button>
    </>
  );
};

export default Sidebar; 