import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { useDialog } from '../context/DialogContext';

const BomList = () => {
    const { showConfirm, showAlert } = useDialog();
    const [boms, setBoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [selectedBom, setSelectedBom] = useState(null);
    const [versionHistory, setVersionHistory] = useState([]);
    const [activeVersion, setActiveVersion] = useState(null); // Currently selected version inside modal
    const role = localStorage.getItem('role');

    const fetchBoms = () => API.get('/bom').then(res => {
        if (Array.isArray(res.data)) {
            setBoms(res.data);
        } else {
            setBoms([]);
        }
    }).catch(console.error);

    useEffect(() => {
        fetchBoms();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Stop expansion click
        const confirmed = await showConfirm("Purge this Bill matrix baseline?");
        if (!confirmed) return;
        try {
            await API.delete(`/bom/${id}`);
            fetchBoms();
        } catch (err) { 
            showAlert(err.response?.data?.message || 'Delete failed'); 
        }
    };

    const handleRowClick = async (bom) => {
        setSelectedBom(bom);
        setActiveVersion(bom.currentVersionId); // Default to current version
        try {
            const res = await API.get(`/bom/${bom._id}/versions`);
            setVersionHistory(res.data);
            
            // If historical logs are loaded, find matching ID node
            const currentObj = res.data.find(v => v._id === bom.currentVersionId?._id);
            if (currentObj) setActiveVersion(currentObj);

        } catch (err) { console.error("History fetch failed", err); }
    };

    const filteredBoms = Array.isArray(boms) ? boms.filter(b =>
        (b.productId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const paginatedBoms = filteredBoms.slice(0, limit);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans">
            
            {/* 1. Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">BoM Master Directory</h2>
                    <p className="text-slate-400 text-xs mt-1">Manage, verify, and trace bills of materials structures flawlessly.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by Finished Product..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 rounded-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                    />
                    {role === 'ADMIN' && (
                        <Link to="/boms/new" className="flex items-center gap-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all whitespace-nowrap">
                            <span>+ Create</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. Card Grid Area */}
            {paginatedBoms.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                    No BoM baselines mapped locally found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedBoms.map(bom => (
                        <div 
                            key={bom._id} 
                            onClick={() => handleRowClick(bom)} 
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer p-6 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                        {bom.productId?.name || 'Unlinked Reference'}
                                    </h3>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${bom.isActive ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'}`}>
                                        {bom.isActive ? 'ACTIVE' : 'ARCHIVED'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Version</label>
                                        <p className="text-sm font-bold text-slate-800">v{bom.currentVersionId?.versionNumber || 1}.0</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Components</label>
                                        <p className="text-sm font-bold text-slate-800">{bom.currentVersionId?.components?.length || 0} Items</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100/80" onClick={e => e.stopPropagation()}>
                                <div className="flex gap-4">
                                    {['ENGINEER', 'ADMIN'].includes(role) && (
                                        <Link to="/eco/new" className="text-blue-600 hover:text-blue-500 text-xs font-bold transition-colors">
                                            Change Option
                                        </Link>
                                    )}
                                </div>
                                {role === 'ADMIN' && (
                                    <button onClick={(e) => handleDelete(bom._id, e)} className="text-red-400 hover:text-red-600 font-bold text-xs transition-colors">
                                        Purge
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Modal Details with Horizontal Timeline and Tables */}
            {selectedBom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedBom(null)}>
                    <div 
                        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedBom.productId?.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Bill of Materials Configuration Traces</p>
                            </div>
                            <button onClick={() => setSelectedBom(null)} className="bg-slate-50 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* 3a. Horizontal Timeline Nodes (Line + Circle Track) */}
                        <div className="relative flex items-center h-20 px-12 bg-slate-50/50 border-b border-slate-100">
                            {/* Continuous Tracking Line */}
                            <div className="absolute left-16 right-16 h-0.5 bg-slate-200/80 top-1/2 -translate-y-1/2"></div>
                            
                            <div className="relative flex items-center justify-between w-full">
                                {versionHistory.map((vh) => {
                                    const isCurrent = vh._id === selectedBom.currentVersionId?._id;
                                    const isActive = activeVersion?._id === vh._id;

                                    return (
                                        <div key={vh._id} className="relative flex flex-col items-center flex-shrink-0">
                                            {/* Circle Node Node button */}
                                            <button 
                                                onClick={() => setActiveVersion(vh)}
                                                className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-200 ${isActive ? 'bg-blue-600 border-white ring-4 ring-blue-500/20 scale-110' : 'bg-white border-slate-300 hover:border-blue-500'}`}
                                            />
                                            {/* Version Label floating below the circle dot */}
                                            <div className="absolute top-6 flex flex-col items-center">
                                                <span className={`text-[11px] font-bold whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                                                    v{vh.versionNumber}.0
                                                </span>
                                                {isCurrent && (
                                                    <span className="text-[8px] font-extrabold text-green-600 mt-0.5 whitespace-nowrap bg-green-50 px-1 rounded-full border border-green-200/30">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* 3b. Tables Detail Display Grid scroll box Area */}
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                            
                            {activeVersion ? (
                                <>
                                    {/* Components Structured Table */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-600"></span> Components Structure Details
                                        </h4>
                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                                                        <th className="px-4 py-3">Component Identifier</th>
                                                        <th className="px-4 py-3">Bounded Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeVersion.components?.length > 0 ? (
                                                        activeVersion.components.map((c, i) => (
                                                            <tr key={i} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-3 text-xs font-semibold text-slate-800">{c.componentName}</td>
                                                                <td className="px-4 py-3 text-xs text-slate-500 font-medium">{c.quantity} units</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="2" className="text-center py-5 text-xs text-slate-400">No dependencies registered in this revision.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Operations Structured Table */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Manufacturing Operations Procedures
                                        </h4>
                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                                                        <th className="px-4 py-3">WorkCenter Stage</th>
                                                        <th className="px-4 py-3">Required Time Interval</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeVersion.operations?.length > 0 ? (
                                                        activeVersion.operations.map((o, i) => (
                                                            <tr key={i} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-3 text-xs font-semibold text-slate-800">{o.workCenter}</td>
                                                                <td className="px-4 py-3 text-xs text-slate-500 font-medium">{o.time} mins</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="2" className="text-center py-5 text-xs text-slate-400">No operations registered in this revision.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center py-20 text-slate-400 text-sm">Loading version traces...</p>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setSelectedBom(null)} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all border border-slate-200/40">
                                Close Architecture View
                            </button>
                        </div>
                    </div>
                </div >
            )}
        </div>
    );
};

export default BomList;
