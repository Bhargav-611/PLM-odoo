import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

const ProductForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', salePrice: '', costPrice: ''
    });
    const [image, setImage] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImage = (e) => setImage(e.target.files[0]);
    const handleAttachments = (e) => setAttachments(e.target.files);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('salePrice', formData.salePrice);
        data.append('costPrice', formData.costPrice);
        if (image) data.append('image', image);
        for (let i = 0; i < attachments.length; i++) {
            data.append('attachments', attachments[i]);
        }

        try {
            await API.post('/products/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Product Created Successfully!');
            setTimeout(() => navigate('/products'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating product. Remember, only ENGINEERS and ADMINS can create products!');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/products" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none' }}>&larr; Back</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>Create Master Product</h2>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Product Designation (Name)</label>
                        <input type="text" name="name" placeholder="E.g., Component XYZ" onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Sale Price ($)</label>
                            <input type="number" step="0.01" name="salePrice" placeholder="0.00" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Cost Price ($)</label>
                            <input type="number" step="0.01" name="costPrice" placeholder="0.00" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Target Version Matrix</label>
                        <input type="text" value="v1" readOnly style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }} />
                        <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Immutable baseline element injected automatically.</span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

                    <div className="form-group">
                        <label>Featured Primary Media</label>
                        <input type="file" accept="image/*" onChange={handleImage} />
                    </div>

                    <div className="form-group">
                        <label>CAD / Metadata Attachments</label>
                        <input type="file" multiple onChange={handleAttachments} />
                    </div>

                    {message && <p style={{ color: '#10b981', fontWeight: 'bold' }}>{message}</p>}
                    {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}

                    <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>
                        Initialize Architecture
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
