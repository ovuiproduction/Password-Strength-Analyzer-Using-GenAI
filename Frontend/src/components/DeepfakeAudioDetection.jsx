import { useState } from "react";
import "../styles/DeepfakeAudioDetection.css";

export default function DeepfakeAudioDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is audio type
      if (!file.type.startsWith("audio/")) {
        setError("Please select an audio file");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an audio file first");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("password_audio", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/deepfake-detection", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      console.log(data);
      if (data.status != 200) {
        setError(data.result.error);
      }
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-right-content">
      <div className="dashboard-content-header">
        <h2>Deepfake Voice Password Detection</h2>
        <p>Advanced detection of synthetic voice attacks</p>
      </div>

      <div className="deepfake-detection-card">
        <div className="audio-upload-section">
          <div className="file-input-container">
            <input
              type="file"
              id="audio-upload"
              accept="audio/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="audio-upload" className="file-input-label">
              Choose Audio File
            </label>
            {selectedFile && (
              <span className="file-name">{selectedFile.name}</span>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedFile}
            className="analyze-button"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Audio"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!error && result && (
          <div className="result-section">
            <h3>Analysis Results</h3>
            <div
              className={`result-card ${
                result.is_deepfake ? "deepfake" : "genuine"
              }`}
            >
              <div className="result-status">
                Status:{" "}
                <strong>
                  {result.is_deepfake ? "DEEPFAKE DETECTED" : "GENUINE AUDIO"}
                </strong>
              </div>
              <div className="confidence-level">
                Confidence: {result.confidence}%
                <p className="confidence-explanation">
                  This percentage shows how sure the system is about its
                  decision. A higher value means the audio is more likely fake,
                  while a lower value means it may be real.
                </p>
              </div>

              <div className="result-indicator">
                <div
                  className="confidence-bar"
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
