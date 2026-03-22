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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/eco" className="flex items-center text-blue-600 hover:text-blue-500 font-bold text-sm transition-colors">
                    &larr; Back to Workflow
                </Link>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Sandbox Editor: {eco.title}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Header Information Panel */}
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ECO Type</span>
                        <p className="text-sm font-bold text-slate-700">{eco.ecoType}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Product</span>
                        <p className="text-sm font-bold text-slate-700">{products.find(p => p._id === eco.productId)?.name || 'N/A'}</p>
                    </div>
                </div>

                {eco.ecoType === 'PRODUCT' ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Product Level Modifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Target Sale Price ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={changesDraft.salePrice || ''} 
                                    onChange={e => setChangesDraft({ ...changesDraft, salePrice: Number(e.target.value) })} 
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Target Cost Price ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={changesDraft.costPrice || ''} 
                                    onChange={e => setChangesDraft({ ...changesDraft, costPrice: Number(e.target.value) })} 
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Components Override */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Components Override List</h4>
                                <button type="button" onClick={addComp} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                                    + Add Component
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(changesDraft.components || []).map((c, i) => (
                                    <div key={i} className="flex gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={c.componentName || ''}
                                                onChange={e => updComp(i, 'componentName', e.target.value)}
                                                placeholder="Component Name"
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={c.quantity} 
                                                onChange={e => updComp(i, 'quantity', Number(e.target.value))} 
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <button type="button" onClick={() => delComp(i)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors border border-red-100/50">
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                                {(changesDraft.components || []).length === 0 && (
                                    <p className="text-center text-slate-400 text-xs py-4">No component modifications submitted.</p>
                                )}
                            </div>
                        </div>

                        {/* Operations Override */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Operations Override List</h4>
                                <button type="button" onClick={addOp} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                                    + Add Operation
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(changesDraft.operations || []).map((o, i) => (
                                    <div key={i} className="flex gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                        <div className="flex-1">
                                            <input 
                                                type="text" 
                                                value={o.workCenter} 
                                                onChange={e => updOp(i, 'workCenter', e.target.value)} 
                                                placeholder="Work Center / Operation"
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={o.time} 
                                                onChange={e => updOp(i, 'time', Number(e.target.value))} 
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                                                placeholder="Time (min)"
                                            />
                                        </div>
                                        <button type="button" onClick={() => delOp(i)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors border border-red-100/50">
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                                {(changesDraft.operations || []).length === 0 && (
                                    <p className="text-center text-slate-400 text-xs py-4">No operation modifications submitted.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm">
                        Save Draft Changes
                    </button>
                    <button type="button" onClick={handleLock} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-blue-500/10 transition-all text-sm">
                        Save & Lock Submission
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EcoEdit;
