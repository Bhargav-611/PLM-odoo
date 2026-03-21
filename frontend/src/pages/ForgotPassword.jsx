import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage('OTP sent successfully!');
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none' }}>
                    Send OTP
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default ForgotPassword;
