import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FinTrack
        </Link>

        <button className="navbar-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/expenses"
                className={`navbar-link ${location.pathname === '/expenses' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Expenses
              </Link>
              <Link
                to="/income"
                className={`navbar-link ${location.pathname === '/income' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Income
              </Link>
              <Link
                to="#"
                className="navbar-link"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`navbar-link ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 