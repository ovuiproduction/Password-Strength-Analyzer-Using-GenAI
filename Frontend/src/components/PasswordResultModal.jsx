import React from "react";
import "../css/PasswordResultModal.css";
import { useState } from "react";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import CustomizeModal from './CustomizeModal';

const PasswordResultModal = ({ data, onResetClick }) => {
  if (!data) {
    return (
      <div className="password-result-modal loading">
        <p>No data available. Please check back later.</p>
      </div>
    );
  }
  const [showModal, setShowModal] = useState(false);
  const { status, vulnerable_layers = [] } = data;

  const strengthFeatures = data["Strength-Analysis"]?.features || {};

  const chartData = Object.entries(strengthFeatures).map(([key, value]) => ({
    x: key.replace(/_/g, " "),
    y: typeof value === "number" ? value : 0
  }));

  return (
    <div className="password-result-modal">
      <h2 className="modal-title">Password Security Analysis</h2>

      {status && vulnerable_layers.length > 0 && (
        <div className="vulnerability-alert">
          <div className="alert-header">
            <h3>🚨 Security Alert: Vulnerabilities Detected</h3>
            <button onClick={onResetClick} className="reset-password-button">
              Reset Password Now
            </button>
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
          <h4>📊 Strength Analysis {data["Strength-Analysis"]?.strength}</h4>
          <div className="strength-metrics">
            <div className="metric">
              <span className="metric-label">Score</span>
              <span className="metric-value">
                {data["Strength-Analysis"]?.features?.score}/10
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
        {/* diagram */}
        <div className="result-card full-width-chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                interval={0}
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
        </div>

        <div className="result-card">
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
                  <button
                    className="genai-result-customize-btn"
                    onClick={() => setShowModal(true)}
                  >
                    Customize
                  </button>
                </div>
              </div>
              {showModal && (
                <CustomizeModal
                  password={data["Strong-Password"]?.result?.strong_password}
                  closeModal={() => setShowModal(false)}
                />
              )}

              <div className="genai-result-section">
                <h3 className="genai-result-header">
                  <span className="genai-result-icon">ℹ️</span>
                  Security Explanation
                </h3>
                <p className="genai-result-content genai-result-explanation">
                  {data["Strong-Password"]?.result?.reasoning_generated_password}
                </p>
              </div>

              <div className="genai-result-section">
                {data["Strong-Password"]?.result?.attacks && (
                  <div className="attack-vulnerabilities">
                    <h3 className="attack-header">Potential Vulnerabilities</h3>
                    <ul className="attack-list">
                      {/* {data["Strong-Password"]?.result?.attacks.map((attack, index) => (
                        <li key={index} className="attack-item">
                          {attack}
                        </li>
                      ))} */}
                      {data["Strong-Password"]?.result?.attacks}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResultModal;
