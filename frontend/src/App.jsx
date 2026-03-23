import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import ProductHistory from './pages/ProductHistory';
import BomList from './pages/BomList';
import BomForm from './pages/BomForm';
import EcoList from './pages/EcoList';
import EcoCreate from './pages/EcoCreate';
import EcoEdit from './pages/EcoEdit';
import EcoCompare from './pages/EcoCompare';
import Report from './pages/Report';
import ProtectedRoute from './components/ProtectedRoute';
import API from './api/api';
import './index.css';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const [isHovered, setIsHovered] = useState(false);

    const [userData, setUserData] = useState({ name: name || '', email: email || '' });

    useEffect(() => {
        console.log("API URL:", import.meta.env.VITE_API_URL);
    }, []);

    useEffect(() => {
        if (token && (!userData.name || !userData.email)) {
            API.get('/auth/me')
                .then(res => {
                    setUserData({ name: res.data.name, email: res.data.email });
                    localStorage.setItem('name', res.data.name || '');
                    localStorage.setItem('email', res.data.email || '');
                })
                .catch(console.error);
        }
    }, [token, userData.name, userData.email]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    // Do not show Master Directory on Auth routes if not logged in
    const isAuthRoute = ['/login', '/forgot-password', '/verify-otp', '/reset-password'].includes(location.pathname);

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100/80 shadow-sm font-sans mb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-16">

                    {/* 1. Logo Slot (Left) */}
                    <Link to="/" className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 -z-0"></div>
                            <img
                                src="/2.png"
                                className="w-10 h-10 relative z-10 group-hover:scale-105 transition-transform object-contain mix-blend-multiply"
                                style={{ filter: 'invert(24%) sepia(87%) saturate(2250%) hue-rotate(210deg) brightness(95%) contrast(98%)' }}
                                alt="Logo"
                            />
                        </div>
                        <span className="text-lg font-bold text-slate-800 tracking-tight">
                            Control<span className="text-blue-600">System</span>
                        </span>
                    </Link>

                    {/* 2. Desktop Links Slot (Centered) */}
                    <div className="hidden md:flex flex-1 justify-center items-stretch gap-6 h-full">
                        {token ? (
                            <>
                                <Link to="/products" className={`relative h-full flex items-center text-slate-600 hover:text-slate-900 font-semibold text-[13px] transition-colors ${location.pathname.startsWith('/products') ? 'text-blue-600' : ''}`}>
                                    Directory
                                    {location.pathname.startsWith('/products') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>}
                                </Link>
                                <Link to="/boms" className={`relative h-full flex items-center text-slate-600 hover:text-slate-900 font-semibold text-[13px] transition-colors ${location.pathname.startsWith('/boms') ? 'text-blue-600' : ''}`}>
                                    Bills of Materials
                                    {location.pathname.startsWith('/boms') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>}
                                </Link>
                                <Link to="/eco" className={`relative h-full flex items-center text-slate-600 hover:text-slate-900 font-semibold text-[13px] transition-colors ${location.pathname.startsWith('/eco') ? 'text-blue-600' : ''}`}>
                                    ECO
                                    {location.pathname.startsWith('/eco') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>}
                                </Link>
                                {['ADMIN', 'APPROVER', 'ENGINEER', 'OPERATOR'].includes(role) && (
                                    <Link to="/report" className={`relative h-full flex items-center text-slate-600 hover:text-slate-900 font-semibold text-[13px] transition-colors ${location.pathname === '/report' ? 'text-blue-600' : ''}`}>
                                        Auditing
                                        {location.pathname === '/report' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>}
                                    </Link>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* 3. Action Slot / Role State (Right) */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {token ? (
                            <>
                                <div
                                    className="relative flex items-center"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <span className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold text-[11px] tracking-wide shadow-sm transition-colors cursor-pointer">
                                        {role}
                                    </span>

                                    {isHovered && (
                                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex flex-col items-start gap-1 z-50 animate-fadeIn min-w-[160px] animate-zoomIn">
                                            <div className="w-full border-b border-slate-50 pb-1.5 mb-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">User Profile</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-800 tracking-tight">{userData.name || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">{userData.email || 'No email'}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs ring-1 ring-red-200/50 transition-all cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            !isAuthRoute && (
                                <Link
                                    to="/login"
                                    className="px-5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                                >
                                    Login
                                </Link>
                            )
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

const AppContent = () => {
    const location = useLocation();
    const isLanding = location.pathname === '/';
    const isAuthRoute = ['/login', '/forgot-password', '/verify-otp', '/reset-password'].includes(location.pathname);

    return (
        <div>
            {(!isLanding && !isAuthRoute) && <Navigation />}
            <div style={(isLanding || isAuthRoute) ? {} : { padding: '0 32px', paddingBottom: '64px' }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route path="/products" element={
                        <ProtectedRoute>
                            <ProductList />
                        </ProtectedRoute>
                    } />
                    <Route path="/products/new" element={
                        <ProtectedRoute>
                            <ProductForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/products/:id/history" element={
                        <ProtectedRoute>
                            <ProductHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/boms" element={<ProtectedRoute><BomList /></ProtectedRoute>} />
                    <Route path="/boms/new" element={<ProtectedRoute><BomForm /></ProtectedRoute>} />

                    <Route path="/eco" element={<ProtectedRoute><EcoList /></ProtectedRoute>} />
                    <Route path="/eco/new" element={<ProtectedRoute><EcoCreate /></ProtectedRoute>} />
                    <Route path="/eco/:id/edit" element={<ProtectedRoute><EcoEdit /></ProtectedRoute>} />
                    <Route path="/eco/:id/compare" element={<ProtectedRoute><EcoCompare /></ProtectedRoute>} />
                    <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
                </Routes>
            </div>
        </div>
    );
};

import { DialogProvider } from './context/DialogContext';

function App() {
    return (
        <BrowserRouter>
            <DialogProvider>
                <AppContent />
            </DialogProvider>
        </BrowserRouter>
    );
}

export default App;
