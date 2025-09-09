import React from 'react';

interface LandingPageProps {
  onStartQuiz: () => void;
}

export function LandingPage({ onStartQuiz }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center font-sans relative">
      {/* AXIARCH image - centered at top middle */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="w-88 h-88 flex items-center justify-center">
          {/* Gradient light behind image - gold left, blue right */}
          <div className="absolute w-48 h-48 bg-gradient-to-r from-yellow-400 to-blue-400 blur-[40px] opacity-90 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <img 
            src="/ChatGPT Image Sep 5, 2025, 08_06_22 AM.png" 
            alt="AXIARCH" 
            className="w-full h-auto max-w-72 relative z-10"
          />
        </div>
      </div>


      {/* Original centered content */}
      <div className="flex flex-col items-center justify-center text-center max-w-4xl px-8 mt-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-white whitespace-nowrap uppercase">
          Awaken Your Sovereign Face
        </h1>
        <p className="text-2xl md:text-3xl font-light mb-6 leading-relaxed text-gray-200 uppercase">
          One face. Seven lines. Aligned, they reveal your core.<br />
          When they align with your core, you don't just navigate reality—you direct it.
        </p>
        
        <button
          onClick={onStartQuiz}
          className="bg-gradient-to-r from-yellow-300 to-orange-400 text-black border-none px-16 py-6 text-2xl font-semibold rounded cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(251,191,36,1),0_0_80px_rgba(251,191,36,0.6)] active:translate-y-0.5 shadow-[0_0_30px_rgba(251,191,36,0.8),0_0_60px_rgba(251,191,36,0.4)] tracking-wider uppercase brightness-110"
        >
          Start Now
        </button>
        
        <p className="text-gray-400 text-lg mt-4 font-light uppercase">
          Completely free, no email required to view results
        </p>
      </div>
    </div>
  );
}
