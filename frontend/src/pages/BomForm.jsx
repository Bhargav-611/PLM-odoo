import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

const BomForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        productId: '',
        components: [],
        operations: []
    });

    useEffect(() => {
        API.get('/products').then(res => {
            setProducts(res.data);
            if (res.data.length > 0) setFormData(f => ({ ...f, productId: res.data[0]._id }));
        });
    }, []);

    const addComponent = () => setFormData(f => ({ ...f, components: [...f.components, { componentName: '', quantity: 1 }] }));
    const removeComponent = (idx) => setFormData(f => ({ ...f, components: f.components.filter((_, i) => i !== idx) }));

    const updateComponent = (idx, field, value) => {
        const comps = [...formData.components];
        comps[idx][field] = value;
        setFormData({ ...formData, components: comps });
    };

    const addOperation = () => setFormData(f => ({ ...f, operations: [...f.operations, { workCenter: '', time: 10 }] }));
    const removeOperation = (idx) => setFormData(f => ({ ...f, operations: f.operations.filter((_, i) => i !== idx) }));

    const updateOperation = (idx, field, value) => {
        const ops = [...formData.operations];
        ops[idx][field] = value;
        setFormData({ ...formData, operations: ops });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/bom/create', formData);
            navigate('/boms');
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/boms" style={{ color: '#0052cc', marginRight: '15px', textDecoration: 'none', fontWeight: '500' }}>&larr; Return</Link>
                <h2 style={{ margin: 0, color: '#111827' }}>Create Master Bill of Materials Reference</h2>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Top-Level Product (Assembly) *</label>
                    <select value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} required>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '32px', background: '#F9FAFB', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0 }}>Components Sequence</h4>
                        <button type="button" onClick={addComponent} className="btn" style={{ background: '#fff', border: '1px solid #0052cc', color: '#0052cc' }}>+ Add Sub-Component</button>
                    </div>
                    {formData.components.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                value={c.componentName}
                                onChange={e => updateComponent(i, 'componentName', e.target.value)}
                                placeholder="Component Name (e.g. iPhone 17 Part)"
                                style={{ flex: 2, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                required
                            />
                            <input type="number" min="1" value={c.quantity} onChange={e => updateComponent(i, 'quantity', Number(e.target.value))} placeholder="Qty" style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
                            <button type="button" onClick={() => removeComponent(i)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '32px', background: '#F9FAFB', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0 }}>Operations Timeline</h4>
                        <button type="button" onClick={addOperation} className="btn" style={{ background: '#fff', border: '1px solid #0052cc', color: '#0052cc' }}>+ Add Station Logic</button>
                    </div>
                    {formData.operations.map((o, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="text" value={o.workCenter} onChange={e => updateOperation(i, 'workCenter', e.target.value)} placeholder="Work Center" style={{ flex: 2, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
                            <input type="number" min="1" value={o.time} onChange={e => updateOperation(i, 'time', Number(e.target.value))} placeholder="Time (min)" style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} required />
                            <button type="button" onClick={() => removeOperation(i)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>Enforce BoM Logic Sequence</button>
            </form>
        </div>
    );
};

export default BomForm;
