import React from "react";
import "../css/PasswordResultModal.css";

const PasswordResultModalBoard = ({ data, onResetClick }) => {
  if (!data) {
    return (
      <div className="password-result-modal loading">
        <p>No data available. Please check back later.</p>
      </div>
    );
  }
  const { status, vulnerable_layers = [] } = data;


  return (
    <div className="password-result-modal">
      <h2 className="modal-title">Password Security Analysis</h2>

      {status && vulnerable_layers.length > 0 && (
        <div className="vulnerability-alert">
          <div className="alert-header">
            <h3>🚨 Security Alert: Vulnerabilities Detected</h3>
          </div>
          <div className="vulnerable-layers">
            <p>Affected security layers:</p>
            <ul>
              {vulnerable_layers.map((layer, index) => (
                <li key={index}>{layer.replace(/-/g, " ")}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="layer-results-grid">
        {/* Leaked Password Detection */}
        <div
          className={`result-card ${data["Leaked-Password-Detection"]?.status ? "vulnerable" : "safe"
            }`}
        >
          <h4>🔒 Leak Detection</h4>
          <div className="status-indicator">
            Status:{" "}
            <span className="status-text">
              {data["Leaked-Password-Detection"]?.status
                ? "Vulnerable"
                : "Secure"}
            </span>
          </div>
          <p className="statement">
            {data["Leaked-Password-Detection"]?.statement}
          </p>
        </div>

        {/* Banned Words Detection */}
        <div
          className={`result-card ${data["Banned-Words-Detection"]?.status ? "vulnerable" : "safe"
            }`}
        >
          <h4>🛑 Banned Patterns</h4>
          <div className="status-indicator">
            Status:{" "}
            <span className="status-text">
              {data["Banned-Words-Detection"]?.status ? "Vulnerable" : "Secure"}
            </span>
          </div>

          {data["Banned-Words-Detection"]?.original_password_result?.status && (
            <>
              <div className="pattern-section">
                <h5>Original Password Issues</h5>
                <div className="pattern-list">
                  {data[
                    "Banned-Words-Detection"
                  ].original_password_result.patterns?.map((p, idx) => (
                    <div className="pattern-meta-data" key={idx}>
                      <span className="pattern-badge">{p.pattern}</span>
                      <span className="pattern-badge">{p.dictionary_name}</span>
                      <span className="pattern-badge">{p.matched_word}</span>
                    </div>
                  ))}
                </div>
              </div>
              {data["Banned-Words-Detection"]?.original_password_result
                ?.warning && (
                  <div className="warning-section">
                    <p>
                      {
                        data["Banned-Words-Detection"]?.original_password_result
                          ?.warning
                      }
                    </p>
                  </div>
                )}
            </>
          )}

          {data["Banned-Words-Detection"]?.normalized_is_weaker && (
            <>
              <div className="pattern-section">
                <h5>Normalized Password Weakness</h5>
                <div className="pattern-list">
                  {data[
                    "Banned-Words-Detection"
                  ].normalized_password_result.patterns?.map((p, idx) => (
                    <div className="pattern-meta-data" key={idx}>
                      <span className="pattern-badge">{p.pattern}</span>
                      <span className="pattern-badge">{p.dictionary_name}</span>
                      <span className="pattern-badge">{p.matched_word}</span>
                    </div>
                  ))}
                </div>
                {data["Banned-Words-Detection"]?.normalized_password_result
                  ?.warning && (
                    <div className="warning-section">
                      <p>
                        {
                          data["Banned-Words-Detection"]
                            ?.normalized_password_result?.warning
                        }
                      </p>
                    </div>
                  )}
                <p className="explanation">
                  {data["Banned-Words-Detection"]?.explain}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Password Strength Analysis */}
        <div
          className={`result-card ${data["Strength-Analysis"]?.status ? "vulnerable" : "safe"
            }`}
        >
          <h4>📊 Strength Analysis</h4>
          <div className="strength-metrics">
            <div className="metric">
              <span className="metric-label">Score</span>
              <span className="metric-value">
                {data["Strength-Analysis"]?.score}/10
              </span>
            </div>

            {Object.entries(data["Strength-Analysis"]?.features || {}).map(
              ([key, value]) => (
                <div className="metric" key={key}>
                  <span className="metric-label">{key.replace(/_/g, " ")}</span>
                  <span className="metric-value">
                    {typeof value === "number" ? value.toFixed(2) : value}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Crack Time Estimation */}
        <div
          className={`result-card ${data["Crack-Time-Estimation"]?.status ? "vulnerable" : "safe"
            }`}
        >
          <h4>⏱️ Crack Time Estimation</h4>
          <p className="result-statement">
            {data["Crack-Time-Estimation"]?.result_statement}
          </p>

          {/* {data["Crack-Time-Estimation"]. ( */}
          <div className="crack-engine-result">
            {/* MD5 Hash Result */}
            <div
              className={`cracking-algorithm-result ${data["Crack-Time-Estimation"]?.md5_hash_result?.status ===
                  "cracked"
                  ? "vulnerable"
                  : "safe"
                }`}
            >
              <div className="algorithm-header">
                <span className="algorithm-name">MD5 Hash</span>
                <span className="algorithm-status">
                  {data["Crack-Time-Estimation"]?.md5_hash_result?.status}
                </span>
              </div>
              <div className="algorithm-details">
                {data["Crack-Time-Estimation"]?.md5_hash_result
                  ?.cracked_password && (
                    <p className="cracked-password">
                      Cracked Password:{" "}
                      <strong>
                        {
                          data["Crack-Time-Estimation"].md5_hash_result
                            .cracked_password
                        }
                      </strong>
                    </p>
                  )}
                <p className="crack-method">
                  Method:{" "}
                  {data["Crack-Time-Estimation"]?.md5_hash_result?.method}
                </p>
                <p className="crack-time">
                  Time:{" "}
                  {data["Crack-Time-Estimation"]?.md5_hash_result
                    ?.crack_time_seconds ? (
                    <>
                      {
                        data["Crack-Time-Estimation"].md5_hash_result
                          .crack_time_seconds
                      }
                    </>
                  ) : (
                    <>Timeout</>
                  )}
                  sec
                </p>
              </div>
            </div>

            {/* SHA256 Hash Result */}
            <div
              className={`cracking-algorithm-result ${data["Crack-Time-Estimation"]?.sha256_hash_result?.status ===
                  "cracked"
                  ? "vulnerable"
                  : "safe"
                }`}
            >
              <div className="algorithm-header">
                <span className="algorithm-name">SHA256 Hash</span>
                <span className="algorithm-status">
                  {data["Crack-Time-Estimation"]?.sha256_hash_result?.status}
                </span>
              </div>
              <div className="algorithm-details">
                {data["Crack-Time-Estimation"]?.sha256_hash_result
                  ?.cracked_password && (
                    <p className="cracked-password">
                      Cracked Password:{" "}
                      <strong>
                        {
                          data["Crack-Time-Estimation"].sha256_hash_result
                            .cracked_password
                        }
                      </strong>
                    </p>
                  )}
                <p className="crack-method">
                  Method:{" "}
                  {data["Crack-Time-Estimation"]?.sha256_hash_result?.method}
                </p>
                <p className="crack-time">
                  Time:{" "}
                  {data["Crack-Time-Estimation"]?.sha256_hash_result
                    ?.crack_time_seconds ? (
                    <>
                      {
                        data["Crack-Time-Estimation"].sha256_hash_result
                          .crack_time_seconds
                      }
                    </>
                  ) : (
                    <>Timeout</>
                  )}
                  sec
                </p>
              </div>
            </div>
          </div>
          <div className="crack-time-details">
            {Object.entries(
              data["Crack-Time-Estimation"]?.md5_hash_result
                ?.detailed_crack_time || {}
            ).map(([key, value]) => (
              <div className="time-metric" key={key}>
                <span className="time-scenario">{key.replace(/_/g, " ")}:</span>
                <span className="time-value">{value} seconds</span>
              </div>
            ))}
          </div>
          {/* {data["Strong-Password"]?.status && 
          (<>
          {data["Strong-Password"]?.result?.reasoning_given_password}
          {data["Strong-Password"]?.result?.strong_password}
          {data["Strong-Password"]?.result?.reasoning_generated_password}
          </>)
          } */}
          {!data["Strong-Password"]?.status && (
            <div className="genai-result-container">
              <div className="genai-result-section">
                <h3 className="genai-result-header">
                  <span className="genai-result-icon">⚠️</span>
                  Weakness Analysis
                </h3>
                <p className="genai-result-content genai-result-weakness">
                  {data["Strong-Password"]?.result?.reasoning_given_password}
                </p>
              </div>

              <div className="genai-result-section">
                <h3 className="genai-result-header">
                  <span className="genai-result-icon">✅</span>
                  Strong Password
                </h3>
                <div className="genai-result-password-container">
                  <p className="genai-result-content genai-result-password">
                    {data["Strong-Password"]?.result?.strong_password}
                  </p>
                  <button
                    className="genai-result-copy-btn"
                    onClick={() => navigator.clipboard.writeText(data["Strong-Password"]?.result?.strong_password)}
                    title="Copy password"
                  >
                    ⎘
                  </button>
                </div>
              </div>

              <div className="genai-result-section">
                <h3 className="genai-result-header">
                  <span className="genai-result-icon">ℹ️</span>
                  Security Explanation
                </h3>
                <p className="genai-result-content genai-result-explanation">
                  {data["Strong-Password"]?.result?.reasoning_generated_password}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResultModalBoard;
