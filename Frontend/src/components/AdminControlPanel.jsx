import React, { useState } from "react";
import { FiSettings, FiLock, FiShield, FiClock } from "react-icons/fi";
// import "../styles/AdminControlPanel.css";
import { useNavigate } from "react-router-dom";

import AdminFormOverlay from "./AdminFormOverlay";

export default function AdminControlPanel() {
  const [selectedAction, setSelectedAction] = useState(null);
  const navigate = useNavigate();
   const handleMultiplePass = () => {
    navigate("/bulk_check");
  };

  const handleCardClick = (action) => {
    setSelectedAction(action);
  };

  const closeOverlay = () => {
    setSelectedAction(null);
  };
  return (
    <div className="dashboard-right-content">
      <div className="dashboard-content-header">
        <h2>Admin Control Panel</h2>
        <p>Administrative functions and system management</p>
      </div>
      <div className="dashboard-admin-grid">
        <button className="dashboard-admin-card" onClick={handleMultiplePass}>
          <FiSettings className="dashboard-admin-icon" />
          <span>Bulk Password Checkup</span>
        </button>
        <button
          className="dashboard-admin-card"
          onClick={() => handleCardClick("update_ban_words")}
        >
          <FiLock className="dashboard-admin-icon" />
          <span>Manage Banned Passwords</span>
        </button>
        <button
          className="dashboard-admin-card"
          onClick={() => handleCardClick("update_constraints")}
        >
          <FiShield className="dashboard-admin-icon" />
          <span>Password Strength Rules</span>
        </button>
        <button
          className="dashboard-admin-card"
          onClick={() => handleCardClick("update_timeout")}
        >
          <FiClock className="dashboard-admin-icon" />
          <span>Crack Time Thresholds</span>
        </button>
        <button
          className="dashboard-admin-card"
          onClick={() => handleCardClick("update_expiry")}
        >
          <FiClock className="dashboard-admin-icon" />
          <span>Reset Password Expiry</span>
        </button>
      </div>
      {selectedAction && (
        <AdminFormOverlay action={selectedAction} onClose={closeOverlay} />
      )}
    </div>
  );
}
