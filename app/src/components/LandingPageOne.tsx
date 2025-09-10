import React, { useState, useEffect } from 'react';

interface LandingPageOneProps {
  onStartQuiz: () => void;
}

export function LandingPageOne({ onStartQuiz }: LandingPageOneProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Trigger initial load animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="min-h-screen bg-brand-gray-950 text-brand-gray-100 flex items-center justify-center font-sans relative safe-top safe-bottom">
      {/* AXIARCH image - centered at top middle */}
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
        <div className="w-88 h-88 flex items-center justify-center">
          {/* Enhanced glow effects with brand colors - Brighter gold */}
          <div className={`absolute w-32 h-32 bg-gradient-to-r from-yellow-300 to-orange-400 blur-[20px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-glow transition-opacity duration-1000 ${imageLoaded ? 'opacity-80' : 'opacity-0'}`}></div>
          {/* Secondary glow effect */}
          <div className={`absolute w-24 h-24 bg-yellow-200 blur-[12px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float transition-opacity duration-1000 ${imageLoaded ? 'opacity-60' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}></div>
          {/* Additional pulsing glow */}
          <div className={`absolute w-40 h-40 bg-gradient-to-r from-yellow-200 to-orange-300 blur-[70px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse transition-opacity duration-1000 ${imageLoaded ? 'opacity-40' : 'opacity-0'}`} style={{ animationDelay: '1s' }}></div>
          <img 
            src="/ChatGPT Image Sep 5, 2025, 08_06_22 AM.png" 
            alt="AXIARCH" 
            className="w-full h-auto max-w-72 relative z-20 opacity-100"
            onLoad={handleImageLoad}
            style={{ 
              display: 'block',
              maxWidth: '288px',
              height: 'auto'
            }}
          />
        </div>
      </div>

      {/* Main content with enhanced animations */}
      <div className={`flex flex-col items-center justify-center text-center max-w-4xl px-8 mt-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-brand-gray-100 whitespace-nowrap uppercase tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Awaken Your Core Identity
        </h1>
        <p className="text-2xl md:text-3xl font-light mb-6 leading-relaxed text-brand-gray-200 uppercase tracking-wide animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Seven lines align to reveal your true design. When they match your core, you don't<br />
          just navigate reality — you direct it.
        </p>
        <p 
          className="text-2xl md:text-3xl font-light mb-6 leading-relaxed text-brand-gray-200 uppercase tracking-wide animate-fade-in-up" 
          style={{ 
            animationDelay: '0.5s',
            marginTop: '1px', // Keep original position
            marginBottom: '18px' // Reduce from 24px to 18px to move text down 6px without affecting button
          }}
        >
          AN IDENTITY ENGINE · SHOWS THE PROOF, TO LAND OUTCOMES
        </p>
        
        <button
          onClick={onStartQuiz}
          className="btn-primary px-16 py-6 text-2xl font-semibold tracking-wider uppercase animate-bounce-in touch-target touch-safe"
          style={{ 
            animationDelay: '0.6s',
            marginTop: '9px' // Move button down 9px
          }}
        >
          Start Now
        </button>
        
        <p className="text-brand-gray-400 text-lg mt-4 font-light uppercase animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          Completely free, no email required to view results
        </p>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-gold-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-brand-orange-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-brand-gold-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-brand-orange-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}
