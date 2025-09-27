import React, { useState } from "react";

import "../styles/BreachDetection.css";

export default function BreachDetection() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/breach-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Server error. Please try again.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-right-content">
      <div className="dashboard-content-header">
        <h2>Breach Identification</h2>
        <p>Check if your password has been exposed in data breaches</p>
      </div>

      <div className="breach-container">
        <form onSubmit={handleSubmit} className="breach-form">
          <input
            type="password"
            placeholder="Enter password to check..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="breach-input"
          />
          <button type="submit" className="breach-btn" disabled={loading}>
            {loading ? "Checking..." : "Check Breach"}
          </button>
        </form>

        {error && <p className="breach-error">{error}</p>}

        {result && (
          <>
          <h3>Given Password : {password}</h3>
          <div className={`breach-result ${result.status ? "breached" : "safe"}`}>
            <h3>Match Password : {result.variant}</h3>
            <p>{result.statement}</p>
            <p className="status-label">
              Status: <span>{result.status ? "Breached" : "Safe"}</span>
            </p>
          </div>
           </>
        )}
      </div>
    </div>
  );
}
