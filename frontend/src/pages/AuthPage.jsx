import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();

    // Auto-redirect if already logged in!
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/products');
        }
    }, [navigate]);

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ENGINEER'
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (isLogin) {
                // Login
                const res = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                navigate('/products'); // Redirect natively upon success
            } else {
                // Signup
                const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
                setMessage('Signup Successful! You can now login.');
                setIsLogin(true); // Switch to login view after successful signup
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto' }}>
            <div className="card">
                <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#111827', textAlign: 'center' }}>
                    {isLogin ? 'Login to PLM Hub' : 'Register Account'}
                </h2>

                <form onSubmit={handleSubmit}>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="E.g., John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Business Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>System Role</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="ENGINEER">ENGINEER</option>
                                <option value="APPROVER">APPROVER</option>
                                <option value="OPERATOR">OPERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                    )}

                    {isLogin && (
                        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                            <Link to="/forgot-password" style={{ color: '#0052cc', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {message && <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{message}</p>}
                {error && <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{error}</p>}

                <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage('');
                            setError('');
                        }}
                        style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span style={{ color: '#0052cc', textDecoration: 'underline' }}>{isLogin ? 'Sign up' : 'Log in'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
