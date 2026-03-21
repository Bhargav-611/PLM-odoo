import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const BomList = () => {
    const [boms, setBoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedBom, setSelectedBom] = useState(null);
    const [versionHistory, setVersionHistory] = useState([]);
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

    const handleRowClick = async (bom) => {
        setSelectedBom(bom);
        try {
            const res = await API.get(`/bom/${bom._id}/versions`);
            setVersionHistory(res.data);
        } catch (err) { console.error("History fetch failed", err); }
    };

    const filteredBoms = boms.filter(b =>
        (b.productId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedBoms = filteredBoms.slice(0, limit);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Bill of Materials (BoM) Master Directory</h2>
                {role === 'ADMIN' && (
                    <Link to="/boms/new" className="btn btn-primary">+ Create New BoM Baseline</Link>
                )}
            </div>

            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <input
                    type="text"
                    placeholder="Search by Finished Product..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Finished Product</th>
                            <th>Active Version</th>
                            <th>Components Logic</th>
                            <th>Operations Logic</th>
                            <th>Status & Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBoms.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No BoM Baselines mapped locally natively.</td></tr>}
                        {paginatedBoms.map(bom => (
                            <tr key={bom._id} onClick={() => handleRowClick(bom)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontWeight: '600', color: '#0052cc' }}>{bom.productId?.name || 'Unlinked Reference'}</td>
                                <td style={{ fontWeight: '500' }}>v{bom.currentVersionId?.versionNumber || 1}.0</td>
                                <td style={{ color: '#4b5563' }}>{bom.currentVersionId?.components?.length || 0} unique components</td>
                                <td style={{ color: '#4b5563' }}>{bom.currentVersionId?.operations?.length || 0} steps</td>
                                <td onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span className="badge badge-active" style={{ background: bom.isActive ? '#def7ec' : '#fde8e8', color: bom.isActive ? '#046c4e' : '#9b1c1c' }}>{bom.isActive ? 'ACTIVE' : 'ARCHIVED'}</span>
                                        {['ENGINEER', 'ADMIN'].includes(role) && (
                                            <Link to={`/eco/new`} className="btn" style={{ background: '#e0e7ff', color: '#4338ca', padding: '5px 10px', fontSize: '11px', textDecoration: 'none', borderRadius: '4px' }}>
                                                Change Option
                                            </Link>
                                        )}
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

            {limit < filteredBoms.length && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setLimit(limit + 10)} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>Show More (10+ rows)</button>
                </div>
            )}

            {selectedBom && (
                <div className="modal-overlay" onClick={() => setSelectedBom(null)}>
                    <div className="modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                        <span className="modal-close" onClick={() => setSelectedBom(null)}>&times;</span>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>BoM Baseline: {selectedBom.productId?.name}</h3>
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ color: '#111827', margin: '0 0 15px 0' }}>Active Configuration: v{selectedBom.currentVersionId?.versionNumber || 1}.0</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f9fafb', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                <div>
                                    <h5 style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>COMPONENTS LOGIC ({selectedBom.currentVersionId?.components?.length || 0})</h5>
                                    {selectedBom.currentVersionId?.components?.length > 0 ? (
                                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                            {selectedBom.currentVersionId.components.map((c, i) => (
                                                <li key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                    <strong>{c.componentName}</strong>: {c.quantity} units
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No dependencies registered.</p>
                                    )}
                                </div>
                                <div>
                                    <h5 style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>OPERATIONS LOGIC ({selectedBom.currentVersionId?.operations?.length || 0})</h5>
                                    {selectedBom.currentVersionId?.operations?.length > 0 ? (
                                        <ol style={{ paddingLeft: '20px', margin: 0 }}>
                                            {selectedBom.currentVersionId.operations.map((o, i) => (
                                                <li key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                    <strong>{o.workCenter}</strong> ({o.time} min)
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No manufacturing steps registered.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {role !== 'OPERATOR' && (
                            <div style={{ marginTop: '20px' }}>
                                <h4>Version History (Lifecycle Trace)</h4>
                                <table className="table" style={{ fontSize: '13px' }}>
                                    <thead>
                                        <tr>
                                            <th>Version</th>
                                            <th>Status</th>
                                            <th>Components</th>
                                            <th>Operations</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {versionHistory.map(vh => (
                                            <tr key={vh._id}>
                                                <td style={{ fontWeight: 'bold' }}>v{vh.versionNumber}.0</td>
                                                <td>
                                                    <span className={`badge ${vh.status === 'ACTIVE' ? 'badge-active' : 'badge-archived'}`}>
                                                        {vh.status}
                                                    </span>
                                                </td>
                                                <td>{vh.components?.length || 0} items</td>
                                                <td>{vh.operations?.length || 0} steps</td>
                                                <td>{new Date(vh.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <button onClick={() => setSelectedBom(null)} className="btn" style={{ background: '#f3f4f6' }}>Close Architecture View</button>
                        </div>
                    </div>
                </div >
            )}
        </div >
    );
};
export default BomList;
