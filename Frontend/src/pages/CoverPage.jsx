// CoverPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLock,
  FiActivity,
  FiAlertCircle,
  FiKey,
  FiBarChart2,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiClock,
  FiRefreshCcw,
} from "react-icons/fi";

import "../css/CoverPage.css";

import AuthModal from '../components/AuthModal';


const CoverPage = () => {
  const navigate = useNavigate();
  const [authModalFlag,setAuthModal] = useState(false);

  return (
    <div className="cover-container">
     {authModalFlag && <AuthModal onClose={() => setAuthModal(false)} />}
      <header className="cover-header">
        <div className="cover-nav">
          <div className="cover-logo">
            <FiShield className="logo-icon" />
            <span>SecurePass</span>
          </div>
        </div>

        <div className="hero-content">
          <h1>Advanced Password Strength Analysis</h1>
          <p>
            Protect your digital assets with multi-layered security evaluation
          </p>
          <button onClick={()=>setAuthModal(true)} className="cta-button">
            Login
          </button>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <FiShield className="feature-icon" />
          <h3>Password Strength Analysis</h3>
          <p>
            Evaluate passwords using breach data, entropy metrics, pattern
            detection, SHAP explainability, and crack time estimations.
          </p>
        </div>

        <div className="feature-card">
          <FiKey className="feature-icon" />
          <h3>Strong Password Generator</h3>
          <p>
            Create secure, random passwords that comply with best practices,
            avoiding weak patterns and personal data.
          </p>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <FiLock className="feature-icon" />
          <h3>Leak Detection</h3>
          <p>Check against known data breaches</p>
        </div>

        <div className="feature-card">
          <FiActivity className="feature-icon" />
          <h3>Pattern Analysis</h3>
          <p>Identify vulnerable sequences</p>
        </div>

        <div className="feature-card">
          <FiAlertCircle className="feature-icon" />
          <h3>Entropy Check</h3>
          <p>Measure cryptographic strength</p>
        </div>

        <div className="feature-card">
          <FiKey className="feature-icon" />
          <h3>Leetspeak Detection</h3>
          <p>Normalize and detect common obfuscation patterns</p>
        </div>

        <div className="feature-card">
          <FiBarChart2 className="feature-icon" />
          <h3>SHAP Explainability</h3>
          <p>Interpret feature impact on password strength</p>
        </div>

        <div className="feature-card">
          <FiSearch className="feature-icon" />
          <h3>Dictionary Match</h3>
          <p>Compare against common words and names</p>
        </div>

        <div className="feature-card">
          <FiShield className="feature-icon" />
          <h3>Strength Scoring</h3>
          <p>Score passwords with zxcvbn and custom logic</p>
        </div>

        <div className="feature-card">
          <FiUserCheck className="feature-icon" />
          <h3>Personal Info Detection</h3>
          <p>Identify use of names, DOBs, or email fragments</p>
        </div>

        <div className="feature-card">
          <FiClock className="feature-icon" />
          <h3>Crack Time Estimation</h3>
          <p>
            Estimate password crack time using incremental and wordlist attacks
          </p>
        </div>

        <div className="feature-card">
          <FiRefreshCcw className="feature-icon" />
          <h3>Strong Password Generator</h3>
          <p>Create secure, random, policy-compliant passwords instantly</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Start Securing Password</h2>
        <button
          className="cta-button secondary"
          onClick={() => navigate("/home")}
        >
          Get Started
        </button>
      </section>

      <section className="cta-section">
        <a href="/admin">Admin Panel</a>
      </section>
      
    </div>
  );
};

export default CoverPage;
