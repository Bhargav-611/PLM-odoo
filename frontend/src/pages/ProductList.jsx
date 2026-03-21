import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
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
                        {products.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                                    No active products found.
                                </td>
                            </tr>
                        )}
                        {products.map(p => {
                            const v = p.currentVersionId;
                            return (
                                <tr key={p._id}>
                                    <td style={{ fontWeight: '500', color: '#111827' }}>{p.name}</td>
                                    <td>{v?.versionLabel || `v${v?.versionNumber}`}</td>
                                    <td>${v?.salePrice?.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${v?.status === 'ACTIVE' ? 'badge-active' : 'badge-archived'}`}>
                                            {v?.status === 'ACTIVE' ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <Link to={`/products/${p._id}/history`} style={{ color: '#0052cc', fontWeight: '500', textDecoration: 'none' }}>
                                                Audit Trail
                                            </Link>
                                            {role === 'ADMIN' && (
                                                <button onClick={() => handleDelete(p._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                                                    UNLINK (DELETE)
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
        </div>
    );
};

export default ProductList;
