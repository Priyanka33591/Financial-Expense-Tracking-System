import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary mt-4">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound; 