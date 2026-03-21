import React, { useEffect, useState } from 'react';
import API from '../api/api';

const Report = () => {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        API.get('/report/logs').then(res => setLogs(res.data)).catch(console.error);
    }, []);

    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedLogs = filteredLogs.slice(0, limit);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: '#111827' }}>Centralized Action Audits</h2>

            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <input
                    type="text"
                    placeholder="Search by Action, Entity, or User..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Chronological Timestamp</th>
                            <th>Bounded Action Trigger</th>
                            <th>Entity Vector</th>
                            <th>Executor JWT Trace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>No system logs acquired natively yet.</td></tr>}
                        {paginatedLogs.map(log => (
                            <tr key={log._id} onClick={() => setSelectedLog(log)} style={{ cursor: 'pointer' }}>
                                <td style={{ color: '#6b7280', fontSize: '13px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td><span className="badge badge-active">{log.action}</span></td>
                                <td style={{ fontWeight: '500' }}>{log.entity} <br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>{log.entityId}</span></td>
                                <td style={{ fontWeight: '500' }}>{log.user?.name} <br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>Role: {log.user?.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {limit < filteredLogs.length && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setLimit(limit + 10)} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>Show More (10+ rows)</button>
                </div>
            )}

            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="modal-close" onClick={() => setSelectedLog(null)}>&times;</span>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Audit Entry Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>TIMESTAMP</label>
                                <p>{new Date(selectedLog.timestamp).toLocaleString()}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>ACTION</label>
                                <p><span className="badge badge-active">{selectedLog.action}</span></p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>ENTITY TYPE</label>
                                <p>{selectedLog.entity}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>ENTITY ID</label>
                                <p style={{ fontSize: '11px', wordBreak: 'break-all' }}>{selectedLog.entityId}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>PERFORMED BY</label>
                                <p>{selectedLog.user?.name} ({selectedLog.user?.role})</p>
                            </div>
                        </div>

                        {selectedLog.metadata && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>METADATA TRACE</label>
                                <pre style={{ marginTop: '10px', background: '#f9fafb', padding: '10px', borderRadius: '4px', fontSize: '12px', overflowX: 'auto' }}>
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <button onClick={() => setSelectedLog(null)} className="btn" style={{ background: '#f3f4f6' }}>Close Trace</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Report;
