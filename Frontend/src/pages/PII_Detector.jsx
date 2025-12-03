import React, { useState } from "react";
import zxcvbn from "zxcvbn";
import "../css/PIIAnalyzer.css";

// ==================== CONSTANTS ====================
const LEETSPEAK_MAP = {
  4: "a", "@": "a", 8: "b", 3: "e", 6: "g",
  9: "g", 1: "i", 0: "o", 5: "s", 7: "t",
  2: "z", $: "s", "!": "i", "#": "h", "†": "t", "√": "v"
};

const INITIAL_FORM_DATA = {
  password: "",
  Gender: "",
  Title: "",
  GivenName: "",
  MiddleInitial: "",
  Surname: "",
  StreetAddress: "",
  City: "",
  CountryFull: "",
  TelephoneNumber: "",
  MothersMaiden: "",
  Birthday: "",
  TropicalZodiac: "",
  Vehicle: "",
  VehicleColor: ""
};

const FORM_GROUPS = [
  {
    title: "Basic Information",
    fields: [
      { name: "Gender", label: "Gender", placeholder: "" },
      { name: "Title", label: "Title", placeholder: "" },
      { name: "GivenName", label: "Given Name", placeholder: "" },
      { name: "MiddleInitial", label: "Middle Initial", placeholder: "" },
      { name: "Surname", label: "Surname", placeholder: "" }
    ]
  },
  {
    title: "Location Information",
    fields: [
      { name: "StreetAddress", label: "Street Address", placeholder: "" },
      { name: "City", label: "City", placeholder: "" },
      { name: "CountryFull", label: "Country", placeholder: "" }
    ]
  },
  {
    title: "Contact & Family",
    fields: [
      { name: "TelephoneNumber", label: "Telephone Number", placeholder: "" },
      { name: "MothersMaiden", label: "Mother's Maiden Name", placeholder: "" }
    ]
  },
  {
    title: "Personal Details",
    fields: [
      { name: "Birthday", label: "Birthday (MM/DD/YYYY)", placeholder: "05/15/1984" },
      { name: "TropicalZodiac", label: "Tropical Zodiac", placeholder: "" }
    ]
  },
  {
    title: "Vehicle Information",
    fields: [
      { name: "Vehicle", label: "Vehicle", placeholder: "" },
      { name: "VehicleColor", label: "Vehicle Color", placeholder: "" }
    ]
  }
];

// ==================== UTILITY FUNCTIONS ====================
const normalizeText = (text) => {
  if (!text) return "";
  return [...text]
    .map((c) => (c.match(/[A-Za-z]/) ? c.toLowerCase() : c))
    .join("");
};

const reverseLeetspeak = (password) => {
  return [...password].map((c) => LEETSPEAK_MAP[c] || c).join("");
};

const generateSubstrings = (text, minLen = 2) => {
  const set = new Set();
  for (let i = 0; i < text.length; i++) {
    for (let j = i + minLen; j <= text.length; j++) {
      set.add(text.slice(i, j));
    }
  }
  return set;
};

const processPIIData = (piiData) => {
  let piiTerms = [];

  Object.entries(piiData).forEach(([key, value]) => {
    if (!value) return;

    const normalized = normalizeText(value);

    // Birthday special handling
    if (key === "Birthday") {
      let dateStr = normalized;
      ["-", "/", " "].forEach((sep) => {
        if (dateStr.includes(sep)) {
          const parts = dateStr.split(sep);
          piiTerms.push(...parts);
          piiTerms.push(dateStr.replaceAll(sep, ""));
        }
      });
      return;
    }

    // Country initials + words
    if (key === "CountryFull") {
      const words = normalized.split(" ");
      piiTerms.push(...words);
      const initials = words.map((w) => w[0]).join("");
      piiTerms.push(initials);
      return;
    }

    // Default handling
    piiTerms.push(normalized);
    piiTerms.push(...normalized.split(" "));
  });

  return [...new Set(piiTerms.filter(Boolean))];
};

