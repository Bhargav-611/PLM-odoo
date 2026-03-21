import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ENGINEER'
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (isLogin) {
                // Login
                const res = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                setMessage(`Login Successful! Welcome. Role: ${res.data.role}`);
            } else {
                // Signup
                const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
                setMessage('Signup Successful! You can now login.');
                setIsLogin(true); // Switch to login view after successful signup
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>{isLogin ? 'Login' : 'Signup'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {!isLogin && (
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ padding: '10px' }}
                    />
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />

                {!isLogin && (
                    <select name="role" value={formData.role} onChange={handleChange} style={{ padding: '10px' }}>
                        <option value="ENGINEER">ENGINEER</option>
                        <option value="APPROVER">APPROVER</option>
                        <option value="OPS">OPERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                )}

                <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none' }}>
                    {isLogin ? 'Login' : 'Signup'}
                </button>
            </form>

            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>

            {isLogin && (
                <div style={{ marginTop: '10px' }}>
                    <Link to="/forgot-password" style={{ color: '#007bff' }}>Forgot Password?</Link>
                </div>
            )}

            <button
                onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage('');
                }}
                style={{ marginTop: '20px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
            </button>
        </div>
    );
};

export default AuthPage;
