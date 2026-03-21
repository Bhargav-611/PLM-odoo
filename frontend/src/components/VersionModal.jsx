import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api';

const VersionModal = ({ isOpen, onClose, productId, currentVersion, onVersionCreated }) => {
  const [formData, setFormData] = useState({
    salePrice: currentVersion?.salePrice || '',
    costPrice: currentVersion?.costPrice || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/${productId}/version`, {
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      });
      onVersionCreated(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create new version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800">Create New Version</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</div>}
          
          <div className="mb-5 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> Leaving fields blank will retain the values from the current active version (v{currentVersion?.versionNumber}).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Sale Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                placeholder={`Current: ${currentVersion?.salePrice || 'N/A'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder={`Current: ${currentVersion?.costPrice || 'N/A'}`}
              />
            </div>
            
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
              >
                {loading ? 'Creating...' : 'Create Version'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VersionModal;