// ==================== MAIN COMPONENT ====================
const PIIAnalyzer = () => {

  // ==================== STATE ====================
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================== HANDLERS ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setResult(null);
  };

  // ==================== ANALYSIS LOGIC ====================
  const analyzePasswordPII = () => {
    try {
      const { password, ...pii } = formData;

      if (!password.trim()) {
        return { 
          error: "Password is required",
          status: "error"
        };
      }

      const piiTerms = processPIIData(pii);
      const normalized = normalizeText(password);
      const reverseLeet = reverseLeetspeak(normalized);

      const substrings = new Set([
        ...generateSubstrings(normalized),
        ...generateSubstrings(reverseLeet),
      ]);

      let matchedPatterns = new Set();

      substrings.forEach((sub) => {
        let res = zxcvbn(sub, piiTerms);

        res.sequence?.forEach((match) => {
          if (match.matched_word && piiTerms.includes(match.matched_word)) {
            matchedPatterns.add(match.matched_word);
          }
        });

        if (piiTerms.includes(sub)) matchedPatterns.add(sub);
      });

      const status = matchedPatterns.size > 0 ? "matched" : "not-matched";
      
      return {
        status,
        matched_patterns: [...matchedPatterns].sort(),
        password_variants: {
          normalized,
          reverse_leet: reverseLeet,
          substrings_checked: substrings.size,
          password_length: password.length
        },
        statistics: {
          pii_terms_count: piiTerms.length,
          matched_count: matchedPatterns.size,
          match_percentage: piiTerms.length > 0 
            ? ((matchedPatterns.size / piiTerms.length) * 100).toFixed(1)
            : "0.0"
        }
      };
    } catch (err) {
      return { 
        error: `Analysis error: ${err.message}`,
        status: "error"
      };
    }
  };

  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const analysis = analyzePasswordPII();
      setResult(analysis);
      setLoading(false);
    }, 300);
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderFormField = (field) => (
    <div className="pii-analyzer-form-group" key={field.name}>
      <label className="pii-analyzer-label">{field.label}</label>
      <input
        type="text"
        name={field.name}
        value={formData[field.name]}
        onChange={handleChange}
        className="pii-analyzer-input"
        placeholder={field.placeholder}
        disabled={loading}
      />
    </div>
  );

  const renderFormGroup = (group) => (
    <div className="pii-analyzer-form-section" key={group.title}>
      <h3 className="pii-analyzer-group-title">{group.title}</h3>
      <div className="pii-analyzer-form-grid">
        {group.fields.map(renderFormField)}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="pii-analyzer-overlay">
      <div className="pii-analyzer-results">
        <button
          className="pii-analyzer-close-button"
          onClick={() => setResult(null)}
          aria-label="Close results"
        >
          ×
        </button>
        
        <h2>Analysis Results</h2>

        {result.error ? (
          <div className="pii-analyzer-error-card">
            <h3>Error</h3>
            <p>{result.error}</p>
          </div>
        ) : (
          <>
            {/* Status Summary */}
            <div className={`pii-analyzer-status ${result.status}`}>
              <h3>Status: {result.status === "matched" ? "⚠️ PII Detected" : "✅ No PII Detected"}</h3>
              <p>Password security check completed</p>
            </div>

            {/* Statistics */}
            <div className="pii-analyzer-statistics">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">PII Terms</span>
                  <span className="stat-value">{result.statistics.pii_terms_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Matched</span>
                  <span className="stat-value">{result.statistics.matched_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Match %</span>
                  <span className="stat-value">{result.statistics.match_percentage}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Password Length</span>
                  <span className="stat-value">{result.password_variants.password_length}</span>
                </div>
              </div>
            </div>

            {/* Matched Patterns */}
            {result.matched_patterns.length > 0 && (
              <div className="pii-analyzer-matches">
                <h3>Detected PII Patterns</h3>
                <div className="patterns-grid">
                  {result.matched_patterns.map((pattern, index) => (
                    <div className="pattern-item" key={index}>
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Analysis */}
            <div className="pii-analyzer-password-analysis">
              <h3>Password Analysis</h3>
              <div className="analysis-details">
                <div className="detail-item">
                  <span className="detail-label">Original Password:</span>
                  <code className="detail-value password-masked">
                    {formData.password.replace(/./g, "•")}
                  </code>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Normalized:</span>
                  <code className="detail-value">{result.password_variants.normalized}</code>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Leetspeak Decoded:</span>
                  <code className="detail-value">{result.password_variants.reverse_leet}</code>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Substrings Analyzed:</span>
                  <span className="detail-value">{result.password_variants.substrings_checked}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="pii-analyzer-recommendations">
              <h3>Recommendations</h3>
              <ul>
                {result.status === "matched" ? (
                  <>
                    <li>Remove personal information from your password</li>
                    <li>Use a mix of random words instead of personal data</li>
                    <li>Consider using a password manager for stronger passwords</li>
                    <li>Avoid using names, dates, or identifiable information</li>
                  </>
                ) : (
                  <>
                    <li>Your password appears to be free of personal information</li>
                    <li>Ensure you're using a strong, unique password</li>
                    <li>Consider enabling two-factor authentication</li>
                    <li>Regularly update your passwords for optimal security</li>
                  </>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="pii-analyzer-container">
      <div className="pii-analyzer-header">
        <h1 className="pii-analyzer-title">Password PII Analyzer</h1>
        <p className="pii-analyzer-subtitle">
          Check if your password contains personal identifiable information
        </p>
        
      </div>

      <div className="pii-analyzer-content">
        <form onSubmit={handleSubmit} className="pii-analyzer-form">
          {/* Password Section */}
          <div className="pii-analyzer-form-section">
            <h2 className="pii-analyzer-section-title">Password Analysis</h2>
            <div className="password-input-group">
              <div className="pii-analyzer-form-group password-group">
                <label className="pii-analyzer-label">Password to Analyze</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pii-analyzer-input password-input"
                  placeholder="Enter your password here"
                  required
                  disabled={loading}
                />
                <div className="password-hint">
                  The password will be analyzed for PII patterns
                </div>
              </div>
            </div>
          </div>

          {/* PII Information Sections */}
          <div className="pii-analyzer-form-section">
            <h2 className="pii-analyzer-section-title">Personal Information</h2>
            <div className="form-sections-container">
              {FORM_GROUPS.map(renderFormGroup)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pii-analyzer-actions">
            <button
              type="submit"
              disabled={loading || !formData.password.trim()}
              className="pii-analyzer-button submit-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Analyze Password"
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="pii-analyzer-button reset-button"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Results Overlay */}
      {renderResults()}
    </div>
  );
};

export default PIIAnalyzer;