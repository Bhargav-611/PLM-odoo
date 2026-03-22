import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const words = ["Absolute Precision", "Maximum Velocity", "Total Traceability", "Full Compliance"];
    const period = 2000;

    useEffect(() => {
        let timer = setTimeout(() => {
            const i = loopNum % words.length;
            const fullWord = words[i];

            if (isDeleting) {
                setText(fullWord.substring(0, text.length - 1));
                setTypingSpeed(50);
            } else {
                setText(fullWord.substring(0, text.length + 1));
                setTypingSpeed(100);
            }

            if (!isDeleting && text === fullWord) {
                setTimeout(() => setIsDeleting(true), period);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setTypingSpeed(500);
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    return (
        <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#0052cc 1px, transparent 1px), linear-gradient(90deg, #0052cc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                <div 
                    className="inline-block mb-4 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 backdrop-blur-sm text-blue-600 font-semibold text-sm tracking-wide opacity-0 animate-slideUp"
                >
                    Designed for Modern Operations
                </div>

                <h1 
                    className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl opacity-0 animate-slideUpDelay h-[120px] sm:h-[180px] md:h-[220px]"
                >
                    Managed engineering change processes with <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 border-r-2 border-blue-600 animate-pulse">
                        {text}
                    </span>
                </h1>

                <p 
                    className="mt-4 max-w-2xl text-lg sm:text-xl text-slate-600 mb-10 opacity-0 animate-slideUpDelaySlow"
                >
                    Manage Product systems and versioning with rigorous approval workflows and total traceability in a unified workspace.
                </p>

                <div 
                    className="flex flex-col sm:flex-row gap-4 opacity-0 animate-slideUpDelaySlow"
                >
                    <Link to="/login" className="px-8 py-4 text-lg font-bold rounded-md text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all">
                        Get Started
                    </Link>
                    <a href="#features" className="px-8 py-4 text-lg font-bold rounded-md text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all">
                        Learn More
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
