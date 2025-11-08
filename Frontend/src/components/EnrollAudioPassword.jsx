import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  KeyRound,
  ShieldCheck,
  Loader2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  TextWrap,
} from "lucide-react";

export default function EnrollAudioPassword() {
  const [userId, setUserId] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [support, setSupport] = useState({ mic: false, speech: false });
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState("");
  const [lastResponse, setLastResponse] = useState(null);

  const Transcribe_API_KEY = process.env.REACT_APP_TRANSCRIBE_API_KEY;

  useEffect(() => {
    setUserId(
      sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user"))._id
        : ""
    );
  }, []);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const addLog = (msg, obj) => {
    setLog((l) => [
      `${new Date().toLocaleTimeString()}: ${msg}${
        obj ? ` → ${JSON.stringify(obj)}` : ""
      }`,
      ...l,
    ]);
  };

  useEffect(() => {
    (async () => {
      const micOk = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechOk = !!SpeechRecognition;
      setSupport({ mic: micOk, speech: speechOk });
      if (!micOk) addLog("Microphone not supported in this browser.");
      if (!speechOk)
        addLog(
          "Web Speech API not available. Transcript will need manual input."
        );
      if (speechOk) {
        const rec = new SpeechRecognition();
        rec.lang = language;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e) => {
          const text = e.results?.[0]?.[0]?.transcript || "";
          setTranscript(text);
          addLog("Transcript captured", { text });
        };
        rec.onerror = (e) => addLog("Speech error", e?.error || e);
        recognitionRef.current = rec;
      }
    })();
  }, [language]);

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = language;
  }, [language]);

  // ---- WebM → WAV Conversion ----
  async function webmToWav(webmBlob) {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioCtx = new AudioContext({ sampleRate: 16000 }); // 16 kHz for speaker models
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const offlineCtx = new OfflineAudioContext(
      1, // mono
      audioBuffer.length,
      16000 // 16kHz output
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();
    return bufferToWav(renderedBuffer);
  }

  function bufferToWav(buffer) {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const samples = buffer.getChannelData(0); // mono
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const bufferLength = 44 + samples.length * bytesPerSample;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    let offset = 0;
    function writeString(s) {
      for (let i = 0; i < s.length; i++)
        view.setUint8(offset++, s.charCodeAt(i));
    }

    writeString("RIFF");
    view.setUint32(offset, 36 + samples.length * bytesPerSample, true);
    offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, format, true);
    offset += 2;
    view.setUint16(offset, numChannels, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * blockAlign, true);
    offset += 4;
    view.setUint16(offset, blockAlign, true);
    offset += 2;
    view.setUint16(offset, bitDepth, true);
    offset += 2;
    writeString("data");
    view.setUint32(offset, samples.length * bytesPerSample, true);
    offset += 4;

    // float32 → int16 PCM
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  async function startRecording() {
    try {
      if (!support.mic) throw new Error("Mic not supported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mr = new MediaRecorder(stream, { mimeType: mime });

      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: mr.mimeType });

        addLog("Converting WebM → WAV...");
        const wavBlob = await webmToWav(webmBlob); // ✅ convert in browser

        setRecordedBlob(wavBlob);
        addLog("Recording ready", { size: wavBlob.size, type: wavBlob.type });
        setRecording(false);
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordedBlob(null);
      addLog("Recording started");

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }
    } catch (e) {
      addLog("Failed to start recording", e?.message || e);
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      addLog("Recording stopped");
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  }

  async function sendTo(url, busyAction) {
    const storedUser = sessionStorage.getItem("user");
    let userId = "";
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userId =
        typeof user._id === "object" && user._id.$oid
          ? user._id.$oid
          : String(user._id || "");
    }

    if (!userId.trim()) {
      addLog("User not found");
      return;
    }

    if (!recordedBlob) {
      addLog("Record audio first");
      return;
    }

    if (!transcript.trim()) {
      addLog("Transcript is empty");
      return;
    }

    setBusy(busyAction);
    try {
      const fd = new FormData();
      fd.append("user_id", userId.trim());
      fd.append("audio", recordedBlob, "audio.wav"); // ✅ send WAV now
      fd.append("transcript", transcript || "");

      const res = await fetch(url, { method: "POST", body: fd });
      const json = await res.json();
      if (busyAction === "verify") {
        setLastResponse(json);
      }
      addLog(`${url} response`, json);
    } catch (e) {
      addLog("Request error", e?.message || e);
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || !support.mic;

  const styles = {
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      marginBottom: "24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#666",
    },
    grid: {
      display: "grid",
      gap: "16px",
      gridTemplateColumns: "1fr",
    },
    gridMd: {
      display: "grid",
      gap: "16px",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "500",
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      fontSize: "14px",
    },
    card: {
      border: "1px solid #ddd",
      borderRadius: "16px",
      padding: "16px",
      position: "relative",
    },
    card_content: {
      border: "1px solid #ddd",
      borderRadius: "16px",
      padding: "16px",
    },
    card_overlay: {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(3px)",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "12px",
      fontWeight: "500",
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "16px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
    },
    buttonBlack: {
      backgroundColor: "#000",
      color: "#fff",
    },
    buttonRed: {
      backgroundColor: "#dc2626",
      color: "#fff",
    },
    buttonBlue: {
      backgroundColor: "#2563eb",
      color: "#fff",
    },
    buttonGreen: {
      backgroundColor: "#059669",
      color: "#fff",
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    textarea: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      fontSize: "14px",
      fontFamily: "inherit",
      resize: "vertical",
    },
    pre: {
      fontSize: "12px",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      backgroundColor: "#f9f9f9",
      padding: "12px",
      borderRadius: "8px",
      maxHeight: "200px",
      overflow: "auto",
    },
    logItem: {
      fontSize: "12px",
      paddingBottom: "8px",
      borderBottom: "1px solid #eee",
      TextWrap: "wrap",
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
    },
    smallText: {
      fontSize: "12px",
      color: "#666",
    },
    mt: {
      position: "relative",
      marginTop: "16px",
    },
    transcript_overlay: {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(2px)",
    },
    resultBox: {
      background: "#ffffff",
      border: "1px solid #e0e0e0",
      padding: "16px",
      borderRadius: "10px",
      width: "100%",
      maxWidth: "380px",
      fontFamily: "monospace",
      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
      marginTop: "10px",
    },
    resultTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "10px",
      textAlign: "center",
    },
    resultRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px dashed #ddd",
      fontSize: "13px",
    },
    resultFinal: {
      fontWeight: "bold",
      textAlign: "center",
      marginTop: "12px",
      fontSize: "15px",
      color: "#0d6efd",
    },
  };

  const uploadToAssemblyAI = async (file) => {
    const apiKey = Transcribe_API_KEY; // replace
    const baseUrl = "https://api.assemblyai.com/v2/upload";

    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    let uploadUrl = "";
    let start = 0;

    while (start < file.size) {
      const chunk = file.slice(start, start + chunkSize);
      start += chunkSize;

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { authorization: apiKey },
        body: chunk,
      });

      const data = await res.json();
      uploadUrl = data.upload_url; // AssemblyAI returns one URL per final chunk only
    }

    return uploadUrl;
  };

  const transcribeAudioAssemblyAI = async (audioUrl) => {
    const apiKey = Transcribe_API_KEY;
    const baseUrl = "https://api.assemblyai.com/v2/transcript";

    // Start transcription job
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ audio_url: audioUrl }),
    });

    const { id } = await res.json();

    // Poll until completed
    while (true) {
      const poll = await fetch(`${baseUrl}/${id}`, {
        headers: { authorization: apiKey },
      });

      const result = await poll.json();

      if (result.status === "completed") {
        return result.text;
      }
      if (result.status === "error") {
        throw new Error(result.error);
      }

      await new Promise((r) => setTimeout(r, 3000)); // wait
    }
  };

  const transcriptAudioFile = async (file) => {
    setTranscript("");
    addLog("Audio file selected", { name: file.name });
    setBusy("transcribing");
    // Upload audio to AssemblyAI & get URL
    const audioUrl = await uploadToAssemblyAI(file);

    // Transcribe it
    const text = await transcribeAudioAssemblyAI(audioUrl);
    setTranscript(text);
    setBusy("");
    addLog("Transcription Success", { transcript: text });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    transcriptAudioFile(file);
    if (file) {
      addLog("Audio file selected", { name: file.name, size: file.size });
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const blob = new Blob([arrayBuffer], { type: file.type });
        setRecordedBlob(blob);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <KeyRound size={24} /> Audio Password — Enroll & Verify
        </h1>
        <p style={styles.subtitle}>
          Records your voice, transcribes locally (Web Speech API), and sends to
          backend for embedding storage or verification.
        </p>
      </div>

      <div style={styles.gridMd}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Language</label>
          <select
            style={styles.input}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="mr-IN">Marathi (India)</option>
            <option value="hi-IN">Hindi (India)</option>
          </select>
        </div>
      </div>

      <div style={{ ...styles.gridMd, marginTop: "24px" }}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <ShieldCheck size={20} /> Recorder
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                style={{
                  ...styles.button,
                  ...styles.buttonBlack,
                  ...(disabled ? styles.buttonDisabled : {}),
                }}
              >
                <Mic size={16} /> Start
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{ ...styles.button, ...styles.buttonRed }}
              >
                <Square size={16} /> Stop
              </button>
            )}

            <span style={styles.smallText}>
              {support.speech
                ? "Web Speech API ready"
                : "Speech API not available"}
            </span>
          </div>

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

          <div style={styles.mt}>
            {busy == "transcribing" && (
              <div style={styles.transcript_overlay}>
                <div>
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <p style={styles.smallText}>
                  Please wait while we transcribes...
                </p>
              </div>
            )}
            <label style={styles.label}>Transcript</label>
            <textarea
              style={{ ...styles.textarea, marginTop: "8px" }}
              placeholder={
                support.speech
                  ? "Will auto-fill after you speak..."
                  : "Type what you spoke..."
              }
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Upload size={20} /> Actions
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              onClick={() =>
                sendTo("http://localhost:5000/update-audio-password", "enroll")
              }
              disabled={
                disabled ||
                !recordedBlob ||
                !userId ||
                transcript.trim().length === 0
              }
              style={{
                ...styles.button,
                ...styles.buttonBlue,
                ...(disabled || !recordedBlob || !userId
                  ? styles.buttonDisabled
                  : {}),
              }}
            >
              {busy == "enroll" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}{" "}
              Enroll / Update
            </button>

            <button
              onClick={() =>
                sendTo("http://localhost:5000/verify-audio-password", "verify")
              }
              disabled={
                disabled ||
                !recordedBlob ||
                !userId ||
                transcript.trim().length === 0
              }
              style={{
                ...styles.button,
                ...styles.buttonGreen,
                ...(disabled || !recordedBlob || !userId
                  ? styles.buttonDisabled
                  : {}),
              }}
            >
              {busy == "verify" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}{" "}
              Verify (Login)
            </button>
          </div>

          {!recordedBlob && (
            <p style={{ ...styles.smallText, marginTop: "12px" }}>
              Record something first to enable actions.
            </p>
          )}

          {busy === "verify" && (
            <div style={styles.card_overlay}>
              <div style={styles.card_content}>
                <div style={styles.cardHeader}>
                  <Loader2 size={20} className="animate-spin" /> Verifying...
                </div>
                <p style={styles.smallText}>
                  Your audio password is being verified <br />
                  1. Speaker similarity check <br />
                  2. Transcript text match <br />
                  3. Deepfake audio detection
                </p>
                <p style={styles.smallText}>Please wait while we verify...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...styles.gridMd, marginTop: "24px" }}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <CheckCircle2 size={20} style={{ color: "#059669" }} /> Last
            Response
          </div>
          {lastResponse && (
            <div style={styles.resultBox}>
              <h4 style={styles.resultTitle}>Verification Result</h4>

              <div style={styles.resultRow}>
                <span>Similarity Score:</span>
                <span>{lastResponse?.similarity_score?.toFixed(3)}</span>
              </div>

              <div style={styles.resultRow}>
                <span>Speaker Match:</span>
                <span>{lastResponse?.speaker_match}</span>
              </div>

              <div style={styles.resultRow}>
                <span>Text Match:</span>
                <span>{lastResponse?.text_match ? "✅ Yes" : "❌ No"}</span>
              </div>

              <div style={styles.resultRow}>
                <span>Deepfake:</span>
                <span>{lastResponse?.deepfake_check}</span>
              </div>

              <div style={styles.resultRow}>
                <span>Deepfake Confidence:</span>
                <span>{lastResponse?.deepfake_confidence}</span>
              </div>

              <div style={styles.resultFinal}>
                {lastResponse?.authenticated
                  ? "✅ Verified"
                  : "❌ Authentication Failed"}
              </div>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <AlertTriangle size={20} style={{ color: "#666" }} /> Activity Log
          </div>
          <div
            style={{
              fontSize: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {log.length === 0 ? (
              <p style={{ color: "#999" }}>No activity yet.</p>
            ) : (
              log.map((l, i) => (
                <div key={i} style={styles.logItem}>
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
