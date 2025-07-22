import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ component: Component }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  return user ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute; 