import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../css/Dashboard.css";
import axios from "axios";

import {
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiShield,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiMic,
  FiLock,
} from "react-icons/fi";

import logo from "../images/logo.png";

import ResetPasswordModal from "../components/ResetPasswordModal";
import PasswordResultModal from "../components/PasswordResultModal";
import ResetExpiryModal from "../components/ResetExpiryModal";

import { toast } from "react-toastify";
import BreachDetection from "../components/BreachDetection";
import PatternDetection from "../components/PatternDetection";
import CompositionAnalysis from "../components/CompositionAnalysis";
import CracktimeEstimation from "../components/CracktimeDetection";
import AdminControlPanel from "../components/AdminControlPanel";
import DeepfakeAudioDetection from "../components/DeepfakeAudioDetection";
import EnrollAudioPassword from "../components/EnrollAudioPassword";

const Dashboard = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [password, setPassword] = useState("");
  const [expiryStatus, setExpiryStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordResult, setPasswordCheck] = useState(null);
  const { user_password, user_email } = location.state;
  const [resultFetchStatus, setResultFetchStatus] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showResetTimeModal, setShowResetTimeModal] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedSection = sessionStorage.getItem("activeSection");
    if (savedSection) {
      setActiveSection(savedSection);
    } else if (activeSection === "") {
      setActiveSection("dashboard");
    }
  }, []);

  useEffect(() => {
    if (activeSection) {
      sessionStorage.setItem("activeSection", activeSection);
    }
  }, [activeSection]);

  // Service items data
  const serviceItems = [
    {
      id: "dashboard",
      label: "Password Analysis Dashboard",
      icon: <FiShield />,
    },
    {
      id: "Password Expiry",
      label: "Password Expiry Status",
      icon: <FiClock />,
    },
    { id: "breach", label: "Breach Identification", icon: <FiAlertTriangle /> },
    {
      id: "pattern",
      label: "Pattern & Banned Word Detection",
      icon: <FiLock />,
    },
    {
      id: "composition",
      label: "Password Composition Analysis",
      icon: <FiCheckCircle />,
    },
    { id: "cracktime", label: "Crack Time Estimation", icon: <FiClock /> },
    { id: "complete", label: "Complete Password Checkup", icon: <FiShield /> },
    { id: "enroll-audio-password", label: "enroll-audio-password", icon: <FiMic /> },
    { id: "deepfake", label: "Deepfake Voice Detection", icon: <FiMic /> },
    { id: "admin", label: "Admin Control Panel", icon: <FiSettings /> },
  ];

  // updating user password field as it received from login
  useState(() => {
    console.log("refresh");
    let session_user_password = sessionStorage.getItem("user_password");
    let session_user_email = sessionStorage.getItem("user_email");
    if (!session_user_password && !session_user_email) {
      setUserPassword(user_password);
      setUserEmail(user_email);
    }else{
      setUserPassword(session_user_password);
      setUserEmail(session_user_email);
    }
  }, []);

  // password updation function
  const handlePasswordReset = (newPass) => {
    setUserPassword(newPass);
    sessionStorage.setItem("user_password",newPass);
    setResultFetchStatus(true);
  };

  // Validate password whenever it changes
  useEffect(() => {
    if (userPassword && activeSection == "dashboard") {
      setResultFetchStatus(true);
      axios
        .post(
          "http://localhost:5000/validate-password-user",
          { password: userPassword, email: userEmail },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          setPasswordCheck(response.data.result);
          toast.success("Password Checking Completed.");
          if (response.data.result) setResultFetchStatus(false);
        })
        .catch((error) => {
          console.error("Error validating password:", error);
        });
    }
  }, [userPassword, activeSection]);

  // checking the password expiry
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
        setExpiryStatus(res.data);
        sessionStorage.setItem(
          "password_expiry_status",
          JSON.stringify({
            status: res.data.status,
            alert: res.data.alert,
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // password expiry updation
  useEffect(() => {
    let password_expiry_status = sessionStorage.getItem(
      "password_expiry_status"
    );

    if (password_expiry_status) {
      try {
        const parsedStatus = JSON.parse(password_expiry_status);
        setExpiryStatus(parsedStatus);
        console.log(parsedStatus.status);
        console.log(parsedStatus.alert);
      } catch (e) {
        console.error("Error parsing sessionStorage value:", e);
      }
    } else {
      checkPasswordExpiry();
    }
  }, []);

  const handleAnalyze = () => {
    if (password.trim()) {
      navigate("/password-analysis-dashboard", { state: { password } });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dashboard-profile-section")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  const handleMultiplePass = () => {
    navigate("/bulk_check");
  };

  const handlepiicheck = () => {
    navigate("/pii-check");
  };

  const renderRightPanelContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="dashboard-right-content">
            <div className="dashboard-content-header">
              <h2>Password Security Analysis</h2>
              <p>Analyze your password strength and security in real-time</p>
            </div>

            {!resultFetchStatus && passwordResult && (
              <PasswordResultModal
                onResetClick={() => setShowResetModal(true)}
                data={passwordResult}
              />
            )}
            {resultFetchStatus && (
              <div className="dashboard-loading-overlay">
                <div className="dashboard-loader">
                  <div className="dashboard-spinner"></div>
                  <div className="dashboard-loader-text">
                    Analyzing password security...
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Password Expiry":
        return (
          <div className="dashboard-right-content">
            <div className="dashboard-content-header">
              <h2>Password Expiry Status</h2>
              <p>Check and manage your password expiry settings</p>
            </div>
            {expiryStatus && (
              <div
                className={`dashboard-expiry-alert dashboard-expiry-${expiryStatus.status}`}
              >
                <FiAlertTriangle className="dashboard-alert-icon" />
                {expiryStatus.alert}
              </div>
            )}
          </div>
        );

      case "breach":
        return <BreachDetection />;

      case "pattern":
        return <PatternDetection />;

      case "composition":
        return <CompositionAnalysis />;

      case "cracktime":
        return <CracktimeEstimation />;

      case "complete":
        return (
          <div className="dashboard-right-content">
            <div className="dashboard-content-header">
              <h2>Complete Password Checkup</h2>
              <p>Comprehensive password security assessment</p>
            </div>
            {/* <div className="dashboard-feature-card"> */}
            <div className="dashboard-analysis-section">
              <div className="dashboard-input-card">
                <h3>Password Analysis</h3>
                <div className="dashboard-input-group">
                  <input
                    className="dashboard-input"
                    placeholder="Enter your password to analyze"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="dashboard-analyze-button"
                    onClick={handleAnalyze}
                  >
                    Analyze Password
                  </button>
                </div>
                <div className="dashboard-input-options">
                  <button
                    className="dashboard-option-button"
                    onClick={handleMultiplePass}
                  >
                    Bulk Password Check
                  </button>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
        );

      case "admin":
        return <AdminControlPanel />;

      case "enroll-audio-password":
        return <EnrollAudioPassword />;

      case "deepfake":
        return <DeepfakeAudioDetection />;


      default:
        return (
          <div className="dashboard-right-content">
            <div className="dashboard-content-header">
              <h2>Password Security Dashboard</h2>
              <p>Select a service from the navigation panel to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
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

      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <button
            className="dashboard-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <img src={logo} alt="CyberGuard Logo" className="dashboard-logo" />
          <div className="dashboard-brand">
            <h1 className="dashboard-logo-text">BhairavX</h1>
            <span className="dashboard-tagline">Password Security</span>
          </div>
        </div>

        <div className="dashboard-profile-section">
          <button
            className="dashboard-profile-button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <FiUser className="dashboard-profile-icon" />
            <span className="dashboard-profile-text">Account</span>
          </button>

          {isProfileMenuOpen && (
            <div className="dashboard-profile-dropdown">
              <button
                onClick={() => {
                  handlepiicheck();
                  setIsProfileMenuOpen(false);
                }}
                className="dashboard-dropdown-item"
              >
                <FiLock className="dashboard-dropdown-icon" />
                PII Check
              </button>
              <button
                onClick={() => {
                  setShowResetModal(true);
                  setIsProfileMenuOpen(false);
                }}
                className="dashboard-dropdown-item"
              >
                <FiSettings className="dashboard-dropdown-icon" />
                Reset Password
              </button>
              <button
                className="dashboard-dropdown-item"
                onClick={() => {
                  handleLogout();
                  setIsProfileMenuOpen(false);
                }}
              >
                <FiLogOut className="dashboard-dropdown-icon" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-main">
        <div
          className={`dashboard-left-panel ${
            isMobileMenuOpen ? "dashboard-mobile-open" : ""
          }`}
        >
          <nav className="dashboard-services-nav">
            <div className="dashboard-nav-header">
              <h3>Security Services</h3>
            </div>
            <ul className="dashboard-nav-list">
              {serviceItems.map((item) => (
                <li key={item.id} className="dashboard-nav-item">
                  <button
                    className={`dashboard-nav-button ${
                      activeSection === item.id ? "dashboard-nav-active" : ""
                    }`}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="dashboard-nav-icon">{item.icon}</span>
                    <span className="dashboard-nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="dashboard-right-panel">{renderRightPanelContent()}</div>
      </div>

      <footer className="dashboard-footer">
        <div className="dashboard-footer-content">
          <p>&copy; 2025 CyberGuard Enterprise. All rights reserved.</p>
          <div className="dashboard-footer-links">
            <span>v2.1.0</span>
            <span>•</span>
            <span>Security Compliance</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
