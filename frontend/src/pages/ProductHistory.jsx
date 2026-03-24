import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API, { BASE_URL } from '../api/api';

const ProductHistory = () => {
    const { id } = useParams();
    const [history, setHistory] = useState([]);
    const [selectedVer, setSelectedVer] = useState(null); // Active version right-panel viewer
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (role === 'OPERATOR') {
            window.location.href = '/products';
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await API.get(`/products/${id}/history`);
                setHistory(res.data);
                if (res.data.length > 0) {
                    setSelectedVer(res.data[0]); // Default to latest version
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [id, role]);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans">
            
            {/* 1. Header Area */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-5">
                <Link to="/products" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-500 font-bold text-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span>Directory</span>
                </Link>
                <div className="h-4 w-px bg-slate-200"></div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product Audit Trail</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Chronological Lifecycle Traces flawlessly.</p>
                </div>
            </div>

            {/* 2. Split Stream Section Area */}
            {history.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                    No historical bounds identified for structural parameters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* 2a. Left Sidebar: Circles Timeline Track list triggers */}
                    <div className="md:col-span-3 border-r pr-4 border-slate-100/80">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Revision History</h4>
                        <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-6">
                            {history.map((v) => {
                                const isActive = selectedVer?._id === v._id;
                                return (
                                    <div 
                                        key={v._id} 
                                        onClick={() => setSelectedVer(v)} 
                                        onMouseEnter={() => setSelectedVer(v)} // Hover support
                                        className="relative group cursor-pointer"
                                    >
                                        {/* Circle Node Node button */}
                                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-200 ${isActive ? 'bg-blue-600 shadow-sm shadow-blue-500/30 ring-4 ring-blue-500/10 scale-110' : 'bg-slate-300'}`}></div>
                                        
                                        <div className={`pl-2 py-1 rounded-lg transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                            <span className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                                                {v.versionLabel || `v${v.versionNumber}.0`}
                                            </span>
                                            <span className="block text-[10px] text-slate-400 mt-0.5">
                                                {new Date(v.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 2b. Right Column: Big Details Deck Container overlay */}
                    <div className="md:col-span-9">
                        {selectedVer ? (
                            <div className="relative group animate-fadeIn">
                                {/* 3D Stack Card Backdrops (High Visibility Slate fanning) */}
                                <div className="absolute inset-0 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm translate-y-3 translate-x-3 group-hover:translate-y-5 group-hover:translate-x-5 transition-all duration-300 z-0"></div>
                                <div className="absolute inset-0 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm translate-y-1.5 translate-x-1.5 group-hover:translate-y-2.5 group-hover:translate-x-2.5 transition-all duration-300 z-10"></div>

                                {/* Main Card Content Layout box container */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative z-20 hover:shadow-md transition-all duration-300 flex flex-col gap-6">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Version {selectedVer.versionLabel || `${selectedVer.versionNumber}.0`}</h3>
                                            <p className="text-xs text-slate-400 mt-1">Audit Signature Details</p>
                                        </div>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold border ${selectedVer.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200/40' : 'bg-slate-100 text-slate-400 border-slate-200/40'}`}>
                                            {selectedVer.status === 'ACTIVE' ? 'Active' : 'Archived'}
                                        </span>
                                    </div>

                                    {/* Sub-grid containing details baseline configurations metrics flaws */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Pricing Details setup */}
                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/60">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Pricing Base Structure</h5>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-medium">Sale Price</span>
                                                    <span className="font-bold text-slate-800">${selectedVer.salePrice?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-t border-slate-200/30 pt-2">
                                                    <span className="text-slate-500 font-medium">Cost Price</span>
                                                    <span className="font-bold text-slate-600">${selectedVer.costPrice?.toFixed(2) || '0.00'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attachments and Data Assets layouts flaws */}
                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/60 flex flex-col justify-between">
                                            <div>
                                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Primary Assets</h5>
                                                {selectedVer.image ? (
                                                    <a href={`${BASE_URL}/products/image-proxy?key=${encodeURIComponent(selectedVer.image)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100/40 hover:bg-blue-100 transition-colors">
                                                        <span>&#128444; Media Gallery</span>
                                                    </a>
                                                ) : (
                                                    <p className="text-xs text-slate-400">No Image baseline.</p>
                                                )}
                                            </div>

                                            {selectedVer.attachments?.length > 0 && (
                                                <div className="border-t border-slate-200/40 mt-3 pt-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Documents ({selectedVer.attachments.length})</label>
                                                    {selectedVer.attachments.map((a, i) => (
                                                        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors mt-1 items-center">
                                                            &#128142; <span className="truncate">{a.name}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer trace layout signatures flawless */}
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                                        <span>Inject Time: {new Date(selectedVer.createdAt).toLocaleString()}</span>
                                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Key: {selectedVer._id.substring(selectedVer._id.length - 8)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center py-20 text-slate-400 text-sm">Select node to trace values...</p>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default ProductHistory;
