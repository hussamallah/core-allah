import React, { useEffect, useState } from 'react';
import '@/styles/loading-animations.css';

interface LoadingScreenProps {
  phase: 'home-to-a' | 'a-to-b' | 'b-to-c' | 'c-to-d' | 'd-to-e' | 'final-result';
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  phase, 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [textVisible, setTextVisible] = useState(false);
  const [skipButtonVisible, setSkipButtonVisible] = useState(false);
  const [buttonLocked, setButtonLocked] = useState(true);

  useEffect(() => {
    // Show text after a brief delay for smoother entrance
    const textTimer = setTimeout(() => setTextVisible(true), 500);
    
    // Show skip button after 3 seconds
    const skipButtonTimer = setTimeout(() => setSkipButtonVisible(true), 3000);
    
    // Unlock button after 1-2 seconds of being visible (total 4-5 seconds)
    const unlockTimer = setTimeout(() => setButtonLocked(false), 4000);
    
    // Complete transition after duration
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 700); // Allow fade out to complete
    }, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(skipButtonTimer);
      clearTimeout(unlockTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  const handleSkip = () => {
    if (buttonLocked) return; // Button is locked, ignore click
    setIsVisible(false);
    setTimeout(onComplete, 500); // Allow fade out to complete
  };

  const getPhaseContent = () => {
    switch (phase) {
      case 'home-to-a':
        return {
          background: 'bg-black',
          emblem: '🌑',
          title: 'Ground Zero begins here. Choose three families. Every choice locks your path.',
          subtitle: 'No rewinds. You build your mirror now.',
          animation: 'pulse'
        };
      case 'a-to-b':
        return {
          background: 'bg-black',
          emblem: '⚔️',
          title: 'Duels. Firmness or drift. Choose.',
          subtitle: 'Every click bends your code.',
          animation: 'fade'
        };
      case 'b-to-c':
        return {
          background: 'bg-gradient-to-r from-gray-900 via-black to-yellow-900',
          emblem: '🌀',
          title: 'What you left behind returns. Answer all seven.',
          subtitle: 'Silence tricks no one.',
          animation: 'rotate'
        };
      case 'c-to-d':
        return {
          background: 'bg-gradient-to-br from-black via-yellow-900 to-gray-900',
          emblem: '🎭',
          title: 'Installation. You don\'t choose a family. You choose a face.',
          subtitle: 'Installed ≠ chosen. Pay attention.',
          animation: 'shift'
        };
      case 'd-to-e':
        return {
          background: 'bg-gradient-radial from-black via-yellow-900 to-amber-900',
          emblem: '⚡',
          title: 'Anchor. One line holds, all others orbit.',
          subtitle: 'Anchor = who you are when everything else collapses.',
          animation: 'pulse'
        };
      case 'final-result':
        return {
          background: 'bg-gradient-to-br from-black via-yellow-900 to-black',
          emblem: '💎',
          title: 'Your Chamber opens. Seven lines resolved.',
          subtitle: 'No edits. No escapes. Face it.',
          animation: 'fracture'
        };
      default:
        return {
          background: 'bg-black',
          emblem: '⚡',
          title: 'Loading...',
          subtitle: 'Preparing your path.',
          animation: 'pulse'
        };
    }
  };

  const content = getPhaseContent();

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center loading-screen phase-${phase} transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backdropFilter: 'blur(0px)',
          transition: 'opacity 0.7s ease-in-out, backdrop-filter 0.7s ease-in-out'
        }}
      >
        <div className="text-center px-8 max-w-4xl">
          {/* Emblem */}
          <div className={`mb-8 text-6xl loading-emblem ${getAnimationClass(content.animation)}`}>
            {content.emblem}
          </div>
          
          {/* Main Text with Background Overlay */}
          <div className={`transition-all duration-700 ${textVisible ? 'opacity-100 translate-y-0 animate-text-fade-in' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 border border-yellow-500 border-opacity-20">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4 leading-tight loading-title drop-shadow-lg">
                {content.title}
              </h1>
              <p className="text-lg md:text-xl text-yellow-100 italic loading-subtitle drop-shadow-md">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Begin button - positioned below the main container */}
      {skipButtonVisible && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleSkip}
            disabled={buttonLocked}
            className={`px-8 py-4 text-black font-bold rounded-lg transition-all duration-300 transform border-2 uppercase tracking-wider ${
              buttonLocked 
                ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-60' 
                : 'bg-yellow-600 hover:bg-yellow-500 border-yellow-400 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {buttonLocked ? 'Preparing...' : 'Begin'}
          </button>
        </div>
      )}
    </>
  );
};

const getAnimationClass = (animation: string) => {
  switch (animation) {
    case 'pulse':
      return 'animate-emblem-pulse';
    case 'fade':
      return 'animate-emblem-pulse';
    case 'rotate':
      return 'animate-emblem-rotate';
    case 'shift':
      return 'animate-emblem-shift';
    case 'fracture':
      return 'animate-emblem-fracture';
    default:
      return 'animate-emblem-pulse';
  }
};

export default LoadingScreen;
