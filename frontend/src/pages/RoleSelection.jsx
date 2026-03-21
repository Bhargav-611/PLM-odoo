import React from 'react';
import { useNavigate } from 'react-router-dom';

const roles = [
  { id: 'ENGINEER', name: 'Engineering User', description: 'Create and edit BoM drafts' },
  { id: 'APPROVER', name: 'Approver', description: 'Review and approve/reject BoMs' },
  { id: 'OPERATIONS', name: 'Operations User', description: 'View active BoMs only' },
  { id: 'ADMIN', name: 'Admin', description: 'Full system access' }
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const selectRole = (role) => {
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-8">PLM BoM System</h1>
        <p className="text-slate-400 text-center mb-12 text-lg">Select your role to continue</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => selectRole(role.id)}
              className="bg-slate-800 border border-slate-700 p-8 rounded-xl text-left hover:border-blue-500 hover:bg-slate-750 transition-all group"
            >
              <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 mb-2">{role.name}</h2>
              <p className="text-slate-400">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
