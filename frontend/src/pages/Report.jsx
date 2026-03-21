import React, { useEffect, useState } from 'react';
import API from '../api/api';

const Report = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        API.get('/report/logs').then(res => setLogs(res.data)).catch(console.error);
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: '#111827' }}>Centralized Action Audits</h2>
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
                        {logs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>No system logs acquired natively yet.</td></tr>}
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td style={{ color: '#6b7280', fontSize: '13px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td><span className="badge badge-active">{log.action}</span></td>
                                <td style={{ fontWeight: '500' }}>{log.entity} <br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>{log.entityId}</span></td>
                                <td style={{ fontWeight: '500' }}>{log.user?.name} <br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>Role: {log.user?.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Report;
