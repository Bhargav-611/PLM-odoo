import React from 'react';

const ProductDetail = ({ product }) => {
  if (!product) return null;

  const currentVersion = product.currentVersionId || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{product.name}</h2>
          <p className="text-sm text-slate-500 mt-1">Product ID: {product._id}</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full mb-1">
            Current Version: v{currentVersion.versionNumber || 'N/A'}
          </span>
          <p className="text-xs text-slate-500">
            Last Updated: {new Date(product.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
          Active Version Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Sale Price</p>
            <p className="text-2xl font-bold text-slate-800">
              {currentVersion.salePrice !== undefined ? `$${currentVersion.salePrice.toFixed(2)}` : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Cost Price</p>
            <p className="text-2xl font-bold text-slate-800">
              {currentVersion.costPrice !== undefined ? `$${currentVersion.costPrice.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
