# Quiz Engine - Complete Implementation

## 🎯 Contract Implemented

This quiz engine implements the complete deterministic contract with no "vibes" or guesswork. Every question selection, verdict computation, and state transition follows exact rules.

## 📁 File Structure

```
app/src/engine/
├── QuestionSelector.ts          # Core selection engine
├── VerdictEngine.ts            # Verdict computation with fixed table
├── PhaseBEngine.ts             # Phase B logic with FacePurity
├── PhaseCEngine.ts             # Phase C logic with severity gating
├── PersistenceManager.ts       # State persistence and resume
├── LegacyDataAdapter.ts        # Migration shim for legacy data
├── PerformanceOptimizer.ts     # Performance optimizations
├── __tests__/
│   ├── AcceptanceTests.ts      # Core acceptance tests
│   └── TestRunner.ts           # Comprehensive test suite
└── README.md                   # This file
```

## 🔧 Core Components

### 1. QuestionSelector
- **Exact matching**: `(phase, lineId, type, order)` lookup only
- **No random selection**: First unused question always selected
- **Pre-indexed**: 3-level map for O(1) lookup performance
- **Telemetry**: Lightweight event tracking for War Room

### 2. VerdictEngine
- **Fixed table**: 8 combinations (CCC→C, CCF→O, etc.)
- **No inference**: Only source of truth for C/O/F verdicts
- **FacePurity**: `0.6 + value(pick1) + value(pick2)` formula

### 3. PhaseBEngine (A-lines)
- **Exactly 2 picks**: CO1 → CO2/CF flow
- **FacePurity computation**: C=1.0, O=0.6, F=0.0
- **No early termination**: Always complete both rounds

### 4. PhaseCEngine (Non-A lines)
- **Exactly 3 picks**: CO1 → CO2 → CF (always in this order)
- **Severity gating**: F verdicts block until severity selected
- **Verdict computation**: Uses fixed table after all 3 picks

## 🧪 Testing

### Acceptance Tests
```typescript
import { runAcceptanceTests } from '@/engine/__tests__/AcceptanceTests';

// Run core acceptance tests
const passed = runAcceptanceTests();
```

### Comprehensive Test Suite
```typescript
import { runAllTests } from '@/engine/__tests__/TestRunner';

// Run all tests (acceptance, performance, persistence, migration, regression)
const results = await runAllTests();
```

## 💾 Persistence

### Save State
```typescript
import { PersistenceManager } from '@/engine/PersistenceManager';

const state = PersistenceManager.createInitialState(['Control'], ['Pace']);
PersistenceManager.saveState(state);
```

### Load State
```typescript
const savedState = PersistenceManager.loadState();
if (savedState) {
  // Resume from saved state
}
```

## 🔄 Migration

### Legacy Data Adapter
```typescript
import { LegacyDataAdapter } from '@/engine/LegacyDataAdapter';

// Convert legacy questions to clean format
const cleanModuleQuestions = LegacyDataAdapter.adaptModuleQuestions(legacyModuleQuestions);
const cleanDuelQuestions = LegacyDataAdapter.adaptDuelQuestions(legacyDuelQuestions);
const cleanSeverityQuestions = LegacyDataAdapter.adaptSeverityQuestions(legacySeverityQuestions);
```

## ⚡ Performance

### Performance Optimizer
```typescript
import { PerformanceOptimizer } from '@/engine/PerformanceOptimizer';

const optimizer = new PerformanceOptimizer();
const index = optimizer.preindexQuestions(questions);
const usedSet = optimizer.createUsedQuestionsSet(questionIds);
```

## 🐛 Debug Panel

### QA Visibility
```typescript
import { DebugPanel } from '@/components/DebugPanel';

<DebugPanel
  state={quizState}
  phaseBEngine={phaseBEngine}
  phaseCEngine={phaseCEngine}
  isVisible={showDebug}
  onToggle={() => setShowDebug(!showDebug)}
/>
```

## 📊 Telemetry Events

### Event Types
- `view_question`: Question displayed to user
- `pick_option`: User made a choice
- `compute_verdict`: Verdict calculated
- `severity_select`: Severity level selected
- `phase_complete`: Phase finished

### Usage
```typescript
// Events are automatically recorded by engines
// Access via selector.getTelemetryEvents()
const events = selector.getTelemetryEvents();
```

## 🎯 Contract Compliance

### ✅ Data Contract
- Exact routing keys: `(phase, lineId, type, order)`
- No substring matching
- No random inference

### ✅ Deterministic Selection
- First unused question always selected
- No fallbacks or substitutions
- Reproducible across sessions

### ✅ Phase Behavior
- Phase B: 2 picks per A-line, CO1→CO2/CF
- Phase C: 3 picks per non-A line, CO1→CO2→CF
- Severity gating for F verdicts

### ✅ Error Handling
- Clear error messages for missing questions
- No silent fallbacks
- Graceful degradation

### ✅ Performance
- Pre-indexed questions for O(1) lookup
- Optimized bitset for used questions
- Telemetry sampling for production

## 🚀 Usage Example

```typescript
import { QuestionSelector } from '@/engine/QuestionSelector';
import { PhaseBEngine } from '@/engine/PhaseBEngine';
import { PhaseCEngine } from '@/engine/PhaseCEngine';

// Initialize engines
const selector = new QuestionSelector(moduleQuestions, duelQuestions, severityQuestions);
const phaseBEngine = new PhaseBEngine(selector, ['Control', 'Pace', 'Boundary']);
const phaseCEngine = new PhaseCEngine(selector, ['Truth', 'Recognition', 'Bonding', 'Stress']);

// Get current state
const phaseBState = phaseBEngine.getCurrentState();
const phaseCState = phaseCEngine.getCurrentState();

// Record picks
phaseBEngine.recordPick('C', 'B-CTRL-01-CO');
phaseCEngine.recordPick('C', 'C-TRUTH-01-CO');

// Check completion
if (phaseBEngine.isComplete()) {
  console.log('Phase B complete');
}

if (phaseCEngine.isComplete()) {
  console.log('Phase C complete');
}
```

## 🎉 Result

**The engine is now boring, predictable, and correct.** No more "matching by vibes." Every question selection is deterministic, every verdict follows the fixed table, and every error is explicit. Your War Room gets clean telemetry, QA gets reproducible tests, and users get a consistent experience.

**The contract is locked. The engine is bulletproof.**
