import React, { createContext, useState, useContext } from 'react';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
    const [alert, setAlert] = useState({ isOpen: false, message: '' });
    const [confirm, setConfirm] = useState({ isOpen: false, message: '', resolve: null });

    const showAlert = (message) => {
        setAlert({ isOpen: true, message });
    };

    const showConfirm = (message) => {
        return new Promise((resolve) => {
            setConfirm({ isOpen: true, message, resolve });
        });
    };

    const handleConfirmClose = (result) => {
        if (confirm.resolve) confirm.resolve(result);
        setConfirm({ isOpen: false, message: '', resolve: null });
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            
            {/* 1. Alert Pop-Up Modal */}
            {alert.isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setAlert({ isOpen: false, message: '' })}>
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-zoomIn flex flex-col items-center text-center gap-3 border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xl font-black">
                            ⚠️
                        </div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight">System Notification</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                        <button 
                            onClick={() => setAlert({ isOpen: false, message: '' })} 
                            className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            
            {/* 2. Confirm Pop-Up Modal */}
            {confirm.isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => handleConfirmClose(false)}>
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-zoomIn flex flex-col items-center text-center gap-3 border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl font-black">
                            ❓
                        </div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight">Are you sure?</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{confirm.message}</p>
                        <div className="flex gap-3 w-full mt-2">
                            <button 
                                onClick={() => handleConfirmClose(false)} 
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleConfirmClose(true)} 
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow-sm shadow-blue-500/10"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};

export const useDialog = () => useContext(DialogContext);
