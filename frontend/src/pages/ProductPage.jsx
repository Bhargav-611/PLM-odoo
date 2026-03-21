import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import VersionModal from '../components/VersionModal';
import api from '../api';
import { ArrowLeft, Box, CheckCircle2, Archive, PlusCircle, History } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const [productRes, historyRes] = await Promise.all([
        api.get(`/${id}`),
        api.get(`/${id}/history`)
      ]);
      setProduct(productRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      setError('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleVersionCreated = () => {
    fetchProductData(); // Refresh everything
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
          <p className="font-semibold text-lg">{error || 'Product not found'}</p>
          <Link to="/" className="inline-block mt-4 text-blue-600 underline hover:text-blue-800">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
            <Box size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Management</h1>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle size={18} />
          Create New Version
        </button>
      </div>
      
      <div className="mb-10">
        <ProductDetail product={product} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <History size={20} className="text-slate-500" /> Version History
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse cursor-default">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600">Version #</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Sale Price</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Cost Price</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Date Logged</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((ver) => (
                  <tr key={ver._id} className={`hover:bg-slate-50 transition-colors ${ver.status === 'ACTIVE' ? 'bg-green-50/30' : ''}`}>
                    <td className="p-4 font-medium text-slate-800">
                      v{ver.versionNumber}
                      {ver.status === 'ACTIVE' && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-green-700 bg-green-200 px-2 py-0.5 rounded-full">Current</span>}
                    </td>
                    <td className="p-4 text-slate-600">${ver.salePrice?.toFixed(2) || 'N/A'}</td>
                    <td className="p-4 text-slate-600">${ver.costPrice?.toFixed(2) || 'N/A'}</td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(ver.createdAt).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {ver.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 text-sm font-medium">
                          <CheckCircle2 size={16} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                          <Archive size={16} /> Archived
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VersionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productId={id}
        currentVersion={product.currentVersionId}
        onVersionCreated={handleVersionCreated}
      />
    </div>
  );
};

export default ProductPage;
