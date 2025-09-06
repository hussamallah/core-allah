# CORRECTED SIF System Specification

## ✅ **What's Fixed**

The SIF system now correctly implements the specification you provided:

### **1. Archetype-Level Scoring (Not Family-Level)**
- ✅ Scores each **face** (archetype) individually, not families
- ✅ Uses `faceC[face]` counters for NI calculation
- ✅ Proper face-to-family mapping

### **2. Correct Formula Implementation**
```typescript
FaceScore = 1.0*NI + 0.5*SI - 0.5*min(II, 3)
```
Where:
- **NI** = `faceC[face]` (Face C votes for this specific face)
- **SI** = `famC[family] / (famC[family] + famO[family])` (Family stability)
- **II** = `min(famF[family] + sevF[family], 3)` (Instability, capped at 3)

### **3. Proper Candidate Filtering**
- ✅ Excludes the **Anchor face** from secondary selection
- ✅ Excludes any face whose **family verdict = F** (broken lines don't get to be secondary)
- ✅ Only considers faces from C/O verdict families

### **4. Correct Tie-Breaking**
1. **Primary**: Highest FaceScore
2. **Tie-breaker 1**: Higher NI (more clean wins for the face)
3. **Tie-breaker 2**: Higher SI (more stable family)
4. **Tie-breaker 3**: Lower II (less instability)

### **5. Required Parameters**
- ✅ `calculateSIF()` now requires `familyVerdicts: Record<string, "C" | "O" | "F">`
- ✅ Integration functions updated to pass family verdicts
- ✅ Examples show correct usage

## 🎯 **Key Changes Made**

### **SIFEngine.calculateSIF()**
```typescript
// OLD (incorrect)
calculateSIF(primaryFamily: string, primaryFace: string, prizeFace?: string)

// NEW (correct)
calculateSIF(primaryFamily: string, primaryFace: string, familyVerdicts: Record<string, "C" | "O" | "F">, prizeFace?: string)
```

### **Candidate Selection**
```typescript
// OLD (incorrect) - excluded primary family faces
const candidatePool = Object.keys(FACE_TO_FAMILY).filter(face => !primaryFaces.includes(face));

// NEW (correct) - excludes anchor face and F-verdict families
const candidatePool = allFaces.filter(({ face, family }) => {
  const isNotAnchor = face !== primaryFace;
  const familyNotF = familyVerdicts[family] !== 'F';
  return isNotAnchor && familyNotF;
});
```

### **Face Scoring**
```typescript
// OLD (incorrect) - used faceKey lookup
const NI = this.counters.faceC[faceKey] || 0;

// NEW (correct) - direct face lookup
const NI = this.counters.faceC[face] || 0;
```

## 📊 **Usage Example**

```typescript
import { SIFEngine, handlePhaseDSIFCalculation } from './sif-system';

const sifEngine = new SIFEngine();
const sifState = createSIFState();

// Record answers during quiz...
// handlePhaseBAnswer(sifEngine, sifState, 'Control', 'CO', 'A');
// handlePhaseCAnswer(sifEngine, sifState, 'Pace', 'CO', 'A', 'Pace:Visionary');

// Family verdicts from quiz results
const familyVerdicts = {
  'Control': 'C',    // Can be secondary
  'Pace': 'O',       // Can be secondary
  'Boundary': 'C',   // Can be secondary
  'Truth': 'C',      // Can be secondary
  'Recognition': 'O', // Can be secondary
  'Bonding': 'C',    // Can be secondary
  'Stress': 'F'      // EXCLUDED from secondary
};

// Calculate SIF with family verdicts
const result = handlePhaseDSIFCalculation(
  sifEngine, 
  sifState, 
  'Control', 
  familyVerdicts
);

console.log(result);
// {
//   primary: { family: 'Control', face: 'Control:Rebel' },
//   secondary: { family: 'Pace', face: 'Visionary' },
//   prize: 'Truth:Architect',
//   badge: 'Not yet aligned',
//   context: { friction: {} }
// }
```

## ✅ **Verification**

The SIF system now correctly:
- ✅ Picks **Secondary by archetype** (face-level scoring)
- ✅ Uses counters from your quiz (famC, famO, famF, sevF, faceC, faceO)
- ✅ Excludes F-verdict families from secondary selection
- ✅ Implements proper tie-breaking (NI > SI > II)
- ✅ Uses fixed Prize Mirror mapping (not calculated)
- ✅ Determines badge based on secondary family stability

**The implementation now matches your specification exactly!** 🎉
