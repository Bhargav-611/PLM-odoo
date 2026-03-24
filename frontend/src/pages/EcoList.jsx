import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const EcoList = () => {
    const [ecos, setEcos] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedEco, setSelectedEco] = useState(null);
    const [assignModalEco, setAssignModalEco] = useState(null);
    const [approverSequence, setApproverSequence] = useState([]);

    useEffect(() => {
        if (assignModalEco) {
            if (assignModalEco.approvers && assignModalEco.approvers.length > 0) {
                setApproverSequence(assignModalEco.approvers.map(a => ({
                    user: a.user?._id || a.user,
                    isRequired: a.isRequired !== undefined ? a.isRequired : true
                })));
            } else {
                setApproverSequence([]);
            }
        } else {
            setApproverSequence([]);
        }
    }, [assignModalEco]);

    const [specialityFilter, setSpecialityFilter] = useState('');

    const role = localStorage.getItem('role');
    const location = useLocation();
    const navigate = useNavigate();

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
            if (Array.isArray(res.data)) {
                setEcos(res.data);
            } else {
                setEcos([]);
            }
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
        if (approverSequence.some(a => !a.user)) return alert('Please select all approvers');
        try {
            await API.post(`/eco/${assignModalEco._id}/assign-approvers`, { approvers: approverSequence });
            setAssignModalEco(null);
            setApproverSequence([]);
            fetchEcos();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign approvers');
        }
    };

    const filteredEcos = Array.isArray(ecos) ? ecos.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.productId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const paginatedEcos = filteredEcos.slice(0, limit);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {role === 'ENGINEER' ? 'My ECO Proposals' :
                            role === 'APPROVER' ? 'Assigned ECO Actions' :
                                'Global ECO Dashboard'}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Manage, audit, and trace engineering change orders and sequences.</p>
                </div>
                {['ENGINEER', 'ADMIN'].includes(role) && (
                    <Link to="/eco/new" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-blue-500/10 transition-all">+ Create Change Order</Link>
                )}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by Title or Product..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 rounded-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEcos.length === 0 && <p className="text-center text-slate-500 col-span-full">No ECOs found.</p>}
                {paginatedEcos.map(eco => {
                    const approverCount = eco.approvers?.length || 0;
                    
                    // Build Dynamic Steps Backbone
                    // Stage 1: New
                    // Stage 2 to 2+N-1: Review Nodes
                    // Stage 2+N: Approved
                    // Stage 3+N: Applied
                    
                    let stepIdx = 0; // Default: New
                    if (eco.status === 'REJECTED') {
                        const rejectedIndex = eco.approvers?.findIndex(a => a.status === 'REJECTED');
                        stepIdx = rejectedIndex !== -1 ? 1 + rejectedIndex : 1 + (eco.currentApproverIndex || 0);
                    } else if (eco.status === 'IN_PROGRESS') {
                        stepIdx = 1 + (eco.currentApproverIndex || 0);
                    } else if (eco.status === 'APPROVED' && !eco.applied) {
                        stepIdx = 1 + Math.max(1, approverCount); // Right after reviews
                    } else if (eco.applied) {
                        stepIdx = 2 + Math.max(1, approverCount); // Final Applied
                    }

                    // Labels mapping for the stepper dots
                    const reviewLabels = approverCount > 1 
                        ? eco.approvers.map((_, i) => `R${i + 1}`) 
                        : ['Review'];
                    const stepsLabels = ['New', ...reviewLabels, 'Approved', 'Applied'];
                    const totalSteps = stepsLabels.length;

                    return (
                        <div 
                            key={eco._id} 
                            onClick={() => navigate(`/eco/${eco._id}/compare`)} 
                            className="bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col p-5 relative group text-slate-900 justify-between h-[280px]"
                        >
                            {/* 1. Above Part: Name & Status */}
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="max-w-[70%]">
                                        <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight truncate" title={eco.productId?.name}>
                                            {eco.productId?.name || 'N/A'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate" title={eco.title}>{eco.title}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${eco.status === 'REJECTED' ? 'bg-red-50 text-red-500 border border-red-100/30' : eco.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100/30' : 'bg-blue-50 text-blue-600 border border-blue-100/30'}`}>
                                        {eco.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="bg-slate-50 border border-slate-100/80 text-slate-600 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                                        {eco.ecoType}
                                    </span>
                                    {eco.applied && <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">Applied</span>}
                                    {eco.isLocked && <span className="text-xs">🔒</span>}
                                </div>
                            </div>

                            {/* 2. Middle Part: Dynamic Node Stepper */}
                            <div className="flex-1 flex flex-col justify-center items-center w-full px-2">
                                <div className="flex flex-col items-center w-full">
                                    <div className="flex items-center justify-center w-full gap-0 relative px-2">
                                        {stepsLabels.map((label, idx) => {
                                            const isPassed = idx < stepIdx || (eco.applied && idx === totalSteps - 1);
                                            const isCurrent = idx === stepIdx && eco.status !== 'REJECTED';
                                            const isFailed = eco.status === 'REJECTED' && idx === stepIdx;

                                            const linePassed = idx < stepIdx - (eco.status === 'REJECTED' ? 1 : 0);
                                            const lineFailed = eco.status === 'REJECTED' && idx === stepIdx - 1;

                                            return (
                                                <React.Fragment key={idx}>
                                                    <div className="flex flex-col items-center relative z-10">
                                                        <div 
                                                            className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${isPassed ? 'bg-green-500 border-green-500 shadow-sm shadow-green-200' : isCurrent ? 'bg-blue-600 border-blue-600 animate-pulse scale-110' : isFailed ? 'bg-red-500 border-red-500 shadow-sm shadow-red-200' : 'bg-white border-slate-300'}`}
                                                            title={label}
                                                        />
                                                    </div>
                                                    {idx < totalSteps - 1 && (
                                                        <div className={`h-[2px] flex-1 transition-all duration-500 ease-out ${linePassed ? 'bg-green-500' : lineFailed ? 'bg-red-500' : 'bg-slate-100'}`} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between w-full px-0.5 mt-1 text-[7px] font-black text-slate-400 uppercase tracking-tight">
                                        {stepsLabels.map((label, idx) => (
                                            <span key={idx} className={`${idx > 0 && idx < totalSteps - 1 ? 'text-center' : ''}`}>
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        {/* 3. Footer Section: Actions & CreatedBy */}
                        <div className="pt-4 border-t border-slate-100/60 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                            {/* Creative Action Array */}
                            <div className="flex gap-1">
                                {role === 'ENGINEER' && !eco.isLocked && eco.status === 'NEW' && (
                                    <>
                                        <Link to={`/eco/${eco._id}/edit`} className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200/40 transition-colors">Edit</Link>
                                        <button onClick={() => handleAction(eco._id, 'submit')} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors">Submit</button>
                                    </>
                                )}
                                {role === 'APPROVER' && eco.status === 'IN_PROGRESS' && !eco.isReadyForFinalApproval && (
                                    eco.approvers?.[eco.currentApproverIndex]?.user?._id === currentUserId && (
                                        <button onClick={() => handleAction(eco._id, 'approve')} className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors shadow-sm shadow-green-500/10">Approve</button>
                                    )
                                )}
                                {role === 'ADMIN' && eco.status !== 'APPROVED' && eco.status !== 'REJECTED' && (
                                    <button onClick={() => setAssignModalEco(eco)} className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors">
                                        {eco.approvers && eco.approvers.length > 0 ? 'Edit' : 'Assign'}
                                    </button>
                                )}
                                {role === 'ADMIN' && eco.status === 'IN_PROGRESS' && eco.isReadyForFinalApproval && (
                                    <button onClick={() => handleAction(eco._id, 'apply')} className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors shadow-sm shadow-green-500/10">Apply</button>
                                )}
                            </div>

                            {/* Created By */}
                            <div className="text-[9px] font-bold text-slate-400 flex flex-col items-end">
                                <span className="text-[8px] font-normal">Prepared by</span>
                                <span className="text-slate-600">{eco.createdBy?.name || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                    )
                })}
            </div>

            {limit < filteredEcos.length && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setLimit(limit + 10)} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>Show More (10+ rows)</button>
                </div>
            )}            {assignModalEco && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setAssignModalEco(null)}>
                    <div 
                        className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-zoomIn flex flex-col max-h-[85vh] border border-slate-100" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Assign Sequential Approval Chain</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">Order of authorization for <strong>{assignModalEco.title}</strong></p>
                            </div>
                            <button onClick={() => setAssignModalEco(null)} className="text-slate-400 hover:text-red-500 font-bold transition-colors text-lg px-2">&times;</button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-5 flex-1 overflow-y-auto">
                            <p className="text-xs text-slate-500 mb-4 bg-blue-50/50 border border-blue-100/30 p-3 rounded-xl leading-relaxed">
                                Defines authorities list stage layout sequentially step-by-step accurately node flawlessly.
                            </p>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Filter authority pool by Speciality..."
                                    value={specialityFilter}
                                    onChange={e => setSpecialityFilter(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-2.5">
                                {approverSequence.map((approverId, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl relative group">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm shadow-blue-500/10">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={approverId.user || ''}
                                                onChange={(e) => {
                                                    const newSeq = [...approverSequence];
                                                    newSeq[index] = { ...newSeq[index], user: e.target.value };
                                                    setApproverSequence(newSeq);
                                                }}
                                                className="w-full bg-transparent border-0 focus:ring-0 outline-none text-xs font-semibold text-slate-700 cursor-pointer p-0"
                                            >
                                                <option value="">Select Approver</option>
                                                {users.filter(u => u.speciality?.toLowerCase().includes(specialityFilter.toLowerCase()) || !specialityFilter).map(u => (
                                                    <option key={u._id} value={u._id}>{u.name} ({u.role}{u.speciality ? ` - ${u.speciality}` : ''})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200/50">
                                            <input 
                                                type="checkbox" 
                                                checked={approverId.isRequired} 
                                                onChange={(e) => {
                                                    const newSeq = [...approverSequence];
                                                    newSeq[index] = { ...newSeq[index], isRequired: e.target.checked };
                                                    setApproverSequence(newSeq);
                                                }}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                            />
                                            <span className="text-[10px] font-bold text-slate-500">Required</span>
                                        </label>
                                        <button onClick={() => setApproverSequence(approverSequence.filter((_, i) => i !== index))} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 font-bold text-base px-1">&times;</button>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 flex items-center justify-center gap-1 py-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 text-slate-400 hover:text-blue-500 font-bold text-xs transition-all duration-200" onClick={() => setApproverSequence([...approverSequence, { user: '', isRequired: true }])}>
                                + Add Stage
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/30">
                            <button onClick={handleAssignApprovers} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all">Confirm Ordered Chain</button>
                            <button onClick={() => setAssignModalEco(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all">Cancel</button>
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
