import React from 'react';

const Benefits = () => {
    const benefits = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            title: "Guaranteed Compliance",
            desc: "Always Auditor-ready with accurate timestamps and signatures for every lifecycle revision."
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Faster Time to Market",
            desc: "Reduces cycle times by eliminating manual approval delays and routing disconnects."
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            ),
            title: "Unified BOM & CAD",
            desc: "One central workspace prevents double-entry errors between design & assembly."
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            title: "Structured Rollbacks",
            desc: "Roll back to any stable revision safely with absolute knowledge of what changed."
        }
    ];

    return (
        <section className="relative py-20 bg-white overflow-hidden border-b border-slate-100">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Drive <span className="text-green-600">Operational Excellence</span>
                        </h2>
                        <p className="text-slate-600">
                            Equip your engineering and manufacturing teams with absolute control to minimize scraps and rework.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                            {benefits.map((benefit, idx) => (
                                <div 
                                    key={idx}
                                    className="flex gap-4 items-start opacity-0 animate-slideUp"
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                        {benefit.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-slate-900 font-semibold mb-1">{benefit.title}</h4>
                                        <p className="text-slate-600 text-sm">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Asset or Placeholder */}
                    <div className="relative flex justify-center">
                        <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-green-500/5 blur-[80px] absolute"></div>
                        <div className="border border-slate-200 bg-white p-4 rounded-xl shadow-md relative w-full max-w-md aspect-video flex items-center justify-center text-slate-400 font-mono text-xs">
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                            <span>[Visual System Interface Graphic]</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Benefits;
