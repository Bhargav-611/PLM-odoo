import React, { useEffect, useState } from 'react';
import { getProducts, getBoMsByProduct, createDraft } from '../api';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Package, Loader2 } from 'lucide-react';

export default function BoMList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
  }, []);

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setLoading(true);
    try {
      const res = await getBoMsByProduct(product._id);
      setBoms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrLoadDraft = async () => {
    if (!selectedProduct) return;
    try {
      // createDraft now returns existing draft if one exists, so this is safe
      const res = await createDraft({ productId: selectedProduct._id, createdBy: role });
      navigate(`/bom/edit/${selectedProduct._id}/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create or load draft');
    }
  };

  // Apply RBAC filter: Operations can only see Active BoMs
  const visibleBoms = role === 'OPERATIONS'
    ? boms.filter(b => b.status === 'Active')
    : boms;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Product List */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search products..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
          {products.map(product => (
            <button
              key={product._id}
              onClick={() => handleProductSelect(product)}
              className={`w-full p-4 text-left flex items-center transition-colors hover:bg-slate-50 ${selectedProduct?._id === product._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
            >
              <Package className={`w-10 h-10 p-2 rounded-lg mr-4 ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`} />
              <div className="flex-1">
                <div className="font-semibold">{product.name}</div>
                <div className="text-xs text-slate-500">Version {product.version} • {product.status}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* BoM Versions for Selected Product */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedProduct ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 h-64 flex flex-col items-center justify-center text-slate-400">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a product to view BoM versions</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                <p className="text-slate-500">Manage Bill of Materials history and versions</p>
              </div>
              {role === 'ENGINEER' && selectedProduct.status === 'ACTIVE' && (
                <button
                  onClick={handleCreateOrLoadDraft}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {boms.some(b => b.status === 'Draft') ? 'Open Existing Draft' : 'New Draft Version'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : boms.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500">No BoMs found for this product.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Version</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Modified</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleBoms.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">
                      {role === 'OPERATIONS' ? 'No Active BoM found for this product.' : 'No BoMs found.'}
                    </td></tr>
                  ) : visibleBoms.map(bom => (
                    <tr key={bom._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer" onClick={() => navigate(`/bom/edit/${selectedProduct._id}/${bom._id}`)}>
                        {bom.version}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          bom.status === 'Active' ? 'bg-green-100 text-green-700' :
                          bom.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                          bom.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                          bom.status === 'Archived' ? 'bg-slate-100 text-slate-500' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bom.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(bom.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {bom.status === 'Under Review' && role === 'APPROVER' && (
                            <button
                              onClick={() => navigate(`/bom/compare/${bom._id}`)}
                              className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100"
                            >
                              Review &amp; Approve
                            </button>
                          )}
                          {bom.status === 'Draft' && role === 'ENGINEER' && (
                            <button
                              onClick={() => navigate(`/bom/edit/${selectedProduct._id}/${bom._id}`)}
                              className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded border border-amber-200 hover:bg-amber-100"
                            >
                              Edit Draft
                            </button>
                          )}
                          {(bom.status === 'Active' || bom.status === 'Archived' || role === 'OPERATIONS') && (
                            <button
                              onClick={() => navigate(`/bom/edit/${selectedProduct._id}/${bom._id}`)}
                              className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded border border-slate-200 hover:bg-slate-100"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
