import React, { useState,useEffect } from 'react';
import axios from 'axios';
import '../css/ResetPasswordModal.css';

import { toast } from 'react-toastify';

const ResetPasswordModal = ({ show, onClose,onPasswordReset }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [show]);
 
  const handleReset = async () => {
    setError('');
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/reset-password',
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if(res.status == 200){
        onPasswordReset(newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success("Password Reset successfully.");
        onClose();
      }
      else{
        setError(res.data.error);
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Reset Password</h2>
        {error && <div className="error-msg">{error}</div>}
       
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="reset-btn" onClick={handleReset}>Update Password</button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
