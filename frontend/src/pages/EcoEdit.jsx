import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

const EcoEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [eco, setEco] = useState(null);
    const [changesDraft, setChangesDraft] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchEco = async () => {
            try {
                const res = await API.get('/eco');
                const match = res.data.find(e => e._id === id);
                setEco(match);

                const compRes = await API.get(`/eco/${id}/compare`);
                setChangesDraft(compRes.data.newDraft);

                const pRes = await API.get('/products');
                setProducts(pRes.data);
            } catch (e) { console.error(e); }
        };
        fetchEco();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/eco/${id}/edit`, { changesDraft });
            navigate('/eco');
        } catch (err) { alert(err.response?.data?.message || 'Error updating draft'); }
    };

    const handleLock = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/eco/${id}/edit`, { changesDraft });
            await API.post(`/eco/${id}/submit`);
            navigate('/eco');
        } catch (err) { alert(err.response?.data?.message || 'Error executing request lock sequence'); }
    };

    if (!eco || !changesDraft) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Active Sandbox Editor...</div>;

    // Component Handlers
    const addComp = () => setChangesDraft(f => ({ ...f, components: [...(f.components || []), { componentName: '', quantity: 1 }] }));
    const delComp = (idx) => setChangesDraft(f => ({ ...f, components: f.components.filter((_, i) => i !== idx) }));
    const updComp = (idx, field, value) => {
        const comps = [...changesDraft.components];
        comps[idx][field] = value;
        setChangesDraft({ ...changesDraft, components: comps });
    };

    // Operation Handlers
    const addOp = () => setChangesDraft(f => ({ ...f, operations: [...(f.operations || []), { workCenter: '', time: 10 }] }));
    const delOp = (idx) => setChangesDraft(f => ({ ...f, operations: f.operations.filter((_, i) => i !== idx) }));
    const updOp = (idx, field, value) => {
        const ops = [...changesDraft.operations];
        ops[idx][field] = value;
        setChangesDraft({ ...changesDraft, operations: ops });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/eco" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none', fontWeight: '500' }}>&larr; Workflow</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>Sandbox Edit: {eco.title}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {eco.ecoType === 'PRODUCT' ? (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px', color: '#111827' }}>Product Level Modifications</h4>
                        <div className="form-group">
                            <label>Target Sale Price ($)</label>
                            <input type="number" step="0.01" value={changesDraft.salePrice || ''} onChange={e => setChangesDraft({ ...changesDraft, salePrice: Number(e.target.value) })} />
                        </div>
                        <div className="form-group">
                            <label>Target Cost Price ($)</label>
                            <input type="number" step="0.01" value={changesDraft.costPrice || ''} onChange={e => setChangesDraft({ ...changesDraft, costPrice: Number(e.target.value) })} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, color: '#111827' }}>Components Override List</h4>
                                <button type="button" onClick={addComp} className="btn" style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', fontWeight: 'bold' }}>+ Add Row</button>
                            </div>
                            {(changesDraft.components || []).map((c, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        value={c.componentName || ''}
                                        onChange={e => updComp(i, 'componentName', e.target.value)}
                                        placeholder="Component Name"
                                        style={{ flex: 2, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                    />
                                    <input type="number" min="1" value={c.quantity} onChange={e => updComp(i, 'quantity', Number(e.target.value))} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                    <button type="button" onClick={() => delComp(i)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0 12px', borderRadius: '4px', fontWeight: 'bold' }}>X</button>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, color: '#111827' }}>Operations Override List</h4>
                                <button type="button" onClick={addOp} className="btn" style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', fontWeight: 'bold' }}>+ Add Row</button>
                            </div>
                            {(changesDraft.operations || []).map((o, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input type="text" value={o.workCenter} onChange={e => updOp(i, 'workCenter', e.target.value)} style={{ flex: 2, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                    <input type="number" min="1" value={o.time} onChange={e => updOp(i, 'time', Number(e.target.value))} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                    <button type="button" onClick={() => delOp(i)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0 12px', borderRadius: '4px', fontWeight: 'bold' }}>X</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <button type="submit" className="btn" style={{ flex: 1, padding: '12px', fontSize: '15px', background: '#e5e7eb', color: '#111827', fontWeight: 'bold' }}>Save Draft Changes</button>
                    <button type="button" onClick={handleLock} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold' }}>Save & Lock Submission</button>
                </div>
            </form>
        </div>
    );
};

export default EcoEdit;
