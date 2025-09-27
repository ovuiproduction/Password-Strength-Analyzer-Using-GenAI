import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CoverPage from './pages/CoverPage';
import Dashboard from "./pages/Dashboard";
import AnalysisPage from "./pages/AnalysisPage";
import NotFound from "./pages/NotFound"

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminPanel from './pages/AdminPanel';
import BulkPassCheck from './pages/BulkPassCheck';
import PasswordAnalysis from "./pages/PasswordAnalysis"

import PII_Detector from "./pages/PII_Detector"


function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover theme="colored" />
      <Routes>
        <Route path="/" element={<CoverPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/bulk_check" element={<BulkPassCheck />} />
        <Route path="/pii-check" element={<PII_Detector />} />
        <Route path="/password-analysis-dashboard" element={<PasswordAnalysis />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
