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
          icon: <span className="text-2xl">🌑</span>,
          title: 'Ground Zero begins here. Choose three families.',
          subtitle: 'No rewinds. You build your mirror now.',
          minHoldMs: 2000
        };
      case 'a-to-b':
        return {
          icon: <span className="text-2xl">⚔️</span>,
          title: 'Duels. Firmness or drift. Choose.',
          subtitle: 'Every click bends your code.',
          minHoldMs: 2000
        };
      case 'b-to-c':
        return {
          icon: <span className="text-2xl">🌀</span>,
          title: 'What you left behind returns. Answer all seven.',
          subtitle: 'Silence tricks no one.',
          minHoldMs: 2000
        };
      case 'c-to-d':
        return {
          icon: <span className="text-2xl">🎭</span>,
          title: 'Installation. You don\'t choose a family. You choose a face.',
          subtitle: 'Installed ≠ chosen. Pay attention.',
          minHoldMs: 2000
        };
      case 'd-to-e':
        return {
          icon: <span className="text-2xl">⚡</span>,
          title: 'Anchor. One line holds, all others orbit.',
          subtitle: 'Anchor = who you are when everything else collapses.',
          minHoldMs: 2000
        };
      case 'final-result':
        return {
          icon: <span className="text-2xl">💎</span>,
          title: 'Your Chamber opens. Seven lines resolved.',
          subtitle: 'No edits. No escapes. Face it.',
          minHoldMs: 2000
        };
      default:
        return {
          icon: <span className="text-2xl">⚡</span>,
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
    />
  );
};

export default LoadingScreen;
