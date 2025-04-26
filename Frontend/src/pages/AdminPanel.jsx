// AdminPanel.jsx
import React, { useState } from "react";
import "../css/AdminPanel.css";
import AdminFormOverlay from "../components/AdminFormOverlay";

const AdminPanel = () => {
  const [selectedAction, setSelectedAction] = useState(null);

  const handleCardClick = (action) => {
    setSelectedAction(action);
  };

  const closeOverlay = () => {
    setSelectedAction(null);
  };

  return (
    <div className="admin-container">
      <h1 className="admin-header">Admin Panel</h1>
      <div className="admin-grid">
        <div className="admin-card" onClick={() => handleCardClick("update_expiry")}>
          Update Password Expiry Days
        </div>
        <div className="admin-card" onClick={() => handleCardClick("update_ban_words")}>
          Update Banned Words List
        </div>
        <div className="admin-card" onClick={() => handleCardClick("update_timeout")}>
          Update Password Fallback Timeout
        </div>
        <div className="admin-card" onClick={() => handleCardClick("update_constraints")}>
          Update Password Composition Constraints
        </div>
      </div>

      {selectedAction && (
        <AdminFormOverlay action={selectedAction} onClose={closeOverlay} />
      )}
    </div>
  );
};

export default AdminPanel;
