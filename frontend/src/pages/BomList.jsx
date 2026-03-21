import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const BomList = () => {
    const [boms, setBoms] = useState([]);
    const role = localStorage.getItem('role');

    const fetchBoms = () => API.get('/bom').then(res => setBoms(res.data)).catch(console.error);

    useEffect(() => {
        fetchBoms();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this Bill matrix baseline?")) return;
        try {
            await API.delete(`/bom/${id}`);
            fetchBoms();
        } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Bill of Materials (BoM) Master Directory</h2>
                {role === 'ADMIN' && (
                    <Link to="/boms/new" className="btn btn-primary">+ Create New BoM Baseline</Link>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Finished Product</th>
                            <th>Active Version</th>
                            <th>Components Logic</th>
                            <th>Operations Logic</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boms.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No BoM Baselines mapped locally natively.</td></tr>}
                        {boms.map(bom => (
                            <tr key={bom._id}>
                                <td style={{ fontWeight: '600', color: '#0052cc' }}>{bom.productId?.name || 'Unlinked Reference'}</td>
                                <td style={{ fontWeight: '500' }}>v{bom.currentVersionId?.versionNumber || 1}.0</td>
                                <td style={{ color: '#4b5563' }}>{bom.currentVersionId?.components?.length || 0} unique components</td>
                                <td style={{ color: '#4b5563' }}>{bom.currentVersionId?.operations?.length || 0} steps</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span className="badge badge-active" style={{ background: bom.isActive ? '#def7ec' : '#fde8e8', color: bom.isActive ? '#046c4e' : '#9b1c1c' }}>{bom.isActive ? 'ACTIVE' : 'ARCHIVED'}</span>
                                        {role === 'ADMIN' && (
                                            <button onClick={() => handleDelete(bom._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>
                                                PURGE
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default BomList;
