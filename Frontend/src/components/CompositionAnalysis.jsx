import React, { useEffect, useState } from "react";
import "../styles/CompositionAnalysis.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CompositionAnalysis() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Simple labels for non-technical users
  const featureLabels = {
    length: "Password Length",
    entropy: "Password Strength",
    shannon_entropy: "Complexity Level",
    num_unique_chars: "Unique Characters",
    unique_char_ratio: "Character Variety",
    has_upper_lower: "Uppercase & Lowercase",
    digit_ratio: "Numbers Used",
    special_ratio: "Special Symbols",
    upper_case_ratio: "Uppercase Letters",
    lower_case_ratio: "Lowercase Letters",
    num_repeated_chars: "Repeated Characters",
    dictionary_match_count: "Common Words"
  };

  // Simple explanations for each feature
  const featureExplanations = {
    length: "Longer passwords are harder to guess",
    entropy: "Overall password strength score",
    shannon_entropy: "How unpredictable your password is",
    num_unique_chars: "How many different characters you used",
    unique_char_ratio: "Percentage of unique characters",
    has_upper_lower: "Mix of capital and small letters",
    digit_ratio: "How many numbers are in your password",
    special_ratio: "Use of symbols like !@#$%",
    upper_case_ratio: "Amount of capital letters (A-Z)",
    lower_case_ratio: "Amount of small letters (a-z)",
    num_repeated_chars: "Characters used more than once",
    dictionary_match_count: "Matches with common passwords"
  };

  // Convert strength score to simple terms
  const getStrengthLabel = (score) => {
    if (score >= 9) return "Very Strong 💪";
    if (score >= 7) return "Strong 👍";
    if (score >= 5) return "Good ✅";
    if (score >= 3) return "Fair ⚠️";
    return "Weak 🚨";
  };

  // Convert boolean values to simple terms
  const formatValue = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes ✅' : 'No ❌';
    }
    if (typeof value === 'number') {
      if (key.includes('ratio')) {
        return `${(value * 100).toFixed(0)}%`;
      }
      return value.toFixed(1);
    }
    return value;
  };

  // whenever result updates → build chart data
  useEffect(() => {
    if (result) {
      const strengthFeatures = result.features || {};
      const data = Object.entries(strengthFeatures)
        .filter(([key]) => key !== 'score') // Exclude score from chart
        .map(([key, value]) => ({
          x: featureLabels[key] || key,
          y: typeof value === "number" ? value : 0,
          explanation: featureExplanations[key] || ""
        }));
      setChartData(data);
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!password) {
      setError("Please enter a password to analyze.");
      return;
    }

    if (password.length < 4) {
      setError("Please enter a longer password for analysis.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/composition-detection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) throw new Error("Server error. Please try again.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-right-content">
      <div className="dashboard-content-header">
        <h2>Password Composition Analysis</h2>
        <p>See how strong your password is and get improvement tips</p>
      </div>

      <div className="composition-container">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="composition-form">
          <input
            type="password"
            placeholder="Enter your password to check its strength..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="composition-input"
          />
          <button type="submit" className="composition-btn" disabled={loading}>
            {loading ? "🔍 Analyzing..." : "Check Password Strength"}
          </button>
        </form>

        {error && <p className="composition-error">{error}</p>}

        {/* Results */}
        {result && (
          <div className="composition-results">
            {password && <>Given Password : {password}</>}
            <div className={`result-card overall-strength ${result.features?.score >= 7 ? "strong" : result.features?.score >= 5 ? "moderate" : "weak"}`}>
              <div className="strength-header">
                <h3>Password Strength Summary</h3>
                <div className="strength-badge">
                  {getStrengthLabel(result.features?.score || 0)}
                </div>
              </div>
              
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-value">{result.features?.score || 0}/10</span>
                </div>
                <p className="score-feedback">
                  {result.features?.score >= 9 
                    ? "Excellent! Your password is very secure." 
                    : result.features?.score >= 7 
                    ? "Good job! Your password is strong."
                    : result.features?.score >= 5
                    ? "Your password is okay, but could be stronger."
                    : "Your password needs improvement for better security."}
                </p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="result-card detailed-analysis">
              <h3>📋 Detailed Analysis</h3>
              <p className="analysis-subtitle">Here's how your password measures up:</p>
              
              <div className="analysis-grid">
                {Object.entries(result.features || {})
                  .filter(([key]) => key !== 'score')
                  .map(([key, value]) => (
                  <div className="analysis-item" key={key}>
                    <div className="item-header">
                      <span className="item-label">{featureLabels[key] || key}</span>
                      <span className="item-value">{formatValue(key, value)}</span>
                    </div>
                    <p className="item-explanation">
                      {featureExplanations[key] || ""}
                    </p>
                    {typeof value === 'number' && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min(value * 10, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Chart */}
            {chartData.length > 0 && (
              <div className="result-card chart-container">
                <h3>📈 Password Strength Breakdown</h3>
                <p className="chart-subtitle">Visual overview of different password factors</p>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="x"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, 'Score']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `${label} - ${payload[0].payload.explanation}`;
                        }
                        return label;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#2563eb" }}
                      activeDot={{ r: 8, fill: "#1d4ed8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Tips Card */}
            <div className="result-card tips-card">
              <h3>💡 Tips to Improve Your Password</h3>
              <ul className="tips-list">
                <li>Use at least 12 characters</li>
                <li>Mix uppercase and lowercase letters</li>
                <li>Include numbers and symbols</li>
                <li>Avoid common words or patterns</li>
                <li>Don't reuse passwords across sites</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}