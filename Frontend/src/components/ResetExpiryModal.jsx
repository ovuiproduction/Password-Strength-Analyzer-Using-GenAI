import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/ResetExpiryModal.css";
import { toast } from "react-toastify";

const ResetExpiryModal = ({ show, onClose, onResetSuccess }) => {
  const [days, setDays] = useState("");
  const [error, setError] = useState("");

  // ✅ Reset fields when modal opens
  useEffect(() => {
    if (show) {
      setDays("");
      setError("");
    }
  }, [show]);

  const handleReset = async () => {
    if (!days || isNaN(days) || days <= 0) {
      setError("Please enter a valid number of days.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/update-expire-time",
        { days: Number(days) },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data.status);
      onResetSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to reset expiry time.");
    }
  };

  if (!show) return null;

  return (
    <div className="reset-expiry-modal-overlay">
      <div className="reset-expiry-modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Reset Password Expiry</h2>

        <input
          type="number"
          placeholder="Enter days (e.g. 30)"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <button className="reset-expiry-btn" onClick={handleReset}>
          Reset
        </button>

        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
};

export default ResetExpiryModal;
