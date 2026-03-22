import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { useDialog } from '../context/DialogContext';

const BomForm = () => {
    const navigate = useNavigate();
    const { showAlert } = useDialog();
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

    const addComponent = () => setFormData(f => ({ ...f, components: [...f.components, { componentName: '', quantity: 1, unit: 'pcs' }] }));
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
        } catch (err) { 
            showAlert(err.response?.data?.message || err.message); 
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/boms" className="flex items-center text-blue-600 hover:text-blue-500 font-bold text-sm transition-colors">
                    &larr; Return to BoMs
                </Link>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Create Master Bill of Materials Reference</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Top-Level Details */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Top-Level Product (Assembly) *</label>
                            <select 
                                value={formData.productId} 
                                onChange={e => setFormData({ ...formData, productId: e.target.value })} 
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white transition-all text-sm" 
                                required
                            >
                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Initial Version</label>
                            <input 
                                type="text" 
                                value="v1.0" 
                                readOnly 
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none text-sm cursor-not-allowed" 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Components Sequence */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Components Sequence</h4>
                        <button type="button" onClick={addComponent} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                            + Add Sub-Component
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.components.map((c, i) => (
                            <div key={i} className="flex gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={c.componentName}
                                        onChange={e => updateComponent(i, 'componentName', e.target.value)}
                                        placeholder="Component Name"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        min="1"
                                        value={c.quantity}
                                        onChange={e => updateComponent(i, 'quantity', Number(e.target.value))}
                                        placeholder="Qty"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <select
                                        value={c.unit || 'pcs'}
                                        onChange={e => updateComponent(i, 'unit', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                    >
                                        <option value="pcs">pcs</option>
                                        <option value="kg">kg</option>
                                        <option value="m">m</option>
                                        <option value="l">l</option>
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeComponent(i)} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors border border-red-100/50">
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {formData.components.length === 0 && (
                            <p className="text-center text-slate-400 text-xs py-4">No components described yet.</p>
                        )}
                    </div>
                </div>

                {/* 3. Operations Timeline */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Operations Timeline</h4>
                        <button type="button" onClick={addOperation} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                            + Add Station Logic
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.operations.map((o, i) => (
                            <div key={i} className="flex gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        value={o.workCenter} 
                                        onChange={(e) => updateOperation(i, 'workCenter', e.target.value)} 
                                        placeholder="Work Center / Operation" 
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white" 
                                        required 
                                    />
                                </div>
                                <div className="w-36">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={o.time} 
                                        onChange={e => updateOperation(i, 'time', Number(e.target.value))} 
                                        placeholder="Time (min)" 
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white" 
                                        required 
                                    />
                                </div>
                                <button type="button" onClick={() => removeOperation(i)} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors border border-red-100/50">
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {formData.operations.length === 0 && (
                            <p className="text-center text-slate-400 text-xs py-4">No operations described yet.</p>
                        )}
                    </div>
                </div>

                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm mt-2">
                    Enforce BoM Logic Sequence
                </button>
            </form>
        </div>
    );
};

export default BomForm;
