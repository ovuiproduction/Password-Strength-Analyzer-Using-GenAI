import { useState, useRef } from "react";
import "../styles/DeepfakeAudioDetection.css";

export default function DeepfakeAudioDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Reset chunks
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType,
        });

        const file = new File([audioBlob], "recorded_audio.webm", {
          type: recorder.mimeType,
        });

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setSelectedFile(file);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setError("");
      setResult(null);
      setAudioURL(null);
    } catch (err) {
      setError("Microphone access denied. Please allow mic permissions.");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        setError("Please select an audio file");
        setSelectedFile(null);
        return;
      }

      // Clean up previous audio URL
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }

      setSelectedFile(file);
      setAudioURL(URL.createObjectURL(file));
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
      if (data.status !== 200) {
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
          </div>

          <div className="recording-buttons">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="record-button start-recording"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="record-button stop-recording"
              >
                ⏹ Stop Recording
              </button>
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

        {audioURL && (
          <>
          <div className="bg-gray-700 rounded-lg p-4">
            <audio controls src={audioURL} className="w-full" />
          </div>
          <span className="file-name">{selectedFile.name}</span>
          </>
        )}

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
                This percentage indicates how likely the audio is synthetic. A higher value
                suggests the audio is more likely to be fake.
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
