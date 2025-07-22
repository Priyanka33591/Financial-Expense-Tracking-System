import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user && user.user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.user.name || '',
        email: user.user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (!formData.currentPassword) {
        toast.error('Current password is required to change password');
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Create request payload
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      
      // Add password fields if user is changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Make API call to update profile
      const response = await axios.put('/api/auth/profile', updateData);
      
      // Update context with new user data
      setUser({
        ...user,
        user: response.data.data
      });
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Profile updated successfully');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and password</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Account Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">
                <FaUser /> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Change Password</h3>
            <p className="form-hint">Leave blank if you don't want to change your password</p>
            
            <div className="form-group">
              <label htmlFor="currentPassword">
                <FaLock /> Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="form-control"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">
                <FaLock /> New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-control"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock /> Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 