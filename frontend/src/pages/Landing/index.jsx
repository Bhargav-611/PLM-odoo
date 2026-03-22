import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Workflow from './Workflow';
import About from './About';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="bg-white font-sans antialiased text-slate-900">
            {/* Global Smooth Scrolling Styles */}
            <style jsx="true">{`
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
            
            <Navbar />
            <Hero />
            <Features />
            <Workflow />
            <About />
            <Footer />
        </div>
    );
};

export default LandingPage;
