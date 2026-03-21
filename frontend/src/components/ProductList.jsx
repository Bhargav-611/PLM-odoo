import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, GitBranch } from 'lucide-react';

const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
        <p className="text-slate-500">No products found. Create one above to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const activeVersion = product.currentVersionId || {};
        
        return (
          <div key={product._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={product.name}>
                  {product.name}
                </h3>
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full border border-green-200">
                  <GitBranch size={12} />
                  v{activeVersion.versionNumber || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">ID: {product._id}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Sale Price</p>
                  <p className="font-semibold text-slate-800">
                    {activeVersion.salePrice !== undefined ? `$${activeVersion.salePrice.toFixed(2)}` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Cost Price</p>
                  <p className="font-semibold text-slate-800">
                    {activeVersion.costPrice !== undefined ? `$${activeVersion.costPrice.toFixed(2)}` : '--'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-3 sm:px-5 flex items-center justify-between">
              <span className={`text-xs font-medium ${product.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                {product.isActive ? '• Active Product' : '• Inactive'}
              </span>
              <Link
                to={`/product/${product._id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center transition-colors"
              >
                View Details
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
