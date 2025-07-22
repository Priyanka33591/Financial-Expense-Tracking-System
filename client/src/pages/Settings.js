import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaPalette, FaGlobe, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'USD',
    notifications: {
      email: true,
      browser: true,
      monthlyReport: true,
      lowBalanceAlert: false
    },
    dateFormat: 'MM/DD/YYYY',
    language: 'en'
  });
  
  const [loading, setLoading] = useState(false);
  
  const currencies = [
    { code: 'USD', symbol: '₹', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: '₹', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: '₹', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'hi', name: 'Hindi' }
  ];
  
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (key) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      notifications: {
        ...prevSettings.notifications,
        [key]: !prevSettings.notifications[key]
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save to localStorage for demo purposes
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      setLoading(false);
      toast.success('Settings saved successfully');
    }, 800);
  };
  
  return (
    <div className="settings-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your application preferences</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h3><FaPalette /> Appearance</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <div className="theme-selector">
                <div 
                  className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => setSettings({...settings, theme: 'light'})}
                >
                  <div className="theme-preview light-theme"></div>
                  <span>Light</span>
                </div>
                <div 
                  className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setSettings({...settings, theme: 'dark'})}
                >
                  <div className="theme-preview dark-theme"></div>
                  <span>Dark</span>
                </div>
                <div 
                  className={`theme-option ${settings.theme === 'system' ? 'active' : ''}`}
                  onClick={() => setSettings({...settings, theme: 'system'})}
                >
                  <div className="theme-preview system-theme"></div>
                  <span>System</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-header">
            <h3><FaGlobe /> Regional Settings</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select 
                id="currency" 
                name="currency" 
                className="form-control"
                value={settings.currency}
                onChange={handleChange}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dateFormat">Date Format</label>
              <select 
                id="dateFormat" 
                name="dateFormat" 
                className="form-control"
                value={settings.dateFormat}
                onChange={handleChange}
              >
                {dateFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select 
                id="language" 
                name="language" 
                className="form-control"
                value={settings.language}
                onChange={handleChange}
              >
                {languages.map(language => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-header">
            <h3><FaBell /> Notifications</h3>
          </div>
          <div className="card-body">
            <div className="toggle-group">
              <div className="toggle-item">
                <div className="toggle-label">
                  <span>Email Notifications</span>
                </div>
                <button 
                  type="button"
                  className={`toggle-button ${settings.notifications.email ? 'active' : ''}`}
                  onClick={() => handleNotificationChange('email')}
                >
                  {settings.notifications.email ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-label">
                  <span>Browser Notifications</span>
                </div>
                <button 
                  type="button"
                  className={`toggle-button ${settings.notifications.browser ? 'active' : ''}`}
                  onClick={() => handleNotificationChange('browser')}
                >
                  {settings.notifications.browser ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-label">
                  <span>Monthly Report</span>
                </div>
                <button 
                  type="button"
                  className={`toggle-button ${settings.notifications.monthlyReport ? 'active' : ''}`}
                  onClick={() => handleNotificationChange('monthlyReport')}
                >
                  {settings.notifications.monthlyReport ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-label">
                  <span>Low Balance Alerts</span>
                </div>
                <button 
                  type="button"
                  className={`toggle-button ${settings.notifications.lowBalanceAlert ? 'active' : ''}`}
                  onClick={() => handleNotificationChange('lowBalanceAlert')}
                >
                  {settings.notifications.lowBalanceAlert ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 