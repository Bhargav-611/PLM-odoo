import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const links = [
        { name: 'Home', href: '#home' },
        { name: 'Features', href: '#features' },
        { name: 'Workflow', href: '#workflow' },
        { name: 'About', href: '#about' },
        { name: 'Contact', href: '#contact' }
    ];

    return (
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100/80 shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-16">
                    
                    {/* 1. Logo Slot (Left) */}
                    <div className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 -z-0"></div>
                            <img 
                                src="/2.png" 
                                className="w-10 h-10 relative z-10 group-hover:scale-105 transition-transform object-contain mix-blend-multiply" 
                                style={{ filter: 'invert(24%) sepia(87%) saturate(2250%) hue-rotate(210deg) brightness(95%) contrast(98%)' }}
                                alt="Logo" 
                            />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">
                            Control<span className="text-blue-600">System</span>
                        </span>
                    </div>

                    {/* 2. Desktop Links Slot (Centered) */}
                    <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                        {links.map((link) => (
                            <a 
                                key={link.name} 
                                href={link.href} 
                                className="text-slate-600 hover:text-slate-900 font-semibold text-[14px] transition-colors duration-200 py-1"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* 3. Action Button Slot (Right) */}
                    <div className="hidden md:flex items-center flex-shrink-0">
                        <Link 
                            to="/login" 
                            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/10 hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <span>Login</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-50">
                            {isOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Floating Overlap) */}
            {isOpen && (
                <div className="absolute top-20 left-4 right-4 bg-white border border-slate-100/80 p-4 rounded-xl flex flex-col gap-1.5 shadow-xl z-50 md:hidden animate-slideUp">
                    {links.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            onClick={() => setIsOpen(false)}
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium block px-4 py-2.5 rounded-lg transition-all"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link 
                        to="/login" 
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md mt-2 flex justify-center items-center gap-1.5"
                    >
                        <span>Login</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
