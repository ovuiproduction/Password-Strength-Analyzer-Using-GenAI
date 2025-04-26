// import React, { useState } from "react";
// import axios from "axios";
// import "../css/AdminFormOverlay.css"; // CSS for overlay

// const AdminFormOverlay = ({ action, onClose }) => {
//   const [formData, setFormData] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       };

//       if (action === "update_expiry") {
//         await axios.post(
//           "http://localhost:5000/update-expire-time",
//           { new_days: formData.new_days },
//           config
//         );
//       } else if (action === "update_ban_words") {
//         await axios.post(
//           "http://localhost:5000/upadte-ban-word-list",
//           { banned_words: formData.banned_words.split(",") },
//           config
//         );
//       } else if (action === "update_timeout") {
//         await axios.post(
//           "http://localhost:5000/update-time-fallback",
//           { new_time_out: formData.new_time_out },
//           config
//         );
//       } else if (action === "update_constraints") {
//         await axios.post(
//           "http://localhost:5000/update-ps-conditions",
//           { constraints: formData },
//           config
//         );
//       }

//       alert("Update successful!");
//       onClose();
//     } catch (error) {
//       console.error(error);
//       alert("Update failed!");
//     }
//   };

//   const renderFormFields = () => {
//     if (action === "update_expiry") {
//       return (
//         <>
//           <label>New Expiry Days:</label>
//           <input name="new_days" type="number" onChange={handleChange} />
//         </>
//       );
//     }
//     if (action === "update_ban_words") {
//       return (
//         <>
//           <label>Banned Words (comma separated):</label>
//           <input name="banned_words" type="text" onChange={handleChange} />
//         </>
//       );
//     }
//     if (action === "update_timeout") {
//       return (
//         <>
//           <label>New Timeout (seconds):</label>
//           <input name="new_time_out" type="number" onChange={handleChange} />
//         </>
//       );
//     }
//     if (action === "update_constraints") {
//       return (
//         <>
//           <label>Length (Minimum Length):</label>
//           <input name="length" type="number" onChange={handleChange} />

//           <label>Entropy (Minimum Entropy):</label>
//           <input name="entropy" type="number" onChange={handleChange} />

//           <label>Unique Character Ratio:</label>
//           <input
//             name="unique_char_ratio"
//             type="number"
//             step="0.01"
//             onChange={handleChange}
//           />

//           <label>Digit Ratio:</label>
//           <input
//             name="digit_ratio"
//             type="number"
//             step="0.01"
//             onChange={handleChange}
//           />

//           <label>Special Character Ratio:</label>
//           <input
//             name="special_ratio"
//             type="number"
//             step="0.01"
//             onChange={handleChange}
//           />

//           {/* Add more constraints as needed */}
//         </>
//       );
//     }
//   };

//   return (
//     <div className="overlay">
//       <div className="overlay-content">
//         <button className="close-btn" onClick={onClose}>
//           X
//         </button>
//         <h2>Update Settings</h2>
//         <form onSubmit={handleSubmit} className="overlay-form">
//           {renderFormFields()}
//           <button type="submit" className="submit-btn">
//             Submit
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminFormOverlay;


import React, { useState } from "react";
import axios from "axios";
import "../css/AdminFormOverlay.css";

const AdminFormOverlay = ({ action, onClose }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (action === "update_expiry") {
        await axios.post(
          "http://localhost:5000/update-expire-time",
          { new_days: formData.new_days },
          config
        );
      } else if (action === "update_ban_words") {
        await axios.post(
          "http://localhost:5000/upadte-ban-word-list",
          { banned_words: formData.banned_words.split(",") },
          config
        );
      } else if (action === "update_timeout") {
        await axios.post(
          "http://localhost:5000/update-time-fallback",
          { new_time_out: formData.new_time_out },
          config
        );
      } else if (action === "update_constraints") {
        await axios.post(
          "http://localhost:5000/update-ps-conditions",
          { constraints: formData },
          config
        );
      }

      alert("Update successful!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update failed!");
    }
  };

  const renderFormFields = () => {
    if (action === "update_expiry") {
      return (
        <div className="admin-overlay-form-group">
          <label className="admin-overlay-label">New Expiry Days:</label>
          <input className="admin-overlay-input" name="new_days" type="number" onChange={handleChange} />
        </div>
      );
    }
    if (action === "update_ban_words") {
      return (
        <div className="admin-overlay-form-group">
        <label className="admin-overlay-label">Banned Words (comma separated):</label>
        <textarea 
          className="admin-overlay-textarea"
          name="banned_words" 
          onChange={handleChange}
          placeholder="e.g., password,123456,qwerty,admin"
          rows={4}
        />
        <p className="admin-overlay-hint">Separate multiple words with commas</p>
      </div>
      );
    }
    if (action === "update_timeout") {
      return (
        <div className="admin-overlay-form-group">
          <label className="admin-overlay-label">New Timeout (seconds):</label>
          <input className="admin-overlay-input" name="new_time_out" type="number" onChange={handleChange} />
        </div>
      );
    }
    if (action === "update_constraints") {
      return (
        <>
          <div className="admin-overlay-form-group">
            <label className="admin-overlay-label">Length (Minimum Length):</label>
            <input className="admin-overlay-input" name="length" type="number" onChange={handleChange} />
          </div>

          <div className="admin-overlay-form-group">
            <label className="admin-overlay-label">Entropy (Minimum Entropy):</label>
            <input className="admin-overlay-input" name="entropy" type="number" onChange={handleChange} />
          </div>

          <div className="admin-overlay-form-group">
            <label className="admin-overlay-label">Unique Character Ratio:</label>
            <input
              className="admin-overlay-input"
              name="unique_char_ratio"
              type="number"
              step="0.01"
              onChange={handleChange}
            />
          </div>

          <div className="admin-overlay-form-group">
            <label className="admin-overlay-label">Digit Ratio:</label>
            <input
              className="admin-overlay-input"
              name="digit_ratio"
              type="number"
              step="0.01"
              onChange={handleChange}
            />
          </div>

          <div className="admin-overlay-form-group">
            <label className="admin-overlay-label">Special Character Ratio:</label>
            <input
              className="admin-overlay-input"
              name="special_ratio"
              type="number"
              step="0.01"
              onChange={handleChange}
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-overlay-content">
        <button className="admin-overlay-close-btn" onClick={onClose}>
          X
        </button>
        <h2 className="admin-overlay-title">Update Settings</h2>
        <form onSubmit={handleSubmit} className="admin-overlay-form">
          {renderFormFields()}
          <button type="submit" className="admin-overlay-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFormOverlay;
