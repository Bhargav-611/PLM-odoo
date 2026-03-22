import React from 'react';

const Workflow = () => {
    const sectionRef = React.useRef(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const steps = [
        {
            number: "01",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            title: "Create ECO",
            desc: "Draft a dynamic change request or revision request for any Product or BoM."
        },
        {
            number: "02",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Review & Approve",
            desc: "Automated routing sends requests to engineering leads and operators for strict signoff."
        },
        {
            number: "03",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21v11h-8.5l-1-2H5v11m0-11V5" />
                </svg>
            ),
            title: "Release & Merge",
            desc: "On approval, changes are merged into the Master directory creating a new revision history record."
        }
    ];

    return (
        <section id="workflow" ref={sectionRef} className="relative py-20 bg-slate-50 overflow-hidden border-b border-slate-100">
            <style>{`
                @keyframes flow {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-flow {
                    animation: flow 1s linear infinite;
                    stroke-dasharray: 6 6;
                }
            `}</style>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Seamless <span className="text-blue-600">Change Management</span>
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Follow our rigorous workflow pipeline designed to minimize gaps and maintain 100% auditability.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 relative">
                    {/* High-Tech Animated Connector Line (Desktop Only) */}
                    <svg className="hidden md:block absolute top-[110px] left-[12%] right-[12%] w-[76%] h-1 z-0 pointer-events-none" preserveAspectRatio="none">
                        <line x1="0" y1="2" x2="100%" y2="2" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 6" />
                        <line x1="0" y1="2" x2="100%" y2="2" stroke="#2563eb" strokeWidth="2" className={isVisible ? "animate-flow" : ""} />
                    </svg>

                    {steps.map((step, idx) => (
                        <div 
                            key={idx}
                            className={`flex-1 flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative z-10 group ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
                            style={{ animationDelay: `${idx * 200}ms` }}
                        >
                            {/* Number Badge */}
                            <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 tracking-wider group-hover:text-blue-600 transition-colors">
                                STEP {step.number}
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 shadow-inner group-hover:bg-blue-600 group-hover:shadow-blue-600/20 transition-all duration-300">
                                <div className="group-hover:text-white transition-colors duration-300">
                                    {step.icon}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {step.title}
                            </h3>
                            
                            <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Bottom Accent Line */}
                            <div className="absolute bottom-0 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Workflow;
