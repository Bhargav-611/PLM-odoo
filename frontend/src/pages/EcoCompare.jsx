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

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/eco" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none', fontWeight: '500' }}>&larr; Workflow</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>ECO Impact Analysis & Timeline</h2>
            </div>

            {/* Sequential Approval Timeline */}
            <div className="card" style={{ marginBottom: '20px', padding: '0', overflow: 'hidden' }}>
                <div style={{ background: '#f9fafb', padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>Approval Sequence Timeline</h4>
                    <span className={`badge ${eco.status === 'REJECTED' ? 'badge-archived' : 'badge-active'}`}>{eco.status}</span>
                </div>

                <div style={{ padding: '20px' }}>
                    {(!eco.approvers || eco.approvers.length === 0) ? (
                        <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Admin has not assigned an approval sequence yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {eco.approvers.map((appr, idx) => {
                                const isCurrent = eco.currentApproverIndex === idx && eco.status === 'IN_PROGRESS';
                                const isPassed = eco.currentApproverIndex > idx || eco.status === 'APPROVED';
                                const isRejected = appr.status === 'REJECTED';

                                let styleBadge = { background: '#f3f4f6', color: '#6b7280' }; // Wait
                                let icon = '⏳';
                                let statusText = 'Pending';

                                if (isPassed || appr.status === 'APPROVED') {
                                    styleBadge = { background: '#def7ec', color: '#046c4e' };
                                    icon = '✅';
                                    statusText = `Approved ${appr.approvedAt ? new Date(appr.approvedAt).toLocaleDateString() : ''}`;
                                } else if (isRejected || (eco.status === 'REJECTED' && !isPassed)) {
                                    styleBadge = { background: '#fde8e8', color: '#9b1c1c' };
                                    icon = '❌';
                                    statusText = isRejected ? `Rejected ${appr.rejectedAt ? new Date(appr.rejectedAt).toLocaleDateString() : ''}` : 'Cancelled';
                                } else if (isCurrent) {
                                    styleBadge = { background: '#e1effe', color: '#1e429f', border: '1px solid #c3ddfd' };
                                    icon = '🔄';
                                    statusText = 'Awaiting Action';
                                }

                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: styleBadge.background, color: styleBadge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1, padding: '10px 15px', borderRadius: '6px', background: isCurrent ? '#fdf8f6' : '#fff', border: isCurrent ? '1px solid #fed7aa' : '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <strong>{appr.user?.name || 'Unknown User'}</strong> <span style={{ color: '#6b7280', fontSize: '13px' }}>({appr.user?.role})</span>
                                            </div>
                                            <div style={{ fontSize: '14px', ...styleBadge, padding: '2px 8px', borderRadius: '4px', border: styleBadge.border || 'none' }}>
                                                {icon} {statusText}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Final Node */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: eco.status === 'APPROVED' ? '#046c4e' : '#f3f4f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    ★
                                </div>
                                <div style={{ flex: 1, padding: '10px 15px', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong>Admin Final Execution</strong>
                                    </div>
                                    <div style={{ fontSize: '14px', color: eco.status === 'APPROVED' ? '#046c4e' : '#6b7280' }}>
                                        {eco.status === 'APPROVED' ? `✅ Executed ${eco.effectiveDate ? new Date(eco.effectiveDate).toLocaleDateString() : ''}` : (eco.isReadyForFinalApproval && eco.status === 'IN_PROGRESS' ? 'Awaiting Action' : 'Locked')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {eco.rejectionReason && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#fde8e8', borderLeft: '4px solid #f05252', borderRadius: '4px' }}>
                            <h5 style={{ margin: '0 0 5px 0', color: '#9b1c1c' }}>Rejection Details</h5>
                            <p style={{ margin: 0, color: '#771d1d', fontSize: '14px' }}><strong>Reason:</strong> {eco.rejectionReason}</p>
                            <p style={{ margin: '5px 0 0 0', color: '#771d1d', fontSize: '13px' }}><strong>By:</strong> {eco.rejectedBy?.name || 'Unknown'}</p>
                        </div>
                    )}

                    {/* Action Controls */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                        {isMyTurn && (
                            <button onClick={() => handleAction('approve')} className="btn btn-success" style={{ fontWeight: 'bold' }}>Approve Checkpoint</button>
                        )}
                        {canReject && (
                            <button onClick={() => {
                                const reason = prompt('Please enter rejection reason. This permanently cancels the ECO.');
                                if (reason) {
                                    API.post(`/eco/${eco._id}/reject`, { reason })
                                        .then(() => fetchCompare())
                                        .catch(err => alert(err.response?.data?.message || 'Error'));
                                }
                            }} className="btn btn-danger" style={{ fontWeight: 'bold' }}>Reject & Cancel</button>
                        )}
                        {role === 'ADMIN' && eco.status === 'IN_PROGRESS' && eco.isReadyForFinalApproval && (
                            <button onClick={() => handleAction('apply')} className="btn btn-success" style={{ fontWeight: 'bold' }}>Confirm & Execute Protocol</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h4>Justification / Description</h4>
                <p style={{ color: '#4b5563' }}>{compareData.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                        <input type="checkbox" checked={showChangedOnly} onChange={() => setShowChangedOnly(!showChangedOnly)} /> Show Only Mutations
                    </label>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Parameter Node</th>
                            <th>Active Baseline</th>
                            <th>Proposed Draft</th>
                            <th>Delta Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diffs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No tracked divergences identified.</td></tr>}
                        {diffs.filter(d => d.field !== 'components' && d.field !== 'operations').map(d => (
                            <tr key={d.field}>
                                <td style={{ fontWeight: '600' }}>{d.field}</td>
                                <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{JSON.stringify(d.old)}</td>
                                <td>
                                    {d.changed ? <span style={{ fontFamily: 'monospace', color: '#9b1c1c', fontWeight: 'bold' }}>{JSON.stringify(d.new)} 🔴</span> : <span style={{ fontFamily: 'monospace', color: '#111827' }}>{JSON.stringify(d.new)}</span>}
                                </td>
                                <td>
                                    {d.changed ? <span className="badge" style={{ background: '#fde8e8', color: '#9b1c1c' }}>Mutated</span> : <span className="badge" style={{ background: '#def7ec', color: '#046c4e' }}>Identical</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {compareData.newDraft.components && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
                    <h4 style={{ padding: '16px', margin: 0, borderBottom: '1px solid #e5e7eb', background: '#F9FAFB' }}>BOM DIFF: Components</h4>
                    <table className="table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Product / Material</th>
                                <th>Proposed Draft (v2)</th>
                                <th>Active Baseline (v1)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let newComps = compareData.newDraft.components || [];
                                let oldComps = compareData.oldProduct?.components || [];
                                let rowsToRender = [];

                                newComps.forEach(nc => {
                                    const oldC = oldComps.find(c => c.componentName === nc.componentName);
                                    const oldQty = oldC ? oldC.quantity : 0;
                                    const newQty = nc.quantity;
                                    const changed = oldQty !== newQty;
                                    if (!showChangedOnly || changed) rowsToRender.push({ name: nc.componentName, oldQty, newQty });
                                });

                                oldComps.forEach(oc => {
                                    const existsNew = newComps.some(nc => nc.componentName === oc.componentName);
                                    if (!existsNew) {
                                        rowsToRender.push({ name: oc.componentName, oldQty: oc.quantity, newQty: 0 });
                                    }
                                });

                                return rowsToRender.length === 0 ?
                                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#6b7280', padding: '15px' }}>No component mutations identified.</td></tr> :
                                    rowsToRender.map((row, idx) => {
                                        const isAdded = row.newQty > row.oldQty;
                                        const isRemoved = row.newQty < row.oldQty;
                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: '600' }}>{row.name}</td>
                                                <td>
                                                    {isAdded ? <span style={{ color: '#046c4e', fontWeight: 'bold' }}>{row.newQty} 🟢</span> : isRemoved ? <span style={{ color: '#9b1c1c', fontWeight: 'bold' }}>{row.newQty} 🔴</span> : <span>{row.newQty}</span>}
                                                </td>
                                                <td style={{ color: '#6b7280' }}>{row.oldQty}</td>
                                            </tr>
                                        );
                                    });
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {compareData.newDraft.operations && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
                    <h4 style={{ padding: '16px', margin: 0, borderBottom: '1px solid #e5e7eb', background: '#F9FAFB' }}>BOM DIFF: Operations</h4>
                    <table className="table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Work Center</th>
                                <th>Proposed Draft (v2)</th>
                                <th>Active Baseline (v1)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let newOps = compareData.newDraft.operations || [];
                                let oldOps = compareData.oldProduct?.operations || [];
                                let rowsToRender = [];

                                newOps.forEach(nop => {
                                    const oldOp = oldOps.find(o => String(o.workCenter) === String(nop.workCenter));
                                    const oldTime = oldOp ? oldOp.time : 0;
                                    const newTime = nop.time;
                                    const changed = oldTime !== newTime;
                                    if (!showChangedOnly || changed) rowsToRender.push({ name: nop.workCenter, oldTime, newTime });
                                });

                                oldOps.forEach(oop => {
                                    const existsNew = newOps.some(nop => String(nop.workCenter) === String(oop.workCenter));
                                    if (!existsNew) {
                                        rowsToRender.push({ name: oop.workCenter, oldTime: oop.time, newTime: 0 });
                                    }
                                });

                                return rowsToRender.length === 0 ?
                                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#6b7280', padding: '15px' }}>No operations mutations identified.</td></tr> :
                                    rowsToRender.map((row, idx) => {
                                        const isAdded = row.newTime > row.oldTime;
                                        const isRemoved = row.newTime < row.oldTime;
                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: '600' }}>{row.name}</td>
                                                <td>
                                                    {isAdded ? <span style={{ color: '#046c4e', fontWeight: 'bold' }}>{row.newTime} min 🟢</span> : isRemoved ? <span style={{ color: '#9b1c1c', fontWeight: 'bold' }}>{row.newTime} min 🔴</span> : <span>{row.newTime} min</span>}
                                                </td>
                                                <td style={{ color: '#6b7280' }}>{row.oldTime} min</td>
                                            </tr>
                                        );
                                    });
                            })()}
                        </tbody>
                    </table>
                </div>
            )}


        </div>
    );
};
export default EcoCompare;
