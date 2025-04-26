import React, { useState } from 'react';
import axios from 'axios';
import '../css/PIIAnalyzer.css';

const PIIAnalyzer = () => {
  const [formData, setFormData] = useState({
    password: '',
    Gender: '',
    Title: '',
    GivenName: '',
    MiddleInitial: '',
    Surname: '',
    StreetAddress: '',
    City: '',
    CountryFull: '',
    TelephoneNumber: '',
    MothersMaiden: '',
    Birthday: '',
    TropicalZodiac: '',
    Vehicle: '',
    VehicleColor: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/analyze-pii', {
        password: formData.password,
        pii_data: {
          Gender: formData.Gender,
          Title: formData.Title,
          GivenName: formData.GivenName,
          MiddleInitial: formData.MiddleInitial,
          Surname: formData.Surname,
          StreetAddress: formData.StreetAddress,
          City: formData.City,
          CountryFull: formData.CountryFull,
          TelephoneNumber: formData.TelephoneNumber,
          MothersMaiden: formData.MothersMaiden,
          Birthday: formData.Birthday,
          TropicalZodiac: formData.TropicalZodiac,
          Vehicle: formData.Vehicle,
          VehicleColor: formData.VehicleColor
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error analyzing password:', error);
      setResult({ error: 'Failed to analyze password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pii-analyzer-container">
      <h1 className="pii-analyzer-title">Password PII (Personally Identifiable Information) Analysis</h1>
      
      <form onSubmit={handleSubmit} className="pii-analyzer-form">
        <div className="pii-analyzer-form-group">
          <label className="pii-analyzer-label">Password:</label>
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="pii-analyzer-input"
            required
          />
        </div>

        <h2 className="pii-analyzer-section-title">Personal Information</h2>
        
        <div className="pii-analyzer-form-row">
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Gender:</label>
            <input
              type="text"
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
          
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Title:</label>
            <input
              type="text"
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
        </div>

        <div className="pii-analyzer-form-row">
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Given Name:</label>
            <input
              type="text"
              name="GivenName"
              value={formData.GivenName}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
          
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Middle Initial:</label>
            <input
              type="text"
              name="MiddleInitial"
              value={formData.MiddleInitial}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
        </div>

        <div className="pii-analyzer-form-group">
          <label className="pii-analyzer-label">Surname:</label>
          <input
            type="text"
            name="Surname"
            value={formData.Surname}
            onChange={handleChange}
            className="pii-analyzer-input"
          />
        </div>

        <div className="pii-analyzer-form-group">
          <label className="pii-analyzer-label">Street Address:</label>
          <input
            type="text"
            name="StreetAddress"
            value={formData.StreetAddress}
            onChange={handleChange}
            className="pii-analyzer-input"
          />
        </div>

        <div className="pii-analyzer-form-row">
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">City:</label>
            <input
              type="text"
              name="City"
              value={formData.City}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
          
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Country:</label>
            <input
              type="text"
              name="CountryFull"
              value={formData.CountryFull}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
        </div>

        <div className="pii-analyzer-form-group">
          <label className="pii-analyzer-label">Telephone Number:</label>
          <input
            type="text"
            name="TelephoneNumber"
            value={formData.TelephoneNumber}
            onChange={handleChange}
            className="pii-analyzer-input"
          />
        </div>

        <div className="pii-analyzer-form-group">
          <label className="pii-analyzer-label">Mother's Maiden Name:</label>
          <input
            type="text"
            name="MothersMaiden"
            value={formData.MothersMaiden}
            onChange={handleChange}
            className="pii-analyzer-input"
          />
        </div>

        <div className="pii-analyzer-form-row">
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Birthday (MM/DD/YYYY):</label>
            <input
              type="text"
              name="Birthday"
              value={formData.Birthday}
              onChange={handleChange}
              className="pii-analyzer-input"
              placeholder="05/15/1984"
            />
          </div>
          
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Tropical Zodiac:</label>
            <input
              type="text"
              name="TropicalZodiac"
              value={formData.TropicalZodiac}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
        </div>

        <div className="pii-analyzer-form-row">
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Vehicle:</label>
            <input
              type="text"
              name="Vehicle"
              value={formData.Vehicle}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
          
          <div className="pii-analyzer-form-group">
            <label className="pii-analyzer-label">Vehicle Color:</label>
            <input
              type="text"
              name="VehicleColor"
              value={formData.VehicleColor}
              onChange={handleChange}
              className="pii-analyzer-input"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="pii-analyzer-button"
        >
          {loading ? 'Analyzing...' : 'Analyze Password'}
        </button>
      </form>

      {result && (
        <div className="pii-analyzer-results">
          <h2 className="pii-analyzer-results-title">Analysis Results</h2>
          {result.error ? (
            <p className="pii-analyzer-error">{result.error}</p>
          ) : (
            <>
              <div className={`pii-analyzer-status pii-analyzer-status-${result.status}`}>
                Status: <strong>{result.status}</strong>
              </div>
              {result.matched_patterns.length > 0 && (
                <div className="pii-analyzer-matched-patterns">
                  <h3>Matched Patterns:</h3>
                  <ul className="pii-analyzer-pattern-list">
                    {result.matched_patterns.map((pattern, index) => (
                      <li key={index} className="pii-analyzer-pattern-item">{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pii-analyzer-password-variants">
                <p>Normalized Password: <code>{result.password_variants.normalized}</code></p>
                <p>Reverse Leetspeak: <code>{result.password_variants.reverse_leet}</code></p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PIIAnalyzer;