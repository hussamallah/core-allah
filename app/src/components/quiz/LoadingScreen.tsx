import React from 'react';
import { Interstitial } from '../ui/MicroAnimationsKit';

interface LoadingScreenProps {
  phase: 'home-to-a' | 'a-to-b' | 'b-to-c' | 'c-to-d' | 'd-to-e' | 'final-result';
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  phase, 
  onComplete, 
  duration = 10000 
}) => {
  const getPhaseContent = () => {
    switch (phase) {
      case 'home-to-a':
        return {
          icon: <img src="/Raven Emblem with Glowing Star.png" alt="Ground Zero" className="w-32 h-32 object-contain" />,
          title: 'GROUND ZERO BEGINS HERE. CHOOSE THREE FAMILIES.',
          subtitle: 'NO REWINDS. YOU BUILD YOUR MIRROR NOW.',
          minHoldMs: 2000,
          pulseColor: 'red' // Red star on Raven
        };
      case 'a-to-b':
        return {
          icon: <img src="/Peregrine Falcon with Cyan Star Emblem.png" alt="Duels" className="w-32 h-32 object-contain" />,
          title: 'DUELS. FIRMNESS OR DRIFT. CHOOSE.',
          subtitle: 'EVERY CLICK BENDS YOUR CODE.',
          minHoldMs: 2000,
          pulseColor: 'cyan' // Cyan star on Peregrine Falcon
        };
      case 'b-to-c':
        return {
          icon: <img src="/ChatGPT Image Sep 8, 2025, 10_06_00 AM.png" alt="What you left behind" className="w-32 h-32 object-contain" />,
          title: 'WHAT YOU LEFT BEHIND RETURNS. ANSWER ALL SEVEN.',
          subtitle: 'SILENCE TRICKS NO ONE.',
          minHoldMs: 2000,
          pulseColor: 'pink' // Pink star on the bird
        };
       case 'c-to-d':
         return {
           icon: <img src="/Hawk Emblem with Glowing Star.png" alt="Installation" className="w-32 h-32 object-contain" />,
           title: 'ANCHOR: YOUR ARCHETYPE / FACE.',
           subtitle: 'THIS IS HOW YOU MOVE DAY TO DAY.',
           minHoldMs: 2000,
           pulseColor: 'green' // Green star on Hawk
         };
       case 'd-to-e':
         return {
           icon: <img src="/Symmetrical Canada Goose Emblem.png" alt="Line Questions" className="w-32 h-32 object-contain" />,
           title: 'YOUR PURE CODE HAS BEEN DETECTED.',
           subtitle: 'Decide how you act and move under that code.',
           minHoldMs: 2000,
           pulseColor: 'cyan' // Cyan star on Canada Goose
         };
      case 'final-result':
        return {
          icon: <img src="/Stylized Pelican Emblem on Black.png" alt="Chamber opens" className="w-32 h-32 object-contain" />,
          title: 'YOUR CHAMBER OPENS. SEVEN LINES RESOLVED.',
          subtitle: 'NO EDITS. NO ESCAPES. FACE IT.',
          minHoldMs: 2000,
          pulseColor: 'orange-orange' // More orange-orange star on Pelican
        };
      default:
        return {
          icon: <img src="/ChatGPT Image Aug 26, 2025, 04_15_54 PM.png" alt="Loading" className="w-32 h-32 object-contain" />,
          title: 'LOADING...',
          subtitle: '',
          minHoldMs: 1000
        };
    }
  };

  const content = getPhaseContent();

  return (
    <Interstitial
      icon={content.icon}
      title={content.title}
      subtitle={content.subtitle}
      minHoldMs={content.minHoldMs}
      onBegin={onComplete}
      beginLabel="BEGIN"
      pulseColor={content.pulseColor}
      titleStyle={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
        filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))'
      }}
      subtitleStyle={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
        filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
      }}
    />
  );
};

export default LoadingScreen;
