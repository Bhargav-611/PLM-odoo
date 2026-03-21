import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, List, LogOut, FileText } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole');

  const logout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: Home, roles: ['ENGINEER', 'APPROVER', 'OPERATIONS', 'ADMIN'] },
    { title: 'Products & BoMs', path: '/bom', icon: List, roles: ['ENGINEER', 'APPROVER', 'OPERATIONS', 'ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800">PLM-BoM</div>
        <div className="flex-1 py-4">
          <div className="px-6 mb-4 text-xs font-semibold text-slate-500 uppercase">Menu</div>
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.title}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-2 py-3 text-slate-400 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
              {role?.[0]}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-white">{role}</div>
              <div className="text-xs">Logged In</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-2 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
          <h1 className="text-xl font-semibold">{navItems.find(n => n.path === location.pathname)?.title || 'Page'}</h1>
          <div className="flex items-center text-sm text-slate-500">
            <span className="mr-2">System Status:</span>
            <span className="flex items-center text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Healthy
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
