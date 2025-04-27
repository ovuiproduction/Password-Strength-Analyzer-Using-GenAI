import React, { useState } from 'react';

import "../css/user-req-pass.css"

const CustomizeModal = ({ password, closeModal }) => {
  const [userReq, setUserReq] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserReqChange = (e) => {
    setUserReq(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/user-req-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          user_req: userReq,
        }),
      });
      const result = await response.json();
      console.log(result)
      setGeneratedPassword(result.strong_password); // assuming the response has this field
    } catch (error) {
      console.error('Error generating user request:', error);
    }
    setLoading(false);
  };

  return (
    // <div className="modal-overlay">
    //   <div className="modal">
    //     <h2>Customize Password</h2>
    //     <div className="modal-content">
    //       <textarea
    //         value={userReq}
    //         onChange={handleUserReqChange}
    //         placeholder="Enter your request"
    //       />
    //       <button onClick={handleSubmit} disabled={loading}>
    //         {loading ? 'Loading...' : 'Generate Password'}
    //       </button>
    //       {generatedPassword && (
    //         <div className="generated-password">
    //           <p><strong>Generated Password:</strong> {generatedPassword}</p>
    //         </div>
    //       )}
    //     </div>
    //     <button className="close-modal-btn" onClick={closeModal}>Close</button>
    //   </div>
    // </div>
    <div className="user-req-pass-modal-overlay">
      <div className="user-req-pass-modal">
        <h2>Customize Password</h2>
        <div className="user-req-pass-modal-content">
          <textarea
            value={userReq}
            onChange={handleUserReqChange}
            placeholder="Enter your request"
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Password'}
          </button>
          {generatedPassword && (
            <div className="user-req-pass-generated-password">
              <p><strong>Generated Password:</strong> {generatedPassword}</p>
            </div>
          )}
        </div>
        <button className="user-req-pass-close-modal-btn" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default CustomizeModal;
