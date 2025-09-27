import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css/Home.css";
import axios from "axios";

import logo from "../images/logo.png";

import PasswordResultModalBoard from "../components/PasswordResultModalBoard";

import { toast } from "react-toastify";

const PasswordAnalysis = () => {
  const location = useLocation();
  const [passwordResult, setPasswordCheck] = useState(null);
  const password = location.state?.password;
  const [resultFetchStatus, setResultFetchStatus] = useState(true);

  useEffect(() => {
    if (password) {
      axios
        .post(
          "http://localhost:5000/validate-password",
          { password: password },
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
  }, [password]);

  return (
    <div className="home-container">

      <header className="home-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="home-logo" />
          <h1 className="home-logo-text">Password Analysis Dashboard</h1>
        </div>
      </header>

      {resultFetchStatus && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="cyber-loader">
            <div className="cyber-spinner" aria-hidden="true"></div>
            <div className="cyber-text">Analysing password</div>
          </div>
        </div>
      )}

      {!resultFetchStatus && passwordResult && (
        <PasswordResultModalBoard
          onResetClick={() => setShowResetModal(true)}
          data={passwordResult}
        />
      )}
     
      <footer className="home-footer">
        <p>&copy; 2025 CyberGuard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PasswordAnalysis;
