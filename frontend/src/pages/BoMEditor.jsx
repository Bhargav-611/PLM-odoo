import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, getBoMsByProduct, updateDraft, sendForApproval } from '../api';
import { Plus, Trash2, ArrowLeft, Save, Send, AlertCircle } from 'lucide-react';

export default function BoMEditor() {
  const { productId, bomId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [bom, setBom] = useState({ components: [], operations: [], status: 'Draft' });
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await getProducts();
        setAllProducts(prodRes.data);
        const p = prodRes.data.find(x => x._id === productId);
        setProduct(p);

        if (bomId) {
          const bomRes = await getBoMsByProduct(productId);
          const b = bomRes.data.find(x => x._id === bomId);
          if (b) setBom(b);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, bomId]);

  const addComponent = () => {
    setBom({ ...bom, components: [...bom.components, { name: '', quantity: 1 }] });
  };

  const removeComponent = (index) => {
    const updated = [...bom.components];
    updated.splice(index, 1);
    setBom({ ...bom, components: updated });
  };

  const updateComponent = (index, field, value) => {
    const updated = [...bom.components];
    if (field === 'quantity') {
      value = Math.max(1, parseInt(value) || 1);
    }
    if (field === 'name' && value.toLowerCase() === product.name.toLowerCase()) {
      alert("A product cannot be its own component.");
      return;
    }
    updated[index][field] = value;
    setBom({ ...bom, components: updated });
  };

  const addOperation = () => {
    setBom({ ...bom, operations: [...bom.operations, { name: '', time: 0, workCenter: '' }] });
  };

  const removeOperation = (index) => {
    const updated = [...bom.operations];
    updated.splice(index, 1);
    setBom({ ...bom, operations: updated });
  };

  const updateOperation = (index, field, value) => {
    const updated = [...bom.operations];
    updated[index][field] = value;
    setBom({ ...bom, operations: updated });
  };

  const handleSave = async () => {
    try {
      await updateDraft(bomId, bom);
      alert('Draft saved successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    }
  };

  const handleSend = async () => {
    try {
      if (!window.confirm('Send this BoM for approval?')) return;
      await updateDraft(bomId, bom);
      await sendForApproval(bomId);
      navigate('/bom');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send for approval');
    }
  };

  if (loading) return <div>Loading...</div>;

  const isEditable = bom.status === 'Draft' && role === 'ENGINEER';
  const statusLabel = bom.status === 'Under Review' ? '🔎 Under Review' : bom.status;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/bom')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{product?.name}</h1>
            <p className="text-slate-500">BoM Version: {bom.version} • Status: <span className={`font-semibold ${
              bom.status === 'Active' ? 'text-green-600' :
              bom.status === 'Draft' ? 'text-amber-600' :
              bom.status === 'Under Review' ? 'text-blue-600' :
              'text-slate-500'
            }`}>{statusLabel}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditable && (
            <>
              <button onClick={handleSave} className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </button>
              <button onClick={handleSend} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" /> Send for Approval
              </button>
            </>
          )}
        </div>
      </div>

      {!isEditable && (
        <div className={`p-4 rounded-lg flex items-start gap-3 border ${
          bom.status === 'Active' ? 'bg-green-50 border-green-200 text-green-800' :
          bom.status === 'Under Review' ? 'bg-blue-50 border-blue-200 text-blue-800' :
          'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">
              {bom.status === 'Active' ? 'Active BoM — Read Only' :
               bom.status === 'Under Review' ? 'Under Review — Awaiting Approver Decision' :
               'Read Only Mode'}
            </p>
            <p className="text-sm">This BoM ({bom.status}) cannot be edited directly. {role === 'ENGINEER' && bom.status === 'Active' && 'Use "New Draft Version" from the BoM list to create an editable copy.'}</p>
          </div>
        </div>
      )}

      {/* Components Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold">Components</h2>
          {isEditable && (
            <button onClick={addComponent} className="text-sm text-blue-600 font-medium flex items-center hover:underline">
              <Plus className="w-4 h-4 mr-1" /> Add Component
            </button>
          )}
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b">
                <th className="pb-3 w-2/3">Product</th>
                <th className="pb-3 px-4">Quantity</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bom.components.map((comp, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 border-slate-300"
                      value={comp.name}
                      onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                      disabled={!isEditable}
                      placeholder="Type component name..."
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                      value={comp.quantity}
                      onChange={(e) => updateComponent(idx, 'quantity', parseInt(e.target.value))}
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="py-4 text-right">
                    {isEditable && (
                      <button 
                        onClick={() => removeComponent(idx)} 
                        className="text-red-500 hover:text-red-700 p-2 flex items-center gap-1 ml-auto font-medium"
                        title="Remove Component"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bom.components.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-400">No components added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operations Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold">Operations</h2>
          {isEditable && (
            <button onClick={addOperation} className="text-sm text-blue-600 font-medium flex items-center hover:underline">
              <Plus className="w-4 h-4 mr-1" /> Add Operation
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {bom.operations.map((op, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 border rounded-xl bg-slate-50/30">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Operation Name</label>
                      <input
                        className="w-full p-2 border rounded-lg disabled:bg-slate-50"
                        value={op.name}
                        onChange={(e) => updateOperation(idx, 'name', e.target.value)}
                        disabled={!isEditable}
                        placeholder="e.g. PCB Assembly"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Work Center</label>
                      <input
                        className="w-full p-2 border rounded-lg disabled:bg-slate-50"
                        value={op.workCenter}
                        onChange={(e) => updateOperation(idx, 'workCenter', e.target.value)}
                        disabled={!isEditable}
                        placeholder="e.g. Line A"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Time (minutes)</label>
                    <input
                      type="number"
                      className="w-32 p-2 border rounded-lg disabled:bg-slate-50"
                      value={op.time}
                      onChange={(e) => updateOperation(idx, 'time', parseInt(e.target.value))}
                      disabled={!isEditable}
                    />
                  </div>
                </div>
                {isEditable && (
                  <button onClick={() => removeOperation(idx)} className="mt-7 text-red-400 hover:text-red-600 p-2 border border-red-100 rounded-lg bg-red-50 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {bom.operations.length === 0 && (
              <div className="py-8 text-center text-slate-400">No operations defined.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
