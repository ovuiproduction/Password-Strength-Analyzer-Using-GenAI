import React, { useState } from "react";
import "../styles/PatternDetection.css";

export default function PatternDetection() {
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
      const response = await fetch("http://localhost:5000/pattern-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Server error. Please try again.");

      const data = await response.json();
      console.log(data);
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
        <h2>Pattern & Banned Word Detection</h2>
        <p>Identify patterns and banned words in passwords</p>
      </div>

      <div className="pattern-container">
        <form onSubmit={handleSubmit} className="pattern-form">
          <input
            type="password"
            placeholder="Enter password to check..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pattern-input"
          />
          <button type="submit" className="pattern-btn" disabled={loading}>
            {loading ? "Checking..." : "Check Patterns"}
          </button>
        </form>

        {error && <p className="pattern-error">{error}</p>}
        {result && result.status && <h3 className="given-password-text">Given Password : {result.password}</h3>}
        {result && (
          <div
            className={`pattern-result ${result.status ? "flagged" : "safe"}`}
          >
            <h3>
              {result.status
                ? "Sensitive patterns detected"
                : "No PII or banned words found"}
                <span className="status-pill"></span>
            </h3>

            {/* Original password result */}
            <section>
              <h4>Original Password Analysis</h4>
              {result.original_password_result.patterns.length > 0 ? (
                
                <div className="password-patterns">
                  <table className="pattern-table">
                    <thead>
                      <tr>
                        <th>Pattern</th>
                        <th>Token</th>
                        <th>Guesses</th>
                        <th>Matched Word</th>
                        <th>Dictionary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.original_password_result.patterns.map(
                        (p, idx) => (
                          <tr key={idx}>
                            <td className="pattern-cell">
                              <strong>{p.pattern}</strong>
                            </td>
                            <td className="token-cell">
                              {p.token ? (
                                <span className="token">{p.token}</span>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="token-cell">
                              {p.guesses ? (
                                <span className="token">{p.guesses}</span>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="word-cell">
                              {p.matched_word ? (
                                <span className="matched-word">
                                  {p.matched_word}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="dictionary-cell">
                              {p.dictionary_name ? (
                                <em>{p.dictionary_name}</em>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No sensitive patterns found in original password.</p>
              )}
              {result.original_password_result.warning && (
                <p className="warning">
                  ⚠️ {result.original_password_result.warning}
                </p>
              )}
              {result.original_password_result.suggestions.length > 0 && (
                <ul className="suggestions">
                  {result.original_password_result.suggestions.map((s, idx) => (
                    <li key={idx}>💡 {s}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Normalized password result (if weaker) */}
            {result && result.normalized_password_result?.patterns?.length > 0 && (
              <section className="normalized-block">
                <h4>Normalized Password Analysis</h4>
                  <ul>
                    {result.normalized_password_result.patterns.map(
                      (p, idx) => (
                        <li key={idx}>
                          <strong>{p.pattern}</strong> — {p.matched_word}{" "}
                          {p.dictionary_name && <em>({p.dictionary_name})</em>}
                        </li>
                      )
                    )}
                  </ul>
                {result.explain && (
                  <p className="explain">🔎 {result.explain}</p>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
