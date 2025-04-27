import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../css/Home.css";
import axios from "axios";

import { FiUser, FiLogOut } from "react-icons/fi";

import logo from "../images/logo.jpg";

import ResetPasswordModal from "../components/ResetPasswordModal";
import PasswordResultModal from "../components/PasswordResultModal";
import ResetExpiryModal from "../components/ResetExpiryModal";

import { toast } from "react-toastify";

const Dashboard = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [password, setPassword] = useState("");
  const [expiryStatus, setExpiryStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordResult, setPasswordCheck] = useState(null);
  const user_password = location.state?.password;
  const [resultFetchStatus, setResultFetchStatus] = useState(true);
  const [userPassword, setUserPassword] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showResetTimeModal, setShowResetTimeModal] = useState(false);

  const prevPasswordRef = useRef();

  useState(() => {
    setUserPassword(user_password);
  }, [user_password]);

  const handlePasswordReset = (newPass) => {
    setUserPassword(newPass);
    setResultFetchStatus(true);
  };

  // useEffect(() => {
  //   if (userPassword) {
  //     axios
  //       .post(
  //         "http://localhost:5000/validate-password",
  //         { password: userPassword },
  //         { headers: { "Content-Type": "application/json" } }
  //       )
  //       .then((response) => {
  //         setPasswordCheck(response.data.result);
  //         toast.success("Password Checking Completed.");
  //         if (response.data.result) setResultFetchStatus(false);
  //         console.log(response.data);
  //       })
  //       .catch((error) => {
  //         console.error("Error validating password:", error);
  //       });
  //   }
  // }, [userPassword]);

  useEffect(() => {
    if (userPassword && userPassword !== prevPasswordRef.current) {
      axios
        .post(
          "http://localhost:5000/validate-password",
          { password: userPassword },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          setPasswordCheck(response.data.result);
          toast.success("Password Checking Completed.");
          if (response.data.result) setResultFetchStatus(false);
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error validating password:", error);
        });
    }
    
    // Update ref with the latest password
    prevPasswordRef.current = userPassword;
  }, [userPassword]);

  const checkPasswordExpiry = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/check_password_expiry",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data) {
        console.log(res.data);
        setExpiryStatus(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkPasswordExpiry();
  }, [userPassword]);

  const handleAnalyze = () => {
    if (password.trim()) {
      navigate("/password-analysis-dashboard", { state: { password } });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-section")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("logout successfully.");
    navigate("/");
  };

  const handleMultiplePass =()=>{
    navigate('/bulk_check');
  }

  const handlepiicheck=()=>{
    navigate('/pii-check');
  }

  return (
    <div className="home-container">
      <ResetPasswordModal
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
        onPasswordReset={handlePasswordReset}
      />

      <ResetExpiryModal
        show={showResetTimeModal}
        onClose={() => setShowResetTimeModal(false)}
        onResetSuccess={checkPasswordExpiry}
      />

      <header className="home-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="home-logo" />
          <h1 className="home-logo-text">CyberGuard</h1>
        </div>

        <div className="profile-section">
          <button
            className="profile-button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <FiUser className="profile-icon" />
          </button>

          {isProfileMenuOpen && (
            <div className="profile-dropdown">
               <button onClick={()=>{handlepiicheck();setIsProfileMenuOpen(!isProfileMenuOpen)}} className="dropdown-item">
                 PII Check
              </button>
              <button
                onClick={() => {setShowResetModal(true);setIsProfileMenuOpen(!isProfileMenuOpen)}}
                className="dropdown-item"
              >
                <span className="dropdown-icon">🔁</span>
                Reset Password
              </button>
              {/* <button onClick={()=>{setShowResetTimeModal(true);setIsProfileMenuOpen(!isProfileMenuOpen)}} className="dropdown-item">
                <span className="dropdown-icon">⏳</span>
                Reset Password Expire Limit
              </button> */}
              {/* <button className="dropdown-item">
                <span className="dropdown-icon">🚫</span>
                Add Ban Words List
              </button> */}
              {/* <button className="dropdown-item">
                <span className="dropdown-icon">⏱️</span>
                Reset Crack Time Limit
              </button> */}
              {/* <div className="dropdown-divider"></div> */}
              <button className="dropdown-item" onClick={()=>{handleLogout();setIsProfileMenuOpen(!isProfileMenuOpen)}}>
                <FiLogOut className="dropdown-icon" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {expiryStatus && (
        <div className={`password-expiry-alert ${expiryStatus.status}`}>
          {expiryStatus.alert}
        </div>
      )}

      {resultFetchStatus && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="cyber-loader">
            <div className="cyber-spinner" aria-hidden="true"></div>
            <div className="cyber-text">Analysing password</div>
          </div>
        </div>
      )}

      {!resultFetchStatus && passwordResult && (
        <PasswordResultModal
          onResetClick={() => setShowResetModal(true)}
          data={passwordResult}
        />
      )}
      <section className="home-title-section">
        <h2 className="home-title">Multi-layered Password Strength Analyzer</h2>
        <p className="home-subtitle">
          Your password, our protection - layer by layer.
        </p>
      </section>

      <section className="home-input-section">
        <div className="home-input-toggle">
          <button
            className={`home-toggle-button ${!isMultiple ? "active" : ""}`}
            onClick={() => setIsMultiple(false)}
          >
            Single Input
          </button>
          <button
            className={`home-toggle-button ${isMultiple ? "active" : ""}`}
            onClick={() => handleMultiplePass()}
          >
            Multiple Input
          </button>
        </div>
        {isMultiple ? (
          <textarea
            className="home-textarea"
            placeholder="Enter multiple passwords (comma or newline separated)"
            rows={5}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : (
          <input
            className="home-input"
            placeholder="Enter your password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <button className="home-analyze-button" onClick={handleAnalyze}>
          Analyze Password
        </button>
      </section>
     
      <section className="home-features">
        <h3 className="home-features-title">What we provide</h3>
        <div className="home-feature-flow">
          <div className="home-feature-card-wrapper">
            <div className="home-card">
              <h4>Leaked Password Check</h4>
              <p>
                Cross-references user password against known leaked datasets to
                identify compromised passwords.
              </p>
            </div>
            <div className="home-connector" />
          </div>
          <div className="home-feature-card-wrapper">
            <div className="home-card">
              <h4>Pattern & Banword Analysis</h4>
              <p>
                Scans for common patterns, repeated characters, dictionary/ban
                words and keyboard walks that weaken password strength.
              </p>
            </div>
            <div className="home-connector" />
          </div>
          <div className="home-feature-card-wrapper">
            <div className="home-card">
              <h4>Composition & Entropy Analysis</h4>
              <p>
                Evaluates the compositional strength of passowrd and calculates
                entropy to estimate unpredictability and randomness.
              </p>
            </div>
            <div className="home-connector" />
          </div>
          <div className="home-feature-card-wrapper">
            <div className="home-card">
              <h4>Crack Time Estimation</h4>
              <p>
                Predicts the time it would take a brute-force or dictionary
                attack to crack the password.
              </p>
            </div>
            <div className="home-connector" />
          </div>
          <div className="home-feature-card-wrapper">
            <div className="home-card">
              <h4>Strong Password Suggestions</h4>
              <p>
                Recommends or generates strong, secure passwords based on NIST
                Guidelies and Improve password based on feedback of above layer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2025 CyberGuard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
