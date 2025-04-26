import React from "react";
import "../css/StructuredJSONRenderer.css";

// Utility to check if a value is empty
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
};

const StructuredJSONRenderer = ({ data, level = 0 }) => {
  if (isEmpty(data)) return null;

  if (typeof data !== "object") {
    return (
      <span className="json-value">
        {typeof data === "boolean" ? data.toString() : data}
      </span>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="json-object" style={{ marginLeft: level * 16 }}>
        {data
          .filter((item) => !isEmpty(item))
          .map((item, idx) => (
            <div key={idx} className="json-array-item">
              <StructuredJSONRenderer data={item} level={level + 1} />
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="json-object" style={{ marginLeft: level * 16 }}>
      {Object.entries(data)
        .filter(([_, value]) => !isEmpty(value))
        .map(([key, value], idx) => (
          <div key={idx} className="json-item">
            <span className="json-key">{key}:</span>{" "}
            <StructuredJSONRenderer data={value} level={level + 1} />
          </div>
        ))}
    </div>
  );
};

export default StructuredJSONRenderer;
