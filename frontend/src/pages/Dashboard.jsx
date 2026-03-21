import React, { useEffect, useState } from 'react';
import { getProducts } from '../api';
import { Package, CheckCircle, Clock, Shield } from 'lucide-react';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
  }, []);

  const stats = [
    { name: 'Active Products', value: products.filter(p => p.status === 'ACTIVE').length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'System Role', value: role, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">{stat.name}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="p-6 flex flex-wrap gap-4">
          {role === 'ENGINEER' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create New BoM Draft</button>
          )}
          {role === 'APPROVER' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View Pending Approvals</button>
          )}
          <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">View Product Catalog</button>
        </div>
      </div>
    </div>
  );
}
