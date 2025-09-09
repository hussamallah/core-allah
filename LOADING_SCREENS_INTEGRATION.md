# Loading Screens Integration Guide

## 🎯 Overview
Ritualistic loading screens for each phase transition that snap attention without wasting time. Each screen is 2.5-3 seconds with minimal, serious animations.

## 📁 Files Created

### Core Components
- `app/src/components/quiz/LoadingScreen.tsx` - Main loading screen component
- `app/src/hooks/useLoadingTransition.ts` - Hook for managing loading state
- `app/src/components/quiz/QuizWithLoading.tsx` - Wrapper for quiz with loading screens
- `app/src/components/QuizEngineWithLoading.tsx` - Enhanced QuizEngine with loading

### Styles
- `app/src/styles/loading-animations.css` - Custom animations and effects

### Demo
- `app/src/app/loading-demo/page.tsx` - Demo page to test all loading screens

## 🚀 Quick Integration

### Option 1: Replace QuizEngine (Recommended)
```tsx
// In your main page.tsx
import { QuizEngineWithLoading } from '@/components/QuizEngineWithLoading';

export default function Home() {
  return <QuizEngineWithLoading />;
}
```

### Option 2: Manual Integration
```tsx
// In your existing QuizEngine
import QuizWithLoading from '@/components/quiz/QuizWithLoading';

export function QuizEngine() {
  const { state } = useQuizEngine();
  
  return (
    <QuizWithLoading currentPhase={state.phase}>
      {/* Your existing quiz content */}
    </QuizWithLoading>
  );
}
```

## 🎨 Loading Screen Phases

### 1. **Home → Phase A** (Family Selection)
- **Emblem**: 🌑 (pulsing)
- **Background**: Black with gold glow
- **Text**: "Ground Zero begins here. Choose three families. Every choice locks your path."
- **Subtext**: "No rewinds. You build your mirror now."

### 2. **Phase A → Phase B** (Duels)
- **Emblem**: ⚔️ (pulsing)
- **Background**: White flash to dark
- **Text**: "Phase B: Duels. Each family now forces your hand—firmness or drift. One choice becomes your anchor."
- **Subtext**: "Every click bends your code."

### 3. **Phase B → Phase C** (Modules)
- **Emblem**: 🌀 (rotating)
- **Background**: Purple to blue gradient
- **Text**: "Phase C: The remaining lines. What you avoided in A returns here. Each verdict stacks into your record."
- **Subtext**: "Silence tricks no one. You must answer all seven."

### 4. **Phase C → Phase D** (Installation)
- **Emblem**: 🎭 (shifting)
- **Background**: Dark with shifting silhouettes
- **Text**: "Phase D: Installation. Here you don't choose a family. You choose a face—what the world installs onto you."
- **Subtext**: "Installed ≠ chosen. Pay attention."

### 5. **Phase D → Phase E** (Anchor)
- **Emblem**: ⚡ (pulsing)
- **Background**: Golden radial gradient
- **Text**: "Phase E: Anchor. One line holds, all others orbit. Evidence and instinct collide here."
- **Subtext**: "Anchor = who you are when everything else collapses."

### 6. **Final Result**
- **Emblem**: 💎 (fracturing)
- **Background**: Black with emblem fracture animation
- **Text**: "Your Chamber opens. Seven lines resolved. This is your code."
- **Subtext**: "No edits. No escapes. Face it."

## 🎭 Animation Types

- **Pulse**: Gentle breathing effect for serious moments
- **Rotate**: Spinning for transformation phases
- **Shift**: Side-to-side movement for installation phase
- **Fracture**: Breaking/reforming for final results

## ⚙️ Customization

### Change Duration
```tsx
<LoadingScreen
  phase="home-to-a"
  onComplete={handleComplete}
  duration={2500} // 2.5 seconds instead of 3
/>
```

### Custom Animations
Add new animation classes in `loading-animations.css`:
```css
@keyframes customAnimation {
  /* Your animation keyframes */
}

.animate-custom {
  animation: customAnimation 2s ease-in-out infinite;
}
```

### Custom Content
Modify the `getPhaseContent()` function in `LoadingScreen.tsx` to change text, emblems, or backgrounds.

## 🧪 Testing

### Demo Page
Visit `/loading-demo` to test all loading screens individually.

### Integration Testing
1. Start your quiz
2. Navigate through each phase
3. Verify loading screens appear between transitions
4. Check timing and animations

## 🎯 Design Principles

- **Timing**: 2.5-3 seconds - enough to interrupt autopilot, not enough to feel like bloat
- **Animation**: Minimal and serious - pulse, fade, rotate, no gimmicks
- **Tone**: Always final, always ritualistic - no jokes, no filler
- **Visuals**: Gold text on dark backgrounds with subtle glow effects

## 🔧 Troubleshooting

### Loading Screens Not Appearing
1. Check that `QuizWithLoading` wraps your quiz content
2. Verify `currentPhase` prop is being passed correctly
3. Check console for any errors

### Animations Not Working
1. Ensure `loading-animations.css` is imported
2. Check that Tailwind CSS is configured properly
3. Verify custom animation classes are defined

### Timing Issues
1. Adjust `duration` prop on `LoadingScreen`
2. Modify timeout values in `useLoadingTransition`
3. Check for conflicting CSS transitions

## 📱 Responsive Design

The loading screens are fully responsive:
- **Mobile**: Smaller text, adjusted spacing
- **Tablet**: Medium sizing
- **Desktop**: Full size with maximum impact

## 🎨 Styling Notes

- Uses CSS custom properties for easy theming
- Gold color scheme (`text-yellow-400`, `text-yellow-200`)
- Backdrop blur effects for modern feel
- Text shadows for enhanced readability
- Smooth transitions for professional feel

## 🚀 Performance

- Lightweight animations using CSS transforms
- No heavy JavaScript animations
- Optimized for 60fps on all devices
- Minimal DOM manipulation
- Fast loading and transitions

The loading screens are designed to enhance the ritualistic, serious tone of your quiz while providing smooth, professional transitions between phases.
