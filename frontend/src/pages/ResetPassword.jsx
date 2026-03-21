import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    const otp = location.state?.otp || '';

    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!email || !otp) {
        return <Navigate to="/forgot-password" />;
    }

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
            setMessage('Password reset successfully!');
            setTimeout(() => {
                navigate('/'); // Redirect back to login
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Reset Password</h2>
            <p style={{ marginBottom: '15px' }}>Resetting password for: <strong>{email}</strong></p>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none' }}>
                    Reset Password
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default ResetPassword;
