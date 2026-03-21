import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

const EcoCreate = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        changeDescription: '',
        productId: '',
        ecoType: 'PRODUCT',
        effectiveDate: new Date().toISOString().slice(0, 16),
        versionUpdate: true
    });
    const userName = localStorage.getItem('name') || 'Current User';
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await API.get('/products');
            setProducts(res.data);
            if (res.data.length > 0) setFormData(f => ({ ...f, productId: res.data[0]._id }));
        };
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/eco/create', formData);
            if (res.data._id) {
                navigate(`/eco/${res.data._id}/edit`);
            } else {
                navigate('/eco');
            }
        } catch (err) { setMessage(err.response?.data?.message || 'Error'); }
    }

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/eco" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none', fontWeight: '500' }}>&larr; Return</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>Initiate New ECO</h2>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>ECO Title *</label>
                        <input type="text" name="title" onChange={handleChange} required placeholder="e.g. Price Adjustment Q2" />
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>ECO Type *</label>
                            <select name="ecoType" value={formData.ecoType} onChange={handleChange} required>
                                <option value="PRODUCT">PRODUCT</option>
                                <option value="BOM">BOM</option>
                            </select>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontWeight: 'bold' }}>Type of ECO Selection *</label>
                            <select name="productId" onChange={handleChange} required value={formData.productId}>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Initiated By (Read-only)</label>
                            <input type="text" value={userName} readOnly style={{ background: '#f3f4f6' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Effective Date & Time</label>
                            <input
                                type="datetime-local"
                                name="effectiveDate"
                                value={formData.effectiveDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="versionUpdate"
                            checked={formData.versionUpdate}
                            onChange={e => setFormData({ ...formData, versionUpdate: e.target.checked })}
                            style={{ width: 'auto' }}
                        />
                        <label style={{ fontWeight: 'bold', margin: 0 }}>Version Update (Auto-increment on master data when DONE)</label>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Justification Overview *</label>
                        <textarea
                            name="changeDescription"
                            onChange={handleChange}
                            required
                            placeholder="Why is this change necessary?"
                            style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    {message && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{message}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
                        Save Draft Request
                    </button>
                </form>
            </div>
        </div>
    );
};
export default EcoCreate;
