import React, { useState } from 'react';
import axios from 'axios';
import '../css/AuthModal.css';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';


const AuthModal = ({onClose}) => {
  const [showModal, setShowModal] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  const toggleModal = () => setShowModal(!showModal);
  const switchForm = () => setIsLogin(!isLogin);

  const handleClose = () => {
    onClose();
  };

  return (
    <>
    <div className='auth-container'>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={handleClose}>&times;</span>
            {isLogin ? (
              <LoginForm switchForm={switchForm} closeModal={toggleModal} />
            ) : (
              <SignupForm switchForm={switchForm} closeModal={toggleModal} />
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

const LoginForm = ({ switchForm, closeModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleOnLogin = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );      
      localStorage.setItem('token', res.data.token);
      // const { password_analysis_status, password_analysis } = res.data;
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful!");
      closeModal();
      navigate('/dashboard', { state: { user_password: password,user_email:email } });
      // navigate('/dashboard', { state: { user_password: password,password_analysis_status:password_analysis_status,password_analysis:password_analysis } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };



  return (
    <div className="form-container">
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="submit-btn" onClick={handleOnLogin}>Login</button>
      <p className="switch-link">Don't have an account? <span onClick={switchForm}>Signup</span></p>
    </div>
  );
};

const SignupForm = ({ switchForm, closeModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOnSignup = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/signup',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (res.status === 201 && res.data.token) {
        localStorage.setItem('token', res.data.token);
        toast.success("Signup successful! Please login.");
        switchForm();
      } else {
        toast.warning('Signup succeeded but no token returned.');
      }
  
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    }
  };
  

  
  return (
    <div className="form-container">
      <h2>Signup</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="submit-btn" onClick={handleOnSignup}>Signup</button>
      <p className="switch-link">Already have an account? <span onClick={switchForm}>Login</span></p>
    </div>
  );
};

export default AuthModal;
