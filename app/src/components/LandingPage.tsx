import React from 'react';

interface LandingPageProps {
  onStartQuiz: () => void;
}

export function LandingPage({ onStartQuiz }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center font-sans relative">
      {/* AXIARCH image - centered at top middle */}
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
        <div className="w-88 h-88 flex items-center justify-center">
          {/* Gold to navy blue gradient light behind image with glow effect */}
          <div className="absolute w-48 h-48 bg-gradient-to-r from-yellow-400 to-blue-900 blur-[40px] opacity-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          {/* Additional light effect that involves the owl */}
          <div className="absolute w-32 h-32 bg-blue-600 blur-[20px] opacity-60 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
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
        <p className="text-2xl md:text-3xl font-light mb-4 leading-relaxed text-gray-200 uppercase">
          One face. Seven lines. Aligned, they reveal your core.
        </p>
        <p className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed text-yellow-300 uppercase">
          CORE REVEALED? You don't just navigate reality—you direct it.
        </p>
        
        <div className="text-lg md:text-xl font-light mb-8 leading-relaxed text-gray-300 uppercase space-y-2">
          <p>Seven families await your choice.</p>
          <p>Three will anchor your path.</p>
          <p>The rest will test your resolve.</p>
        </div>
        
        <div className="text-lg md:text-xl font-bold mb-8 leading-relaxed text-red-400 uppercase space-y-1">
          <p>No rewinds. No escapes.</p>
          <p>Your mirror forms now.</p>
        </div>
        
        <button
          onClick={onStartQuiz}
          className="bg-gradient-to-r from-yellow-300 to-orange-400 text-black border-none px-16 py-6 text-2xl font-semibold rounded cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(251,191,36,1),0_0_80px_rgba(251,191,36,0.6)] active:translate-y-0.5 shadow-[0_0_30px_rgba(251,191,36,0.8),0_0_60px_rgba(251,191,36,0.4)] tracking-wider uppercase brightness-110"
        >
          START THE REVELATION
        </button>
        
        <p className="text-gray-400 text-lg mt-4 font-light uppercase">
          Completely free, no email required to view results
        </p>
      </div>
    </div>
  );
}
