import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaShieldAlt,
  FaCogs,
  FaKey,
  FaLockOpen,
  FaMagic,
} from "react-icons/fa";
import { MdDownload } from "react-icons/md";

import jsPDF from "jspdf";

import StructuredJSONRenderer from "../components/StructuredJSONRenderer";

import "../css/AnalysisPage.css";

const layers = [
  {
    name: "Leaked Password Detection",
    endpoint: "/leaked-password-detection",
    icon: <FaShieldAlt />,
  },
  {
    name: "Pattern & Ban Word Detection",
    endpoint: "/pattern-analysis",
    icon: <FaCogs />,
  },
  {
    name: "Composition & Entropy Analysis",
    endpoint: "/composition-analysis",
    icon: <FaKey />,
  },
  {
    name: "Crack Time Estimation",
    endpoint: "/crack-password",
    icon: <FaLockOpen />,
  },
  {
    name: "Strong Password Generator",
    endpoint: "/generate-strong-password",
    icon: <FaMagic />,
  },
];

const AnalysisPage = () => {
  const location = useLocation();
  const [password] = useState(location.state?.password || "");
  const [layerStatus, setLayerStatus] = useState(
    Array(layers.length).fill("pending")
  );
  const [combinedResults, setCombinedResults] = useState([]);

  useEffect(() => {
    if (!password) return;

    const runLayer = async (index) => {
      const layer = layers[index];

      // Set this layer to 'processing'
      setLayerStatus((prev) => {
        const updated = [...prev];
        updated[index] = "processing";
        return updated;
      });

      try {
        const res = await fetch(`http://localhost:5000${layer.endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const result = await res.json();

        // Set this layer to 'done'
        setLayerStatus((prev) => {
          const updated = [...prev];
          updated[index] = "done";
          return updated;
        });

        setCombinedResults((prev) => [...prev, { title: layer.name, result }]);

        // Run the next layer if any
        if (index + 1 < layers.length) {
          runLayer(index + 1);
        }
      } catch (err) {
        console.error(`Layer ${index + 1} failed`, err);
      }
    };

    runLayer(0);
  }, [password]);

  const getColor = (status, i) => {
    if (status === "pending") return "analysis-bg-pending";
    if (status === "processing") return "analysis-bg-processing";
    if (status === "done") {
      return i === layers.length - 1
        ? "analysis-bg-final-done"
        : "analysis-bg-intermediate-done"; // New class for intermediate done
    }
  };

  const getConnectorClass = (index) => {
    // Animate connector between current and next processing
    if (
      layerStatus[index] === "done" &&
      layerStatus[index + 1] === "processing"
    ) {
      return "animate-connector";
    }

    // Mark all previous ones as done
    if (layerStatus[index] === "done") {
      return "connector-done";
    }

    return "connector-pending";
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let cursorY = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CyberPass Analyzer Report", 105, cursorY, { align: "center" });
    cursorY += 10;

    const renderStructuredJSON = (data, level = 0) => {
      if (
        data === null ||
        data === undefined ||
        (typeof data === "string" && data.trim() === "") ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === "object" && Object.keys(data).length === 0)
      ) {
        return;
      }

      const indent = 10 + level * 10;

      if (Array.isArray(data)) {
        data.forEach((item) => renderStructuredJSON(item, level + 1));
      } else if (typeof data === "object") {
        Object.entries(data).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            (typeof value !== "string" || value.trim() !== "") &&
            (typeof value !== "object" || Object.keys(value).length > 0)
          ) {
            if (cursorY > 280) {
              doc.addPage();
              cursorY = 20;
            }

            // If it's a nested object or array, print just the key and go deeper
            if (typeof value === "object") {
              doc.setFont("helvetica", "bold");
              doc.text(`${"".padStart(indent, " ")}${key}:`, 10, cursorY);
              cursorY += 6;
              renderStructuredJSON(value, level + 1);
            } else {
              // Print key: value inline
              doc.setFont("helvetica", "normal");
              const cleanValue =
                typeof value === "boolean" ? value.toString() : value;
              const fullText = `${key}: ${cleanValue}`;
              const wrappedText = doc.splitTextToSize(fullText, 180 - indent); // 180 = usable width

              wrappedText.forEach((line) => {
                if (cursorY > 280) {
                  doc.addPage();
                  cursorY = 20;
                }
                doc.text(line, indent, cursorY);
                cursorY += 6;
              });
            }
          }
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(`${"".padStart(indent, " ")}${data}`, 10, cursorY);
        cursorY += 6;
      }
    };

    combinedResults.forEach((layer, i) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      if (cursorY > 280) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(`Layer ${i + 1}: ${layer.title}`, 10, cursorY);
      cursorY += 8;
      doc.setFont("helvetica", "normal");

      renderStructuredJSON(layer.result, 0);
      cursorY += 6;
    });

    doc.save("password_analysis_report.pdf");
  };


  return (
    <div className="analysis-container">
      <h1 className="analysis-title">Password Strength Analyzer</h1>
      <div className="analysis-shield-row">
        {layers.map((layer, i) => (
          <React.Fragment key={i}>
            <div
              className={`analysis-shield ${getColor(layerStatus[i])}`}
              title={layer.name}
            >
              <div className="cyber-ring" />
              <div className="cyber-glow" />
              <div className="analysis-icon">{layer.icon}</div>
              <p className="analysis-layer-name">{layer.name}</p>
            </div>
            {i !== layers.length - 1 && (
              <div className={`analysis-line ${getConnectorClass(i)}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="analysis-download-btn">
        <button
          onClick={downloadPDF}
          disabled={!layerStatus.every((status) => status === "done")}
        >
          <MdDownload /> Download PDF Report
        </button>
      </div>

      <div className="original-password--header-block">
        <h1 className="password-heading">Analyzing Password: {password}</h1>
      </div>
      <div className="analysis-results-panel">
        {combinedResults.map((layer, i) => (
          <div key={i} className="analysis-layer-result">
            <h3>{`Layer ${i + 1}: ${layer.title}`}</h3>
            <StructuredJSONRenderer data={layer.result} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPage;
