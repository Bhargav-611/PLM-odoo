import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const role = localStorage.getItem('role');

    const fetchProducts = async () => {
        try {
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will purge the entire product architecture and all versions!")) return;
        try {
            await API.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedProducts = filteredProducts.slice(0, limit);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#111827' }}>Product Master Directory</h2>
                {role === 'ADMIN' && (
                    <Link to="/products/new" className="btn btn-primary">
                        + Create Product
                    </Link>
                )}
            </div>

            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <input
                    type="text"
                    placeholder="Search by Product Name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Active Version</th>
                            <th>Sale Price ($)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                                    No active products found.
                                </td>
                            </tr>
                        )}
                        {paginatedProducts.map(p => {
                            const v = p.currentVersionId;
                            return (
                                <tr key={p._id} onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                                    <td style={{ fontWeight: '500', color: '#111827' }}>{p.name}</td>
                                    <td>{v?.versionLabel || `v${v?.versionNumber}`}</td>
                                    <td>${v?.salePrice?.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${v?.status === 'ACTIVE' ? 'badge-active' : 'badge-archived'}`}>
                                            {v?.status === 'ACTIVE' ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            {role !== 'OPERATOR' && (
                                                <Link to={`/products/${p._id}/history`} style={{ color: '#0052cc', fontWeight: '500', textDecoration: 'none', fontSize: '13px' }}>
                                                    History
                                                </Link>
                                            )}
                                            {['ENGINEER', 'ADMIN'].includes(role) && (
                                                <Link to={`/eco?search=${p.name}`} className="btn" style={{ background: '#e0e7ff', color: '#4338ca', padding: '5px 10px', fontSize: '12px' }}>
                                                    Changes
                                                </Link>
                                            )}
                                            {role === 'ADMIN' && (
                                                <button onClick={() => handleDelete(p._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                                                    DELETE
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {limit < filteredProducts.length && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setLimit(limit + 10)} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>Show More (10+ rows)</button>
                </div>
            )}

            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</span>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>{selectedProduct.name} Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>PRODUCT NAME</label>
                                <p>{selectedProduct.name}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>ACTIVE VERSION</label>
                                <p>{selectedProduct.currentVersionId?.versionLabel || 'N/A'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>SALE PRICE</label>
                                <p>${selectedProduct.currentVersionId?.salePrice?.toFixed(2)}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>COST PRICE</label>
                                <p>${selectedProduct.currentVersionId?.costPrice?.toFixed(2)}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>COMPONENTS TRACKED</label>
                            <p style={{ marginTop: '5px' }}>{selectedProduct.currentVersionId?.components?.length || 0} items identified in master structure.</p>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                            {role !== 'OPERATOR' && (
                                <Link to={`/products/${selectedProduct._id}/history`} className="btn btn-primary" style={{ flex: 1 }}>Full Version History</Link>
                            )}
                            <button onClick={() => setSelectedProduct(null)} className="btn" style={{ flex: 1, background: '#f3f4f6' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
