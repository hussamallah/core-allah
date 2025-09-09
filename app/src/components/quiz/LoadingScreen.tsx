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

  useEffect(() => {
    // Show text after a brief delay for smoother entrance
    const textTimer = setTimeout(() => setTextVisible(true), 500);
    
    // Show skip button after 3 seconds
    const skipButtonTimer = setTimeout(() => setSkipButtonVisible(true), 3000);
    
    // Complete transition after duration
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 700); // Allow fade out to complete
    }, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(skipButtonTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  const handleSkip = () => {
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
          title: 'Phase B: Duels. Each family now forces your hand—firmness or drift. One choice becomes your anchor.',
          subtitle: 'Every click bends your code.',
          animation: 'fade'
        };
      case 'b-to-c':
        return {
          background: 'bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900',
          emblem: '🌀',
          title: 'Phase C: The remaining lines. What you left behind in A returns here. Each verdict stacks into your record.',
          subtitle: 'Silence tricks no one. You must answer all seven.',
          animation: 'rotate'
        };
      case 'c-to-d':
        return {
          background: 'bg-gradient-to-br from-gray-900 via-slate-800 to-black',
          emblem: '🎭',
          title: 'Phase D: Installation. Here you don\'t choose a family. You choose a face—what the world installs onto you.',
          subtitle: 'Installed ≠ chosen. Pay attention.',
          animation: 'shift'
        };
      case 'd-to-e':
        return {
          background: 'bg-gradient-radial from-yellow-900 via-amber-900 to-orange-900',
          emblem: '⚡',
          title: 'Phase E: Anchor. One line holds, all others orbit. Evidence and instinct collide here.',
          subtitle: 'Anchor = who you are when everything else collapses.',
          animation: 'pulse'
        };
      case 'final-result':
        return {
          background: 'bg-black',
          emblem: '💎',
          title: 'Your Chamber opens. Seven lines resolved. This is your code.',
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

      {/* Skip button - positioned below the main container */}
      {skipButtonVisible && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-yellow-400"
          >
            Skip
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
