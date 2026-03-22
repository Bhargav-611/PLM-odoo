import React from 'react';

const Footer = () => {
    return (
        <footer id="contact" className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs relative overflow-hidden">
            {/* Ambient Glow Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]"></div>
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Logo & Description */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <img src="/2.png" alt="controlSystem Logo" className="w-8 h-8 object-contain group-hover:rotate-6 transition-transform duration-300" />
                        <span className="text-sm tracking-tight text-white">
                            <span className="font-light text-slate-300">Control</span><span className="font-black text-blue-500">System</span>
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 tracking-wide mt-1">
                        High-precision Engineering Change Management.
                    </p>
                </div>

                {/* Company & Contact Info with Icons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-slate-300">
                    <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/60 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.72l.93 3.19a1 1 0 01-.24 1.05l-1.93 1.93a1 1 0 00-.23.57 10.24 10.24 0 003.33 3.33 1 1 0 00.57-.23l1.93-1.93a1 1 0 011.05-.24l3.19.93a1 1 0 01.72.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="text-[11px]">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/60 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                        <span className="text-[11px]">support@controlsystem.com</span>
                    </div>
                </div>

                {/* Ratings & Copyright */}
                <div className="flex flex-col items-center md:items-end gap-1.5">
                    <div className="flex items-center gap-1.5 text-yellow-400 font-medium">
                        ★ ★ ★ ★ ★ <span className="text-slate-400 text-[10px] ml-1">4.9/5 Rating</span>
                    </div>
                    <p className="text-slate-500 text-[10px] tracking-wider">
                        &copy; {new Date().getFullYear()} ControlSystem. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
