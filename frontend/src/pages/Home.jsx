import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import api from '../api';
import { PackageSearch } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/');
      setProducts(response.data.data);
    } catch (err) {
      setError('Failed to fetch products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductCreated = (newProduct) => {
    // We fetch again to ensure populated currentVersionId is intact
    // Or we could append directly if we trust the return payload shape
    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <PackageSearch size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage PLM product lifecycles and historical versioning.</p>
        </div>
      </div>
      
      <ProductForm onProductCreated={handleProductCreated} />
      
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Product Directory <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{products.length}</span>
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex flex-col items-center py-10">
            <p className="font-semibold mb-2">{error}</p>
            <p className="text-sm">Make sure you are running backend server at port 5000.</p>
          </div>
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </div>
  );
};

export default Home;
