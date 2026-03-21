import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompare, approveBoM, rejectBoM } from '../api';
import { Check, X, ArrowLeft, History } from 'lucide-react';

export default function BoMCompare() {
  const { bomId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    getCompare(bomId).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, [bomId]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to APPROVE this change?')) return;
    try {
      await approveBoM(bomId);
      navigate('/bom');
    } catch (err) {
      alert(err.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this BoM and send back to draft?')) return;
    try {
      await rejectBoM(bomId);
      navigate('/bom');
    } catch (err) {
      alert(err.response?.data?.error || 'Rejection failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading comparison...</div>;

  const { current, previous, diff } = data;

  const diffBg = (status) => {
    if (status === 'added') return 'bg-green-100 border-green-200';
    if (status === 'increased') return 'bg-green-50 border-green-100';
    if (status === 'removed') return 'bg-red-100 border-red-200';
    if (status === 'reduced' || status === 'modified') return 'bg-red-50 border-red-100';
    return 'bg-slate-50 border-slate-100';
  };

  const diffBadge = (status) => {
    if (status === 'added' || status === 'increased') return 'bg-green-600';
    if (status === 'removed' || status === 'reduced' || status === 'modified') return 'bg-red-600';
    return 'bg-slate-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/bom')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">BoM Comparison</h1>
            <p className="text-slate-500">Reviewing <strong>{current.version}</strong> vs <strong>{previous ? previous.version : 'Initial Version'}</strong></p>
          </div>
        </div>
        {role === 'APPROVER' && current.status === 'Under Review' && (
          <div className="flex gap-3">
            <button onClick={handleReject} className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
              <X className="w-4 h-4 mr-2" /> Reject
            </button>
            <button onClick={handleApprove} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" /> Approve
            </button>
          </div>
        )}
      </div>

      {/* Side-by-Side Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Version */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm opacity-70">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-500">Previous: {previous?.version || 'None'}</h2>
            <History className="w-5 h-5 text-slate-400" />
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Components</h3>
              {!previous ? (
                <p className="text-slate-400 italic text-sm">No previous version.</p>
              ) : previous.components.length === 0 ? (
                <p className="text-slate-400 italic text-sm">No components.</p>
              ) : (
                <ul className="space-y-2">
                  {previous.components.map((c, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="bg-slate-200 px-3 py-1 rounded-full text-xs font-bold">{c.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Operations</h3>
              {!previous || previous.operations.length === 0 ? (
                <p className="text-slate-400 italic text-sm">No operations.</p>
              ) : (
                <ul className="space-y-2">
                  {previous.operations.map((o, i) => (
                    <li key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                      <div className="font-medium text-slate-700">{o.name}</div>
                      <div className="text-slate-500 text-xs mt-1">{o.workCenter} · {o.time} min</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Proposed Version with Diff Highlights */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ring-2 ring-blue-400/30">
          <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/60 flex justify-between items-center">
            <h2 className="font-semibold text-blue-700">Proposed: {current.version}</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">Under Review</span>
          </div>
          <div className="p-6 space-y-6">
            {/* Component Diff */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Component Diff</h3>
              {diff.components.length === 0 ? (
                <p className="text-slate-400 italic text-sm">No component changes.</p>
              ) : (
                <ul className="space-y-2">
                  {diff.components.map((c, i) => (
                    <li key={i} className={`flex justify-between items-center border p-3 rounded-xl text-sm ${diffBg(c.status)} ${c.status === 'removed' ? 'line-through opacity-70' : ''}`}>
                      <div>
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase font-semibold">
                          {c.status} · {c.oldQty} → {c.newQty}
                        </div>
                      </div>
                      <span className={`${diffBadge(c.status)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {c.newQty || '✕'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Operation Diff */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Operation Diff</h3>
              {diff.operations.length === 0 ? (
                <p className="text-slate-400 italic text-sm">No operation changes.</p>
              ) : (
                <ul className="space-y-2">
                  {diff.operations.map((o, i) => (
                    <li key={i} className={`border p-3 rounded-xl text-sm ${diffBg(o.status)}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800">{o.name}</span>
                        <span className={`${diffBadge(o.status)} text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
                          {o.status}
                        </span>
                      </div>
                      {o.status === 'modified' && (
                        <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                          {o.old?.time !== o.new?.time && (
                            <div>⏱ Time: <span className="line-through text-red-500">{o.old?.time} min</span> → <span className="text-green-600">{o.new?.time} min</span></div>
                          )}
                          {o.old?.workCenter !== o.new?.workCenter && (
                            <div>📍 Work Center: <span className="line-through text-red-500">{o.old?.workCenter}</span> → <span className="text-green-600">{o.new?.workCenter}</span></div>
                          )}
                        </div>
                      )}
                      {(o.status === 'added' || o.status === 'unchanged') && o.new && (
                        <div className="text-xs text-slate-500 mt-1">{o.new.workCenter} · {o.new.time} min</div>
                      )}
                      {o.status === 'removed' && o.old && (
                        <div className="text-xs text-slate-500 mt-1 line-through">{o.old.workCenter} · {o.old.time} min</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 text-white p-5 rounded-xl flex flex-wrap gap-8 justify-center shadow-lg">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-sm">Added / Increased</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm">Removed / Reduced</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-sm">Modified</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div><span className="text-sm">Unchanged</span></div>
      </div>
    </div>
  );
}
