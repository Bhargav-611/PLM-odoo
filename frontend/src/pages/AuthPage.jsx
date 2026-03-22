import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();

    // Auto-redirect if already logged in
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
        role: 'ENGINEER',
        speciality: '',
        otherSpeciality: ''
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
                const res = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                localStorage.setItem('name', res.data.name || '');
                localStorage.setItem('email', res.data.email || '');
                navigate('/products');
            } else {
                const payload = { ...formData };
                if (payload.role === 'APPROVER' && payload.speciality === 'Other') {
                    payload.speciality = payload.otherSpeciality;
                }
                const res = await axios.post('http://localhost:5000/api/auth/signup', payload);
                setMessage('Signup Successful! You can now login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-start py-12 px-6 sm:px-16 lg:px-32 relative overflow-hidden bg-slate-50 font-sans">
            
            {/* 1. Full-Screen Background Image - OVERLAPPED BY FORM */}
            <img 
                src="/3.png" 
                alt="Custom Background" 
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 animate-fadeIn" 
            />

            {/* Soft Grid overlay over background to keep dimensional depth */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 z-0"></div>

            {/* Back to Home Button floating absolute top-leftwards (visible in reference image) */}
            <Link 
                to="/" 
                className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Home
            </Link>

            {/* 2. Glassmorphic Smooth Container with Left Anchor */}
            <div className={`relative z-10 w-full ${isLogin ? 'max-w-sm' : 'max-w-md'} bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-xl shadow-slate-900/5 transition-all duration-300 animate-slideUp`}>
                
                {/* Logo Wrapper */}
                <div className="flex flex-col items-start mb-6">
                    <Link to="/" className="flex items-center gap-2 mb-1 group">
                        <img src="/2.png" alt="controlSystem Logo" className="w-8 h-8 object-contain group-hover:rotate-6 transition-transform duration-300" />
                        <span className="text-lg tracking-tight">
                            <span className="font-light text-slate-800">Control</span><span className="font-black text-blue-600">System</span>
                        </span>
                    </Link>
                    <p className="text-slate-400 text-[10px] tracking-wider uppercase leading-none">Engineering intelligence</p>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 text-left mb-2">
                    {isLogin ? 'Sign In' : 'Sign up'}
                </h2>
                <p className="text-slate-500 text-xs mb-8 leading-relaxed text-left">
                    Welcome back. Login to access unified asset grid.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    {!isLogin && (
                        <div className="flex flex-col gap-1 align-left">
                            <label className="text-xs font-semibold text-slate-500 text-left">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-sm"
                                required
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1 align-left">
                        <label className="text-xs font-semibold text-slate-500 text-left">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1 align-left">
                        <label className="text-xs font-semibold text-slate-500 text-left">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-sm"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="flex flex-col gap-1 align-left">
                                <label className="text-xs font-semibold text-slate-500 text-left">System Role</label>
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-sm appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%200%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat"
                                >
                                    <option value="ENGINEER">ENGINEER</option>
                                    <option value="APPROVER">APPROVER</option>
                                    <option value="OPERATOR">OPERATOR</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            {formData.role === 'APPROVER' && (
                                <div className="flex flex-col gap-1 mt-1 align-left">
                                    <label className="text-xs font-semibold text-slate-500 text-left">Approver Speciality</label>
                                    <select 
                                        name="speciality" 
                                        value={formData.speciality} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-sm appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%200%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat"
                                        required
                                    >
                                        <option value="">-- Select Speciality --</option>
                                        <option value="Software Expert">Software Expert</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Other">Other (Specify Below)</option>
                                    </select>
                                </div>
                            )}

                            {formData.role === 'APPROVER' && formData.speciality === 'Other' && (
                                <div className="flex flex-col gap-1 mt-1 align-left">
                                    <label className="text-xs font-semibold text-slate-500 text-left">Custom Domain Input</label>
                                    <input
                                        type="text"
                                        name="otherSpeciality"
                                        placeholder="e.g., Materials Science"
                                        value={formData.otherSpeciality}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-sm"
                                        required
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium py-1">
                        <input type="checkbox" id="terms" className="rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                        <label htmlFor="terms">I agree to the terms of service</label>
                    </div>

                    {isLogin && (
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 text-xs font-semibold hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all duration-200 mt-2 text-sm"
                    >
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                {message && <p className="text-green-500 text-xs font-semibold text-center mt-4">{message}</p>}
                {error && <p className="text-red-500 text-xs font-semibold text-center mt-4">{error}</p>}

                <div className="mt-8 pt-4 border-t border-slate-100/30 text-left text-xs text-slate-400">
                    {isLogin ? "Not a member yet? " : "Already a member? "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage('');
                            setError('');
                        }}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
