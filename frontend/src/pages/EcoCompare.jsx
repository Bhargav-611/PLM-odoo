import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const EcoCompare = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [compareData, setCompareData] = useState(null);
    const [showChangedOnly, setShowChangedOnly] = useState(false);
    const [error, setError] = useState('');
    const [myUserId, setMyUserId] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const role = localStorage.getItem('role');

    useEffect(() => {
        // Decode JWT to find our own userId to detect if it's our turn
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setMyUserId(payload.user.id);
            } catch (e) { console.error('Token parse err', e); }
        }

        fetchCompare();
    }, [id]);

    const fetchCompare = () => {
        API.get(`/eco/${id}/compare`)
            .then(res => setCompareData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Comparison logic failed securely.'));
    };

    const handleAction = async (actionStr) => {
        try {
            await API.post(`/eco/${id}/${actionStr}`);
            fetchCompare(); // Refresh the timeline data
        } catch (err) {
            alert(err.response?.data?.message || 'Error executing action');
        }
    };

    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red', fontWeight: 'bold' }}>{error}</div>;
    if (!compareData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Processing Matrix Intersections...</div>;

    const diffs = showChangedOnly ? compareData.diff.filter(d => d.changed) : compareData.diff;
    const eco = compareData.eco;

    // Check if it's currently our turn to approve
    let isMyTurn = false;
    if (eco.status === 'IN_PROGRESS' && eco.currentApproverIndex < eco.approvers.length) {
        const currentA = eco.approvers[eco.currentApproverIndex];
        if ((currentA.user._id || currentA.user) === myUserId) {
            isMyTurn = true;
        }
    }

    // Admins and Approvers in sequence can trigger reject logic when IN_PROGRESS
    const canReject = eco.status === 'IN_PROGRESS' && (role === 'ADMIN' || eco.approvers.some(a => (a.user._id || a.user) === myUserId));

    let canSkip = false;
    if (eco.status === 'IN_PROGRESS' && eco.currentApproverIndex < eco.approvers.length) {
        const currentA = eco.approvers[eco.currentApproverIndex];
        if (currentA.isRequired === false) {
            const creatorId = eco.createdBy?._id || eco.createdBy;
            if (role === 'ADMIN' || creatorId === myUserId) {
                canSkip = true;
            }
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans bg-slate-50/10 min-h-screen">
            {/* 1. Header with Breadcrumb */}
            <div className="flex items-center gap-3 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100/80 hover:text-blue-600 transition-all text-slate-400">
                    &larr;
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">ECO Impact Analysis</h2>
                    <p className="text-xs text-slate-400 mt-1">Timeline tracker and parametric divergence comparison deck.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* 2. Left Column: Timeline & Actions Details */}
                <div className="space-y-6">
                    {/* Timeline Tracker Deck */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100/80">
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">Approval Sequence</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${eco.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200/50' : 'bg-green-50 text-green-700 border border-green-200/50'}`}>
                                {eco.status}
                            </span>
                        </div>

                        {(!eco.approvers || eco.approvers.length === 0) ? (
                            <p className="text-xs text-slate-400 font-semibold text-center py-4 bg-slate-50/50 rounded-xl">No assigned sequence yet.</p>
                        ) : (
                            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100/80">
                                {eco.approvers.map((appr, idx) => {
                                    const isCurrent = eco.currentApproverIndex === idx && eco.status === 'IN_PROGRESS';
                                    const isPassed = eco.currentApproverIndex > idx || eco.status === 'APPROVED';
                                    const isRejected = appr.status === 'REJECTED';

                                    let bgBall = 'bg-slate-100 text-slate-400';
                                    let icon = '⏳';
                                    if (isPassed || appr.status === 'APPROVED') { bgBall = 'bg-green-100 text-green-600'; icon = '✅'; }
                                    else if (isRejected || (eco.status === 'REJECTED' && !isPassed)) { bgBall = 'bg-red-100 text-red-600'; icon = '❌'; }
                                    else if (isCurrent) { bgBall = 'bg-blue-600 text-white shadow-md shadow-blue-500/20'; icon = '🔄'; }

                                    return (
                                        <div key={idx} className="flex gap-4 items-start relative">
                                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all ${bgBall}`}>
                                                {isCurrent ? icon : idx + 1}
                                            </div>
                                            <div className={`flex-1 p-3 rounded-xl border transition-all ${isCurrent ? 'bg-blue-50/30 border-blue-200/60 shadow-sm' : 'bg-white border-slate-100'}`}>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-bold text-slate-800">{appr.user?.name || 'Unknown'}</span>
                                                        {!appr.isRequired && (
                                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md ml-1.5">Optional</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">({appr.user?.role})</span>
                                                </div>
                                                <p className={`text-[10px] mt-1 font-semibold ${isPassed ? 'text-green-600' : isRejected ? 'text-red-500' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    {isPassed ? `Approved` : isRejected ? `Rejected` : isCurrent ? 'Awaiting Action' : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Final Node */}
                                <div className="flex gap-4 items-start relative">
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10 transition-all ${eco.status === 'APPROVED' ? 'bg-green-600 text-white shadow-md shadow-green-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                        ★
                                    </div>
                                    <div className={`flex-1 p-3 rounded-xl border border-slate-100 bg-white`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-800">Final Execution</span>
                                        </div>
                                        <p className="text-[10px] mt-1 text-slate-400 font-semibold">
                                            {eco.status === 'APPROVED' ? '✅ Executed' : (eco.isReadyForFinalApproval && eco.status === 'IN_PROGRESS' ? 'Awaiting Action' : 'Locked')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {eco.rejectionReason && (
                            <div className="mt-4 p-3 bg-red-50/80 border border-red-100/50 rounded-xl">
                                <h5 className="text-[11px] font-black text-red-700">Rejection Details</h5>
                                <p className="text-[10px] mt-1 text-red-600 leading-relaxed"><strong>Reason:</strong> {eco.rejectionReason}</p>
                                <p className="text-[9px] mt-0.5 text-red-500"><strong>By:</strong> {eco.rejectedBy?.name || 'Unknown'}</p>
                            </div>
                        )}

                        {/* Actions Inside Card Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                            {isMyTurn && (
                                <button onClick={() => handleAction('approve')} className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl py-2 text-xs font-bold shadow-md shadow-green-500/10 transition-all">Approve Checkpoint</button>
                            )}
                            {canSkip && (
                                <button onClick={() => handleAction('skip')} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white rounded-xl py-2 text-xs font-bold shadow-md shadow-yellow-500/10 transition-all">Skip Approver</button>
                            )}
                            {canReject && (
                                <button onClick={() => setIsRejectModalOpen(true)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2 text-xs font-bold transition-all">Reject & Cancel</button>
                            )}
                            {role === 'ADMIN' && eco.status === 'IN_PROGRESS' && eco.isReadyForFinalApproval && (
                                <button onClick={() => handleAction('apply')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 text-xs font-bold shadow-md shadow-blue-500/10 transition-all">Confirm & Execute</button>
                            )}
                        </div>
                    </div>

                    {/* Justification Node */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 flex flex-col">
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">Justification Description</h4>
                        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-xl flex-1">{compareData.description || 'No description provided.'}</p>
                        <label className="inline-flex items-center gap-2 cursor-pointer mt-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" checked={showChangedOnly} onChange={() => setShowChangedOnly(!showChangedOnly)} className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" /> Only Mutations
                        </label>
                    </div>
                </div>

                {/* 3. Right Column: Diff Trace tables cards deck */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Parameters list card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-slate-50/50 p-4 border-b border-slate-100/80">
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">Parametric Mutation Trace</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Parameter Node</th>
                                        <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Active Baseline</th>
                                        <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Proposed Draft</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {diffs.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-xs text-slate-400">No tracked divergences identified.</td></tr>}
                                    {diffs.filter(d => d.field !== 'components' && d.field !== 'operations').map(d => (
                                        <tr key={d.field} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-4 py-3 text-xs font-bold text-slate-700 capitalize">{d.field}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-slate-400">{typeof d.old === 'object' ? JSON.stringify(d.old) : String(d.old)}</td>
                                            <td className="px-4 py-3 text-xs font-mono">
                                                {d.changed ? (
                                                    <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                                                        {typeof d.new === 'object' ? JSON.stringify(d.new) : String(d.new)} 🔴
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-800">{typeof d.new === 'object' ? JSON.stringify(d.new) : String(d.new)}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BOM Components Card */}
                    {compareData.newDraft.components && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-slate-50/50 p-4 border-b border-slate-100/80">
                                <h4 className="text-sm font-black text-slate-800 tracking-tight">BOM DIFF: Components Trace</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Product / Material</th>
                                            <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Proposed Draft (v2)</th>
                                            <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Active Baseline (v1)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(() => {
                                            let newComps = compareData.newDraft.components || [];
                                            let oldComps = compareData.oldProduct?.components || [];
                                            let rowsToRender = [];
                                            newComps.forEach(nc => {
                                                const oldC = oldComps.find(c => c.componentName === nc.componentName);
                                                const oldQty = oldC ? oldC.quantity : 0; const newQty = nc.quantity;
                                                const changed = oldQty !== newQty;
                                                if (!showChangedOnly || changed) rowsToRender.push({ name: nc.componentName, oldQty, newQty });
                                            });
                                            oldComps.forEach(oc => {
                                                const existsNew = newComps.some(nc => nc.componentName === oc.componentName);
                                                if (!existsNew) rowsToRender.push({ name: oc.componentName, oldQty: oc.quantity, newQty: 0 });
                                            });
                                            return rowsToRender.length === 0 ? 
                                                <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No mutations identified.</td></tr> :
                                                rowsToRender.map((row, idx) => {
                                                    const isAdded = row.newQty > row.oldQty; const isRemoved = row.newQty < row.oldQty;
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{row.name}</td>
                                                            <td className="px-4 py-3 text-xs font-bold">
                                                                {isAdded ? <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">+{row.newQty} 🟢</span> : isRemoved && row.newQty === 0 ? <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Removed 🔴</span> : isRemoved ? <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">{row.newQty} 🔴</span> : <span className="text-slate-800">{row.newQty}</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs font-semibold text-slate-400">{row.oldQty}</td>
                                                        </tr>
                                                    );
                                                });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* BOM Operations Card */}
                    {compareData.newDraft.operations && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-slate-50/50 p-4 border-b border-slate-100/80">
                                <h4 className="text-sm font-black text-slate-800 tracking-tight">BOM DIFF: Operations Trace</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Work Center</th>
                                            <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Proposed Draft (v2)</th>
                                            <th className="px-4 py-3 text-[11px] font-black text-slate-400 tracking-wide">Active Baseline (v1)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(() => {
                                            let newOps = compareData.newDraft.operations || [];
                                            let oldOps = compareData.oldProduct?.operations || [];
                                            let rowsToRender = [];
                                            newOps.forEach(nop => {
                                                const oldOp = oldOps.find(o => String(o.workCenter) === String(nop.workCenter));
                                                const oldTime = oldOp ? oldOp.time : 0; const newTime = nop.time;
                                                const changed = oldTime !== newTime;
                                                if (!showChangedOnly || changed) rowsToRender.push({ name: nop.workCenter, oldTime, newTime });
                                            });
                                            oldOps.forEach(oop => {
                                                const existsNew = newOps.some(nop => String(nop.workCenter) === String(oop.workCenter));
                                                if (!existsNew) rowsToRender.push({ name: oop.workCenter, oldTime: oop.time, newTime: 0 });
                                            });
                                            return rowsToRender.length === 0 ? 
                                                <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No mutations identified.</td></tr> :
                                                rowsToRender.map((row, idx) => {
                                                    const isAdded = row.newTime > row.oldTime; const isRemoved = row.newTime < row.oldTime;
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{row.name}</td>
                                                            <td className="px-4 py-3 text-xs font-bold">
                                                                {isAdded ? <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">+{row.newTime} min 🟢</span> : isRemoved && row.newTime === 0 ? <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Removed 🔴</span> : isRemoved ? <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">{row.newTime} min 🔴</span> : <span className="text-slate-800">{row.newTime} min</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs font-semibold text-slate-400">{row.oldTime} min</td>
                                                        </tr>
                                                    );
                                                });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {isRejectModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-scale-in">
                            <h3 className="text-base font-bold text-slate-900 mb-2">Reject & Cancel ECO</h3>
                            <p className="text-xs text-slate-500 mb-4">You are about to cancel this proposal. Please specify the reason for rejection below Node flawlessly.</p>
                            
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Type rejection reason here..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs font-semibold text-slate-700 bg-slate-50 min-h-[100px] resize-none"
                            />
                            
                            <div className="mt-4 flex gap-3">
                                <button 
                                    onClick={() => {
                                        if (!rejectionReason.trim()) return alert('Reason required');
                                        API.post(`/eco/${eco._id}/reject`, { reason: rejectionReason })
                                            .then(() => {
                                                setIsRejectModalOpen(false);
                                                setRejectionReason('');
                                                fetchCompare();
                                            })
                                            .catch(err => alert(err.response?.data?.message || 'Error executing action'));
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-red-500/10 transition-all"
                                >
                                    Confirm Rejection
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsRejectModalOpen(false);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};
export default EcoCompare;
