import { useState } from "react";

import "../styles/CracktimeDetection.css";

export default function CracktimeEstimation() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/cracktime-detection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch crack time estimation");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-right-content">
      <div className="dashboard-content-header">
        <h2>Crack Time Estimation</h2>
        <p>Estimate how long it would take to crack your password</p>
      </div>

      <div className="dashboard-feature-card cracktime-card">
        <form onSubmit={handleSubmit} className="cracktime-form">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Estimating..." : "Check Crack Time"}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {result && (
          <div className="cracktime-result">
            <div
              className={`result-card ${
                result.status ? "vulnerable" : "safe"
              }`}
            >
              <h4>⏱️ Crack Time Estimation</h4>
              <p className="result-statement">
                {result.result_statement}
              </p>

              {/* {data["Crack-Time-Estimation"]. ( */}
              <div className="crack-engine-result">
                {/* MD5 Hash Result */}
                <div
                  className={`cracking-algorithm-result ${
                    result.md5_hash_result?.status ===
                    "cracked"
                      ? "vulnerable"
                      : "safe"
                  }`}
                >
                  <div className="algorithm-header">
                    <span className="algorithm-name">MD5 Hash</span>
                    <span className="algorithm-status">
                      {result.md5_hash_result?.status}
                    </span>
                  </div>
                  <div className="algorithm-details">
                    {result.md5_hash_result
                      ?.cracked_password && (
                      <p className="cracked-password">
                        Cracked Password:{" "}
                        <strong>
                          {
                            result.md5_hash_result
                              .cracked_password
                          }
                        </strong>
                      </p>
                    )}
                    <p className="crack-method">
                      Method:{" "}
                      {result.md5_hash_result?.method}
                    </p>
                    <p className="crack-time">
                      Time:{" "}
                      {result.md5_hash_result
                        ?.crack_time_seconds ? (
                        <>
                          {
                            result.md5_hash_result
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
                  className={`cracking-algorithm-result ${
                    result.sha256_hash_result
                      ?.status === "cracked"
                      ? "vulnerable"
                      : "safe"
                  }`}
                >
                  <div className="algorithm-header">
                    <span className="algorithm-name">SHA256 Hash</span>
                    <span className="algorithm-status">
                      {
                        result.sha256_hash_result
                          ?.status
                      }
                    </span>
                  </div>
                  <div className="algorithm-details">
                    {result.sha256_hash_result
                      ?.cracked_password && (
                      <p className="cracked-password">
                        Cracked Password:{" "}
                        <strong>
                          {
                            result.sha256_hash_result
                              .cracked_password
                          }
                        </strong>
                      </p>
                    )}
                    <p className="crack-method">
                      Method:{" "}
                      {
                        result.sha256_hash_result
                          ?.method
                      }
                    </p>
                    <p className="crack-time">
                      Time:{" "}
                      {result.sha256_hash_result
                        ?.crack_time_seconds ? (
                        <>
                          {
                            result.sha256_hash_result
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
                  result.md5_hash_result
                    ?.detailed_crack_time || {}
                ).map(([key, value]) => (
                  <div className="time-metric" key={key}>
                    <span className="time-scenario">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="time-value">{value} seconds</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
