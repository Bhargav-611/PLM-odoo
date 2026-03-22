import React from 'react';

const About = () => {
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

    return (
        <section id="about" ref={sectionRef} className="relative py-20 bg-slate-50 overflow-hidden border-b border-slate-100">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className={`flex-1 max-w-xl ${isVisible ? 'animate-slideUp' : 'opacity-0'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                        Unified <span className="text-blue-600">Intelligence</span> for Engineering
                    </h2>
                    <p className="text-slate-600 text-lg mb-4">
                        Manufacturing systems suffer from disconnects between design and production. Our platform bridges the gap.
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Traditional spreadsheets and email chains lack the traceability needed for ISO compliance and scaling operations. This workspace consolidates everything.
                    </p>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div 
                        className={`p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
                        style={{ animationDelay: '200ms' }}
                    >
                        <span className="text-3xl font-black text-blue-600">0%</span>
                        <p className="text-slate-800 font-semibold mt-1">Version Gaps</p>
                    </div>
                    <div 
                        className={`p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
                        style={{ animationDelay: '400ms' }}
                    >
                        <span className="text-3xl font-black text-blue-600">100%</span>
                        <p className="text-slate-800 font-semibold mt-1">Traceability</p>
                    </div>
                    <div 
                        className={`p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm col-span-2 transition-all duration-300 hover:shadow-md ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
                        style={{ animationDelay: '600ms' }}
                    >
                        <p className="text-slate-800 font-bold mb-1">Standardizing operations</p>
                        <p className="text-slate-500 text-xs leading-relaxed">Automated workflows ensure compliance checks are forced in parallel with releases.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
