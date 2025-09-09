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
          title: 'Ground Zero begins here. Choose three families.',
          subtitle: 'No rewinds. You build your mirror now.',
          minHoldMs: 2000,
          pulseColor: 'red' // Red star on Raven
        };
      case 'a-to-b':
        return {
          icon: <img src="/Peregrine Falcon with Cyan Star Emblem.png" alt="Duels" className="w-32 h-32 object-contain" />,
          title: 'Duels. Firmness or drift. Choose.',
          subtitle: 'Every click bends your code.',
          minHoldMs: 2000,
          pulseColor: 'cyan' // Cyan star on Peregrine Falcon
        };
      case 'b-to-c':
        return {
          icon: <img src="/ChatGPT Image Sep 8, 2025, 10_06_00 AM.png" alt="What you left behind" className="w-32 h-32 object-contain" />,
          title: 'What you left behind returns. Answer all seven.',
          subtitle: 'Silence tricks no one.',
          minHoldMs: 2000,
          pulseColor: 'pink' // Pink star on the bird
        };
      case 'c-to-d':
        return {
          icon: <img src="/Hawk Emblem with Glowing Star.png" alt="Installation" className="w-32 h-32 object-contain" />,
          title: 'Installation. You don\'t choose a family. You choose a face.',
          subtitle: 'Installed ≠ chosen. Pay attention.',
          minHoldMs: 2000,
          pulseColor: 'green' // Green star on Hawk
        };
      case 'd-to-e':
        return {
          icon: <img src="/Symmetrical Canada Goose Emblem.png" alt="Anchor" className="w-32 h-32 object-contain" />,
          title: 'Anchor. One line holds, all others orbit.',
          subtitle: 'Anchor = who you are when everything else collapses.',
          minHoldMs: 2000,
          pulseColor: 'cyan' // Cyan star on Canada Goose
        };
      case 'final-result':
        return {
          icon: <img src="/Stylized Pelican Emblem on Black.png" alt="Chamber opens" className="w-32 h-32 object-contain" />,
          title: 'Your Chamber opens. Seven lines resolved.',
          subtitle: 'No edits. No escapes. Face it.',
          minHoldMs: 2000,
          pulseColor: 'orange' // Orange star on Pelican
        };
      default:
        return {
          icon: <img src="/ChatGPT Image Aug 26, 2025, 04_15_54 PM.png" alt="Loading" className="w-32 h-32 object-contain" />,
          title: 'Loading...',
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
    />
  );
};

export default LoadingScreen;
