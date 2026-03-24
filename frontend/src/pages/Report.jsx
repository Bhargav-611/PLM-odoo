import React, { useEffect, useState } from 'react';
import API from '../api/api';

const Report = () => {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, PRODUCT, BOM, ECO
    const [limit, setLimit] = useState(10);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        API.get('/report/logs')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setLogs(res.data);
                } else {
                    setLogs([]);
                }
            })
            .catch(console.error);
    }, []);

    // Filter Logic combining Search and Category Pills
    const filteredLogs = Array.isArray(logs) ? logs.filter(l => {
        const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             l.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (l.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = activeFilter === 'ALL' || l.entity.toUpperCase() === activeFilter;

        return matchesSearch && matchesCategory;
    }) : [];

    const paginatedLogs = filteredLogs.slice(0, limit);

    // Calculate Metric Rates
    const totalLogs = logs.length;
    const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
    const criticalLogs = logs.filter(l => l.action.toUpperCase() === 'DELETE').length;

    const categories = ['ALL', 'PRODUCT', 'BOM', 'ECO'];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans">
            
            {/* 1. Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Centralized System Audits</h2>
                    <p className="text-slate-400 text-xs mt-1">Natively trace and benchmark operational lifecycle triggers flawlessly.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search traces..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 rounded-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                />
            </div>

            {/* 2. Metrics Topbar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Audit Logs</span>
                    <span className="text-2xl font-black text-slate-800 mt-1">{totalLogs}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Today's Activity</span>
                    <span className="text-2xl font-black text-blue-600 mt-1">+{todayLogs}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Critical Purges</span>
                    <span className="text-2xl font-black text-red-500 mt-1">{criticalLogs}</span>
                </div>
            </div>

            {/* 3. Category Filter Pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeFilter === cat ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {cat === 'ALL' ? 'Show All' : `${cat}s`}
                    </button>
                ))}
            </div>

            {/* 4. Timeline Stream Area */}
            {paginatedLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                    No system logs matching filters acquired natively.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {paginatedLogs.map(log => {
                        const actionColor = log.action.toUpperCase() === 'CREATE' ? 'bg-green-50 text-green-700 border-green-200' :
                                           log.action.toUpperCase() === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                                           'bg-blue-50 text-blue-700 border-blue-200';

                        return (
                            <div 
                                key={log._id} 
                                onClick={() => setSelectedLog(log)} 
                                className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${actionColor} border shadow-sm`}>
                                        {log.action.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800">{log.entity}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${actionColor}`}>
                                                {log.action}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-400 mt-1 block">ID: {log.entityId}</span>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col justify-between items-end gap-1 w-full md:w-auto">
                                    <span className="text-[12px] font-bold text-slate-700">{log.user?.name || 'Inconspicuous'}</span>
                                    <span className="text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | {new Date(log.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {limit < filteredLogs.length && (
                <div className="text-center mt-6">
                    <button onClick={() => setLimit(limit + 10)} className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all">Show More (10+ trace logs)</button>
                </div>
            )}

            {/* 5. Detail Modal Overlay */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-zoomIn" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 bg-slate-50 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Audit Entry Details</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mt-5">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">TIMESTAMP</label>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">ACTION</label>
                                <p className="inline-flex mt-1"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{selectedLog.action}</span></p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">ENTITY TYPE</label>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedLog.entity}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">PERFORMED BY</label>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedLog.user?.name || 'N/A'}</p>
                            </div>
                        </div>

                        {selectedLog.metadata && (
                            <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">METADATA TRACE</label>
                                <pre className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-lg text-xs overflow-x-auto font-mono max-h-48">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setSelectedLog(null)} className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all border border-slate-200/40">
                                Close Trace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;
