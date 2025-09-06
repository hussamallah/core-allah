import { render, screen, fireEvent } from '@testing-library/react';
import { PhaseE } from '../PhaseE';
import { QuizState } from '@/types/quiz';

// Mock the phaseEEngine
jest.mock('@/engine/PhaseE', () => ({
  phaseEEngine: {
    getState: () => ({
      anchor: null,
      candidates: ['Control', 'Pace', 'Boundary'],
      needsTieBreak: () => true
    }),
    enterPhaseE: jest.fn(),
    selectAnchor: jest.fn(),
    needsTieBreak: () => true
  }
}));

const mockState: QuizState = {
  phase: 'E',
  lines: [
    {
      id: 'Control',
      selectedA: true,
      B: { picks: [], C_evidence: 0.5 },
      mod: { decisions: [] },
      verdict: null,
      fSeverity: null,
      fSeverityScore: null
    },
    {
      id: 'Pace',
      selectedA: false,
      B: { picks: [], C_evidence: 0 },
      mod: { decisions: [] },
      verdict: null,
      fSeverity: null,
      fSeverityScore: null
    }
  ],
  anchor: null,
  usedQuestions: [],
  currentQuestionIndex: 0,
  questionHistory: [],
  archetypeAnswers: {},
  finalArchetype: null,
  sifCounters: {
    famC: {},
    famO: {},
    famF: {},
    sevF: {},
    faceC: {},
    faceO: {}
  },
  sifResult: null,
  familyVerdicts: {}
};

describe('PhaseE', () => {
  it('calls onProceedToArchetype with chosen line when callback is provided', () => {
    const mockCallback = jest.fn();
    render(
      <PhaseE 
        state={mockState} 
        onAddQuestionToHistory={jest.fn()}
        onProceedToArchetype={mockCallback} 
      />
    );
    
    const controlButton = screen.getByText('Control');
    fireEvent.click(controlButton);
    
    expect(mockCallback).toHaveBeenCalledWith({
      selectedLine: 'Control',
      anchorSource: 'E:TieBreak',
    });
  });

  it('handles missing callback gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(
      <PhaseE 
        state={mockState} 
        onAddQuestionToHistory={jest.fn()}
      />
    );
    
    const controlButton = screen.getByText('Control');
    fireEvent.click(controlButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('[PhaseE] onProceedToArchetype missing; no-op');
    
    consoleSpy.mockRestore();
  });

  it('prevents double-firing with FSM guardrails', () => {
    const mockCallback = jest.fn();
    render(
      <PhaseE 
        state={mockState} 
        onAddQuestionToHistory={jest.fn()}
        onProceedToArchetype={mockCallback} 
      />
    );
    
    const controlButton = screen.getByText('Control');
    
    // First click should work
    fireEvent.click(controlButton);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Second click should be ignored
    fireEvent.click(controlButton);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});

