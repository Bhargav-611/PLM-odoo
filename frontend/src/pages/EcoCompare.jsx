import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';

const EcoCompare = () => {
    const { id } = useParams();
    const [compareData, setCompareData] = useState(null);
    const [showChangedOnly, setShowChangedOnly] = useState(false);
    const [showFull, setShowFull] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get(`/eco/${id}/compare`)
            .then(res => setCompareData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Comparison logic failed securely.'));
    }, [id]);

    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red', fontWeight: 'bold' }}>{error}</div>;
    if (!compareData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Processing Matrix Intersections...</div>;

    const diffs = showChangedOnly ? compareData.diff.filter(d => d.changed) : compareData.diff;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/eco" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none', fontWeight: '500' }}>&larr; Workflow</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>ECO Impact Analysis (Diff)</h2>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h4>Justification / Description</h4>
                <p style={{ color: '#4b5563' }}>{compareData.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                        <input type="checkbox" checked={showChangedOnly} onChange={() => setShowChangedOnly(!showChangedOnly)} /> Show Only Mutations
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                        <input type="checkbox" checked={showFull} onChange={() => setShowFull(!showFull)} /> Mount Complete JSON Dump
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
                            {compareData.newDraft.components.map((nc, idx) => {
                                const oldC = compareData.oldProduct?.components?.find(c => c.componentName === nc.componentName);
                                const oldQty = oldC ? oldC.quantity : 0;
                                const newQty = nc.quantity;
                                const isAdded = newQty > oldQty;
                                const isRemoved = newQty < oldQty;
                                return (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '600' }}>{nc.componentName}</td>
                                        <td>
                                            {isAdded ? <span style={{ color: '#046c4e', fontWeight: 'bold' }}>{newQty} 🟢</span> : isRemoved ? <span style={{ color: '#9b1c1c', fontWeight: 'bold' }}>{newQty} 🔴</span> : <span>{newQty}</span>}
                                        </td>
                                        <td style={{ color: '#6b7280' }}>{oldQty}</td>
                                    </tr>
                                );
                            })}
                            {compareData.oldProduct?.components?.filter(oc => !compareData.newDraft.components.some(nc => nc.componentName === oc.componentName)).map((oc, idx) => (
                                <tr key={`old-${idx}`}>
                                    <td style={{ fontWeight: '600' }}>{oc.componentName}</td>
                                    <td><span style={{ color: '#9b1c1c', fontWeight: 'bold' }}>0 🔴</span></td>
                                    <td style={{ color: '#6b7280' }}>{oc.quantity}</td>
                                </tr>
                            ))}
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
                            {compareData.newDraft.operations.map((nop, idx) => {
                                const oldOp = compareData.oldProduct?.operations?.find(o => String(o.workCenter) === String(nop.workCenter));
                                const oldTime = oldOp ? oldOp.time : 0;
                                const newTime = nop.time;
                                const isAdded = newTime > oldTime;
                                const isRemoved = newTime < oldTime;
                                return (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '600' }}>{nop.workCenter}</td>
                                        <td>
                                            {isAdded ? <span style={{ color: '#046c4e', fontWeight: 'bold' }}>{newTime} min 🟢</span> : isRemoved ? <span style={{ color: '#9b1c1c', fontWeight: 'bold' }}>{newTime} min 🔴</span> : <span>{newTime} min</span>}
                                        </td>
                                        <td style={{ color: '#6b7280' }}>{oldTime} min</td>
                                    </tr>
                                );
                            })}
                            {compareData.oldProduct?.operations?.filter(oldOp => !compareData.newDraft.operations.some(nop => String(nop.workCenter) === String(oldOp.workCenter))).map((oldOp, idx) => (
                                <tr key={`old-op-${idx}`}>
                                    <td style={{ fontWeight: '600' }}>{oldOp.workCenter}</td>
                                    <td><span style={{ color: '#9b1c1c', fontWeight: 'bold' }}>0 min 🔴</span></td>
                                    <td style={{ color: '#6b7280' }}>{oldOp.time} min</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showFull && (
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <div className="card" style={{ flex: 1, overflowX: 'auto', background: '#111827', color: '#10b981' }}>
                        <h4 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Active Product Signature</h4>
                        <pre style={{ fontSize: '12px' }}>{JSON.stringify(compareData.oldProduct, null, 2)}</pre>
                    </div>
                    <div className="card" style={{ flex: 1, overflowX: 'auto', background: '#111827', color: '#3b82f6' }}>
                        <h4 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Proposed Sandbox Dump</h4>
                        <pre style={{ fontSize: '12px' }}>{JSON.stringify(compareData.newDraft, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EcoCompare;
