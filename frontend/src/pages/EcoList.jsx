import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link, useLocation } from 'react-router-dom';

const EcoList = () => {
    const [ecos, setEcos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedEco, setSelectedEco] = useState(null);
    const role = localStorage.getItem('role');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search');
        if (q) setSearchTerm(q);

        const fetchEcos = async () => {
            try {
                const res = await API.get('/eco');
                setEcos(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEcos();
    }, []);

    const handleAction = async (id, actionStr) => {
        try {
            await API.put(`/eco/${id}/${actionStr}`);
            const res = await API.get('/eco');
            setEcos(res.data);
        } catch (err) { alert(err.response?.data?.message || 'Error executing action'); }
    };

    const filteredEcos = ecos.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.productId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedEcos = filteredEcos.slice(0, limit);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>ECO Workflow Dashboard</h2>
                {['ENGINEER', 'ADMIN'].includes(role) && (
                    <Link to="/eco/new" className="btn btn-primary">+ Create Change Order</Link>
                )}
            </div>

            <div className="card" style={{ marginBottom: '20px', padding: '16px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by Title or Product..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Stage</th>
                            <th>Requested By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEcos.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No ECOs found.</td></tr>}
                        {paginatedEcos.map(eco => (
                            <tr key={eco._id} onClick={() => setSelectedEco(eco)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontWeight: '500' }}>
                                    {eco.title}
                                    {eco.applied && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>ECO Applied</span>}
                                </td>
                                <td>{eco.productId?.name || 'N/A'}</td>
                                <td>{eco.ecoType}</td>
                                <td><span className="badge badge-active">{eco.stage}</span></td>
                                <td>{eco.requestedBy?.name || 'Unknown'}</td>
                                <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                    <Link to={`/eco/${eco._id}/compare`} className="btn" style={{ background: '#f3f4f6', color: '#374151', padding: '6px 10px', fontSize: '13px' }}>Compare</Link>

                                    {['APPROVER', 'ADMIN'].includes(role) && eco.stage === 'NEW_REQUEST' && (
                                        <button onClick={() => handleAction(eco._id, 'approve-request')} className="btn btn-success" style={{ padding: '6px 10px', fontSize: '13px' }}>Approve Request</button>
                                    )}
                                    {['ENGINEER', 'ADMIN'].includes(role) && (eco.stage === 'REQUEST_APPROVED' || eco.stage === 'IN_CHANGE') && (
                                        <Link to={`/eco/${eco._id}/edit`} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '13px' }}>Edit Draft</Link>
                                    )}
                                    {['ENGINEER', 'ADMIN'].includes(role) && eco.stage === 'IN_CHANGE' && (
                                        <button onClick={() => handleAction(eco._id, 'send-final')} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '13px' }}>Send Final</button>
                                    )}
                                    {['APPROVER', 'ADMIN'].includes(role) && eco.stage === 'FINAL_APPROVAL' && (
                                        <button onClick={() => handleAction(eco._id, 'final-approve')} className="btn btn-success" style={{ padding: '6px 10px', fontSize: '13px' }}>Final Approve (DONE)</button>
                                    )}
                                    {['ENGINEER', 'APPROVER', 'ADMIN'].includes(role) && eco.stage === 'DONE' && !eco.applied && (
                                        <button onClick={() => handleAction(eco._id, 'apply')} className="btn btn-success" style={{ padding: '6px 10px', fontSize: '13px' }}>System Apply</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {limit < filteredEcos.length && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setLimit(limit + 10)} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>Show More (10+ rows)</button>
                </div>
            )}

            {selectedEco && (
                <div className="modal-overlay" onClick={() => setSelectedEco(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="modal-close" onClick={() => setSelectedEco(null)}>&times;</span>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>{selectedEco.title}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>PRODUCT</label>
                                <p>{selectedEco.productId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>ECO TYPE</label>
                                <p>{selectedEco.ecoType}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>CURRENT STAGE</label>
                                <p><span className="badge badge-active">{selectedEco.stage}</span></p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>REQUESTED BY</label>
                                <p>{selectedEco.requestedBy?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>EFFECTIVE DATE</label>
                                <p>{selectedEco.effectiveDate ? new Date(selectedEco.effectiveDate).toLocaleString() : 'TBD'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>VERSION UPDATE</label>
                                <p>{selectedEco.versionUpdate ? 'Enabled ✅' : 'Disabled ❌'}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>JUSTIFICATION</label>
                            <p style={{ marginTop: '5px', fontSize: '14px', color: '#4b5563' }}>{selectedEco.changeDescription || 'No description provided.'}</p>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                            <Link to={`/eco/${selectedEco._id}/compare`} className="btn btn-primary" style={{ flex: 1 }}>Full Comparison</Link>
                            <button onClick={() => setSelectedEco(null)} className="btn" style={{ flex: 1, background: '#f3f4f6' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EcoList;
