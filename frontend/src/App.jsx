import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import './index.css';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    // Do not show Master Directory on Auth routes if not logged in
    const isAuthRoute = ['/', '/forgot-password', '/verify-otp', '/reset-password'].includes(location.pathname);

    return (
        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: '#0052cc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>&#9881;</div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>PLM <span style={{ color: '#0052cc' }}>Hub</span></h1>
            </div>

            <div style={{ display: 'flex', gap: '24px', fontWeight: '500', alignItems: 'center' }}>
                {token ? (
                    <>
                        <Link to="/products" style={{ color: '#4b5563', textDecoration: 'none' }}>Directory</Link>
                        <Link to="/boms" style={{ color: '#4b5563', textDecoration: 'none' }}>Bills of Materials</Link>
                        <Link to="/eco" style={{ color: '#4b5563', textDecoration: 'none' }}>ECO</Link>
                        {['ADMIN', 'APPROVER', 'ENGINEER', 'OPERATOR'].includes(role) && <Link to="/report" style={{ color: '#4b5563', textDecoration: 'none' }}>Audits</Link>}
                        <span style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', color: '#374151', fontWeight: 'bold' }}>{role}</span>
                        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Logout</button>
                    </>
                ) : (
                    <>
                        {!isAuthRoute && <Link to="/" style={{ color: '#0052cc', textDecoration: 'none' }}>Login</Link>}
                    </>
                )}
            </div>
        </nav>
    );
};

function App() {
    return (
        <BrowserRouter>
            <div>
                <Navigation />
                <div style={{ padding: '0 32px', paddingBottom: '64px' }}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<AuthPage />} />
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
        </BrowserRouter>
    );
}

export default App;
