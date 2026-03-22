import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

const EcoCreate = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        changeDescription: '',
        productId: '',
        ecoType: 'PRODUCT',
        effectiveDate: new Date().toISOString().slice(0, 16),
        versionUpdate: true
    });
    const userName = localStorage.getItem('name') || 'Current User';
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await API.get('/products');
            setProducts(res.data);
            if (res.data.length > 0) setFormData(f => ({ ...f, productId: res.data[0]._id }));
        };
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/eco/create', formData);
            if (res.data._id) {
                navigate(`/eco/${res.data._id}/edit`);
            } else {
                navigate('/eco');
            }
        } catch (err) { setMessage(err.response?.data?.message || 'Error'); }
    }

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/eco" className="flex items-center text-blue-600 hover:text-blue-500 font-bold text-sm transition-colors">
                    &larr; Back to Workflow
                </Link>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Initiate New ECO Request</h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">ECO Title *</label>
                        <input 
                            type="text" 
                            name="title" 
                            onChange={handleChange} 
                            required 
                            placeholder="e.g. Price Adjustment Q2" 
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-300"
                        />
                    </div>

                    {/* Grid: Type & Product */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">ECO Type *</label>
                            <select 
                                name="ecoType" 
                                value={formData.ecoType} 
                                onChange={handleChange} 
                                required
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white transition-all text-sm"
                            >
                                <option value="PRODUCT">PRODUCT</option>
                                <option value="BOM">BOM</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Type of ECO Selection *</label>
                            <select 
                                name="productId" 
                                onChange={handleChange} 
                                required 
                                value={formData.productId}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white transition-all text-sm"
                            >
                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Grid: Initiator & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Initiated By (Read-only)</label>
                            <input 
                                type="text" 
                                value={userName} 
                                readOnly 
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none text-sm cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Effective Date & Time</label>
                            <input
                                type="datetime-local"
                                name="effectiveDate"
                                value={formData.effectiveDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            name="versionUpdate"
                            id="versionUpdate"
                            checked={formData.versionUpdate}
                            onChange={e => setFormData({ ...formData, versionUpdate: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <label htmlFor="versionUpdate" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                            Version Update <span className="text-slate-400 font-normal">(Auto-increment on master data when DONE)</span>
                        </label>
                    </div>

                    {/* Justification */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Justification Overview *</label>
                        <textarea
                            name="changeDescription"
                            onChange={handleChange}
                            required
                            placeholder="Why is this change necessary?"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm h-24 placeholder:text-slate-300 resize-none"
                        />
                    </div>

                    {message && (
                        <p className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200/50">
                            ⚠️ {message}
                        </p>
                    )}

                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm mt-2">
                        Save Draft Request
                    </button>
                </form>
            </div>
        </div>
    );
};
export default EcoCreate;
