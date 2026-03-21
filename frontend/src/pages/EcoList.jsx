import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link, useLocation } from 'react-router-dom';

const EcoList = () => {
    const [ecos, setEcos] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedEco, setSelectedEco] = useState(null);
    const [assignModalEco, setAssignModalEco] = useState(null);
    const [approverSequence, setApproverSequence] = useState([]);

    const [specialityFilter, setSpecialityFilter] = useState('');

    const role = localStorage.getItem('role');
    const location = useLocation();

    // Decode JWT for local strict User ID lookups
    const getUserId = () => {
        try {
            const tk = localStorage.getItem('token');
            if (!tk) return null;
            return JSON.parse(atob(tk.split('.')[1])).user.id;
        } catch { return null; }
    };
    const currentUserId = getUserId();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search');
        if (q) setSearchTerm(q);

        fetchEcos();
        if (role === 'ADMIN') {
            fetchUsers();
        }
    }, [role]);

    const fetchEcos = async () => {
        try {
            const res = await API.get('/eco');
            setEcos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await API.get('/auth/users');
            // Allow Admins and Approvers in the approval chain
            setUsers(res.data.filter(u => u.role === 'APPROVER' || u.role === 'ADMIN'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, actionStr) => {
        try {
            await API.post(`/eco/${id}/${actionStr}`);
            fetchEcos();
        } catch (err) {
            alert(err.response?.data?.message || 'Error executing action');
        }
    };

    const handleAssignApprovers = async () => {
        if (!approverSequence.length) return alert('Select at least one approver');
        try {
            await API.post(`/eco/${assignModalEco._id}/assign-approvers`, { approverIds: approverSequence });
            setAssignModalEco(null);
            setApproverSequence([]);
            fetchEcos();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign approvers');
        }
    };

    const filteredEcos = ecos.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.productId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedEcos = filteredEcos.slice(0, limit);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>
                    {role === 'ENGINEER' ? 'My ECO Proposals' :
                        role === 'APPROVER' ? 'Assigned ECO Actions' :
                            'Global ECO Dashboard'}
                </h2>
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
                            <th>Status (Strict)</th>
                            <th>Created By</th>
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
                                    {eco.isLocked && <span style={{ marginLeft: '5px' }}>🔒</span>}
                                </td>
                                <td>{eco.productId?.name || 'N/A'}</td>
                                <td>{eco.ecoType}</td>
                                <td>
                                    <span className={`badge ${eco.status === 'REJECTED' ? 'badge-archived' : 'badge-active'}`}>
                                        {eco.status}
                                    </span>
                                    {eco.status === 'IN_PROGRESS' && !eco.isReadyForFinalApproval && (
                                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontWeight: 'bold' }}>
                                            {(() => {
                                                const currentPending = eco.approvers?.find(a => a.status === 'PENDING');
                                                if (!currentPending || !currentPending.user) return '';
                                                return `Awaiting: ${currentPending.user.name} ${currentPending.user.speciality ? `(${currentPending.user.speciality})` : ''}`;
                                            })()}
                                        </div>
                                    )}
                                </td>
                                <td>{eco.createdBy?.name || 'Unknown'}</td>
                                <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                    <Link to={`/eco/${eco._id}/compare`} className="btn" style={{ background: '#f3f4f6', color: '#374151', padding: '6px 10px', fontSize: '13px' }}>Compare & Sequence</Link>

                                    {/* Engineer Buttons */}
                                    {role === 'ENGINEER' && !eco.isLocked && eco.status === 'NEW' && (
                                        <>
                                            <Link to={`/eco/${eco._id}/edit`} className="btn" style={{ padding: '6px 10px', fontSize: '13px', background: '#e5e7eb', color: '#111827' }}>Edit Draft</Link>
                                            <button onClick={() => handleAction(eco._id, 'submit')} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '13px' }}>Submit (Lock)</button>
                                        </>
                                    )}

                                    {/* Approver Direct Linear Checkpoint Button */}
                                    {role === 'APPROVER' && eco.status === 'IN_PROGRESS' && !eco.isReadyForFinalApproval && (
                                        eco.approvers?.find(a => a.status === 'PENDING')?.user?._id === currentUserId && (
                                            <button onClick={() => handleAction(eco._id, 'approve')} className="btn btn-success" style={{ padding: '6px 10px', fontSize: '13px' }}>Approve Checkpoint</button>
                                        )
                                    )}

                                    {/* Admin Buttons */}
                                    {role === 'ADMIN' && eco.status !== 'APPROVED' && eco.status !== 'REJECTED' && (
                                        <button onClick={() => setAssignModalEco(eco)} className="btn" style={{ background: '#4b5563', color: 'white', padding: '6px 10px', fontSize: '13px' }}>Assign Chain</button>
                                    )}
                                    {role === 'ADMIN' && eco.status === 'IN_PROGRESS' && eco.isReadyForFinalApproval && (
                                        <button onClick={() => handleAction(eco._id, 'apply')} className="btn btn-success" style={{ padding: '6px 10px', fontSize: '13px' }}>FINAL APPROVE & APPLY</button>
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

            {assignModalEco && (
                <div className="modal-overlay" onClick={() => setAssignModalEco(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <span className="modal-close" onClick={() => setAssignModalEco(null)}>&times;</span>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Assign Sequential Approvers</h3>

                        <div style={{ marginTop: '15px' }}>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                                Define the exact sequence of approval for <strong>{assignModalEco.title}</strong>. Order matters. The Admin is automatically the implicit final approver once the chain completes.
                            </p>

                            <div style={{ marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Filter authority pool by Speciality Array (e.g. Hardware)..."
                                    value={specialityFilter}
                                    onChange={e => setSpecialityFilter(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px' }}
                                />
                            </div>

                            {approverSequence.map((approverId, index) => (
                                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold', width: '25px', color: '#374151' }}>#{index + 1}</span>
                                    <select
                                        value={approverId}
                                        onChange={(e) => {
                                            const newSeq = [...approverSequence];
                                            newSeq[index] = e.target.value;
                                            setApproverSequence(newSeq);
                                        }}
                                        style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                    >
                                        <option value="">-- Select Approver --</option>
                                        {users.filter(u => u.speciality?.toLowerCase().includes(specialityFilter.toLowerCase()) || !specialityFilter).map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role}{u.speciality ? ` - ${u.speciality}` : ''})</option>
                                        ))}
                                    </select>
                                    <button onClick={() => setApproverSequence(approverSequence.filter((_, i) => i !== index))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
                                </div>
                            ))}

                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                                <button className="btn" style={{ background: '#e5e7eb', color: '#374151' }} onClick={() => setApproverSequence([...approverSequence, ''])}>
                                    + Add Approver Stage
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                            <button onClick={handleAssignApprovers} className="btn btn-primary" style={{ flex: 1 }}>Confirm Ordered Chain</button>
                            <button onClick={() => setAssignModalEco(null)} className="btn" style={{ flex: 1, background: '#f3f4f6' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedEco && !assignModalEco && (
                <div className="modal-overlay" onClick={() => setSelectedEco(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="modal-close" onClick={() => setSelectedEco(null)}>&times;</span>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>{selectedEco.title} {selectedEco.isLocked && '🔒'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>PRODUCT</label>
                                <p>{selectedEco.productId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>STATUS</label>
                                <p><span className={`badge ${selectedEco.status === 'REJECTED' ? 'badge-archived' : 'badge-active'}`}>{selectedEco.status}</span></p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>CREATED BY</label>
                                <p>{selectedEco.createdBy?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>SUBMITTED</label>
                                <p>{selectedEco.submittedAt ? new Date(selectedEco.submittedAt).toLocaleString() : 'Not Submitted'}</p>
                            </div>
                            {selectedEco.rejectionReason && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>REJECTION REASON</label>
                                    <p style={{ color: '#ef4444' }}>{selectedEco.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                            <Link to={`/eco/${selectedEco._id}/compare`} className="btn btn-primary" style={{ flex: 1 }}>Full Comparison & Sequence Trace</Link>
                            <button onClick={() => setSelectedEco(null)} className="btn" style={{ flex: 1, background: '#f3f4f6' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EcoList;
