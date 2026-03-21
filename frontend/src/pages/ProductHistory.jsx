import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';

const ProductHistory = () => {
    const { id } = useParams();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await API.get(`/products/${id}/history`);
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [id]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/products" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none', fontWeight: '500' }}>&larr; Directory</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>Product Audit Trail</h2>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Version Label</th>
                            <th>Status Matrix</th>
                            <th>Pricing Baseline</th>
                            <th>Blob Assets</th>
                            <th>Audit Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(v => (
                            <tr key={v._id}>
                                <td style={{ fontWeight: 'bold' }}>
                                    {v.versionLabel || `v${v.versionNumber}`}
                                </td>
                                <td>
                                    <span className={`badge ${v.status === 'ACTIVE' ? 'badge-active' : 'badge-archived'}`}>
                                        {v.status === 'ACTIVE' ? 'Active' : 'Archived'}
                                    </span>
                                </td>
                                <td>
                                    <div><strong>Sale:</strong> ${v.salePrice?.toFixed(2)}</div>
                                    <div style={{ color: '#6b7280', fontSize: '13px' }}><strong>Cost:</strong> ${v.costPrice?.toFixed(2)}</div>
                                </td>
                                <td>
                                    {v.image ? <a href={v.image} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '4px 8px', background: '#e1effe', color: '#1c64f2', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>&#128444; Primary Media</a> : <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>}

                                    {v.attachments?.length > 0 && <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                                        {v.attachments.map((a, i) => (
                                            <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '12px', color: '#4b5563', textDecoration: 'none', marginBottom: '4px' }}>&#128142; {a.name}</a>
                                        ))}
                                    </div>}
                                </td>
                                <td style={{ fontSize: '12px', color: '#6b7280' }}>
                                    <div><strong>Inject:</strong> {new Date(v.createdAt).toLocaleDateString()}</div>
                                    <div><strong>Key:</strong> {v._id.substring(v._id.length - 6)}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {history.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No historical bounds identified for structural parameters.</div>}
            </div>
        </div>
    );
};
export default ProductHistory;
