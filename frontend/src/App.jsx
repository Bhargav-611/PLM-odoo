import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';

function App() {
    return (
        <BrowserRouter>
            <div style={{ fontFamily: 'sans-serif' }}>
                <h1 style={{ textAlign: 'center', margin: '20px 0' }}>PLM System</h1>
                <Routes>
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
