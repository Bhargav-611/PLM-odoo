import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!email) {
        return <Navigate to="/forgot-password" />;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
            setMessage('OTP verified!');
            setTimeout(() => {
                navigate('/reset-password', { state: { email, otp } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Verify OTP</h2>
            <p style={{ marginBottom: '15px' }}>OTP sent to: <strong>{email}</strong></p>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                    style={{ padding: '10px', fontSize: '18px', letterSpacing: '2px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none' }}>
                    Verify OTP
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default VerifyOTP;
