import React, { useEffect, useState } from 'react';
import API, { BASE_URL } from '../api/api';
import { Link } from 'react-router-dom';
import { useDialog } from '../context/DialogContext';

const ProductList = () => {
    const { showConfirm, showAlert } = useDialog();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const role = localStorage.getItem('role');

    const fetchProducts = async () => {
        try {
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Stop expansion click
        const confirmed = await showConfirm("Are you sure? This will purge the entire product architecture and all versions!");
        if (!confirmed) return;
        try {
            await API.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Delete failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fallback images for premium UI representation
    const fallbackImages = [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600"
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans">

            {/* 1. Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Master Directory</h2>
                    <p className="text-slate-400 text-xs mt-1">Manage, audit, and trace system assets and lifecycle stages.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 rounded-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                    />
                    {role === 'ADMIN' && (
                        <Link to="/products/new" className="flex items-center gap-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all whitespace-nowrap">
                            <span>+ Create</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. Card Grid Area */}
            {(filteredProducts.length === 0 && role !== 'ADMIN') ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                    No active products found matching conditions.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {role === 'ADMIN' && (
                        <Link to="/products/new" className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex flex-col items-center justify-center p-6 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1.5 transition-all duration-300 h-full min-h-[300px] cursor-pointer group">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="mt-4 text-sm font-bold tracking-wide">Create New Product</span>
                        </Link>
                    )}
                    {filteredProducts.map((p, index) => {
                        const v = p.currentVersionId;

                        return (
                            <div
                                key={p._id}
                                onClick={() => setSelectedProduct(p)}
                                className="bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col relative"
                            >
                                {/* Wrapper Image with overlay */}
                                <div className="h-48 relative overflow-hidden bg-slate-100">
                                    <img
                                        src={v?.image ? `${BASE_URL}/products/image-proxy?key=${encodeURIComponent(v.image)}` : fallbackImages[index % fallbackImages.length]}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm">
                                        {v?.versionLabel || `v${v?.versionNumber || '1.0'}`}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Content Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                                {p.name}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${v?.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-slate-100 text-slate-400'}`}>
                                                {v?.status === 'ACTIVE' ? 'Active' : 'Draft'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sale Price</label>
                                                <p className="text-sm font-bold text-slate-800">${v?.salePrice?.toFixed(2) || '0.00'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Components</label>
                                                <p className="text-sm font-bold text-slate-800">{v?.components?.length || 0} Items</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons at standard footer position layout */}
                                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100/80" onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-4">
                                            {role !== 'OPERATOR' && (
                                                <Link to={`/products/${p._id}/history`} className="text-blue-600 hover:text-blue-500 text-xs font-bold transition-colors">
                                                    History
                                                </Link>
                                            )}
                                            {['ENGINEER', 'ADMIN'].includes(role) && (
                                                <Link to={`/eco?search=${p.name}`} className="text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors">
                                                    ECO Changes
                                                </Link>
                                            )}
                                            {role === 'ADMIN' && (
                                                <button onClick={(e) => handleDelete(p._id, e)} className="text-red-400 hover:text-red-600 font-bold text-xs transition-colors">
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Absolute Version Bubbles (Conditional bleeding) */}
                                {v?.versionNumber > 1 && (
                                    <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 absolute -bottom-4 left-0 w-full flex items-center justify-center gap-2 z-30">
                                        <div className="bg-slate-900/90 backdrop-blur-md shadow-2xl border border-slate-800 rounded-full px-4 py-1.5 flex items-center gap-2">
                                            {['v1.0', 'v2.0'].map((mockV, i) => (
                                                <div key={i} className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-black border border-cyan-500/40 cursor-pointer hover:bg-cyan-500 hover:text-slate-900 transition-all duration-200">
                                                    {mockV}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* 3. Smooth Container Expansion Modal View (Click functionality overlay overlap) */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedProduct(null)}>
                    <div
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-zoomIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-white/80 rounded-full p-1.5 shadow-md text-slate-400 hover:text-slate-900 transition-colors z-20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="h-52 relative">
                            <img
                                src={selectedProduct.currentVersionId?.image ? `${BASE_URL}/products/image-proxy?key=${encodeURIComponent(selectedProduct.currentVersionId.image)}` : fallbackImages[products.indexOf(selectedProduct) % fallbackImages.length]}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-6">
                                <h3 className="text-xl font-bold text-white tracking-wide">{selectedProduct.name}</h3>
                                <p className="text-white/80 text-xs">Version ID: {selectedProduct.currentVersionId?.versionLabel || 'Initial Framework'}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">SALE PRICE</label>
                                    <p className="text-lg font-bold text-slate-800">${selectedProduct.currentVersionId?.salePrice?.toFixed(2)}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">COST PRICE</label>
                                    <p className="text-lg font-bold text-slate-800">${selectedProduct.currentVersionId?.costPrice?.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">COMPONENTS STRUCTURE</label>
                                <p className="text-sm text-slate-600 mt-1">
                                    {selectedProduct.currentVersionId?.components?.length || 0} active components tracked in master bill of materials.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                {role !== 'OPERATOR' && (
                                    <Link to={`/products/${selectedProduct._id}/history`} className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 transition-all">
                                        Version History
                                    </Link>
                                )}
                                <button onClick={() => setSelectedProduct(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all">
                                    Close Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
