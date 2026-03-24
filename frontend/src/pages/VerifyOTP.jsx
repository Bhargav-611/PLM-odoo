import axios from 'axios';
import API from '../api/api';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";

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
            await API.post('/auth/verify-otp', { email, otp });
            setMessage('OTP verified!');
            setTimeout(() => {
                navigate('/reset-password', { state: { email, otp } });
            }, 1500);
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

            {/* Back to Home Button floating absolute top-leftwards */}
            <Link 
                to="/" 
                className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Home
            </Link>

            {/* 2. Glassmorphic Smooth Container with Left Anchor */}
            <div className="relative z-10 w-full max-w-sm bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-xl shadow-slate-900/5 animate-slideUp">
                
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

                <h2 className="text-2xl font-bold text-slate-900 text-left mb-1">
                    Verify OTP
                </h2>
                <p className="text-slate-500 text-xs mb-6 leading-relaxed text-left">
                    OTP sent to: <strong className="text-blue-600 font-bold">{email}</strong>
                </p>

                <form onSubmit={handleVerify} className="space-y-4 w-full">
                    <div className="flex flex-col gap-1 align-left">
                        <label className="text-xs font-semibold text-slate-500 text-left">6-Digit Code</label>
                        <input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            className="w-full px-4 py-3 rounded-lg bg-white/60 outline-none text-slate-800 focus:bg-white/90 border border-slate-200/40 transition-colors text-lg font-bold text-center tracking-widest"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all duration-200 mt-2 text-sm"
                    >
                        Verify OTP
                    </button>
                </form>

                {message && <p className="text-green-500 text-xs font-semibold text-center mt-4">{message}</p>}
                {error && <p className="text-red-500 text-xs font-semibold text-center mt-4">{error}</p>}

                <div className="mt-6 pt-6 border-t border-slate-100/30 text-left">
                    <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                        Back to Forgot Password
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
