import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

const EcoList = () => {
    const [ecos, setEcos] = useState([]);
    const role = localStorage.getItem('role');

    useEffect(() => {
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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>ECO Workflow Dashboard</h2>
                {['ENGINEER', 'ADMIN'].includes(role) && (
                    <Link to="/eco/new" className="btn btn-primary">+ Create Change Order</Link>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Product</th>
                            <th>Stage</th>
                            <th>Requested By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ecos.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No ECOs found.</td></tr>}
                        {ecos.map(eco => (
                            <tr key={eco._id}>
                                <td style={{ fontWeight: '500' }}>{eco.title}</td>
                                <td>{eco.productId?.name || 'N/A'}</td>
                                <td><span className="badge badge-active">{eco.stage}</span></td>
                                <td>{eco.requestedBy?.name || 'Unknown'}</td>
                                <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
        </div>
    );
};
export default EcoList;
