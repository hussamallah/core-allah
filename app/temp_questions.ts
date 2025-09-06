import { FamilyCard, DuelQuestion, ModuleQuestion, FinalProbeQuestion, SeverityProbeQuestion, ArchetypeQuestion } from '@/types/quiz';

export const FAMILY_CARDS: FamilyCard[] = [
  {
    id: "A-FAM-CTRL",
    phase: "A",
    kind: "family_card",
    family: "Control",
    blurb: "You set the call and move the plan.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-PACE",
    phase: "A",
    kind: "family_card",
    family: "Pace",
    blurb: "You keep time by picking a task and finishing it.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-BOUND",
    phase: "A",
    kind: "family_card",
    family: "Boundary",
    blurb: "You draw the line and say what can fit now.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-TRUTH",
    phase: "A",
    kind: "family_card",
    family: "Truth",
    blurb: "You hold the reason by checking facts and keeping signals clear.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-RECOG",
    phase: "A",
    kind: "family_card",
    family: "Recognition",
    blurb: "You show proof and claim the work you did.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-BOND",
    phase: "A",
    kind: "family_card",
    family: "Bonding",
    blurb: "You keep trust by caring for and protecting the link.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-STRESS",
    phase: "A",
    kind: "family_card",
    family: "Stress",
    blurb: "You act when pressure is high and others stall.",
    reading_level: "G5"
  }
];

export const DUEL_QUESTIONS: DuelQuestion[] = [
  {
    "id": "B-CTRL-CO-001",
    "phase": "B",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Two teams keep talking. No one starts.",
    "options": {
      "A": "Say 'I'll lead' and write the first step.",
      "B": "Ask for more ideas and wait."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-CTRL-CO-002",
    "phase": "B",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A call needs one owner.",
    "options": {
      "A": "Set the call and give the next step.",
      "B": "Wait for the group to choose."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-CTRL-CO-003",
    "phase": "B",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A deadline is close and the plan is loose.",
    "options": {
      "A": "Lock a simple plan and ship a first pass.",
      "B": "Keep polling to find a better plan."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-CTRL-CF-001",
    "phase": "B",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A partner resists your clear call.",
    "options": {
      "A": "Hold the call and state one firm next step.",
      "B": "Defer the call to them and stand down."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-CTRL-CF-002",
    "phase": "B",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A risky decision is needed now.",
    "options": {
      "A": "Own it; name the risk and decide.",
      "B": "Avoid deciding; ask someone else to choose."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-PACE-CO-001",
    "phase": "B",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "You have 40 minutes for a task.",
    "options": {
      "A": "Start now and finish one clean pass.",
      "B": "Open a few threads and see which sticks."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-PACE-CO-002",
    "phase": "B",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Two tasks are due today. Time for one.",
    "options": {
      "A": "Pick one and ship it now.",
      "B": "Touch both and ship later."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-PACE-CO-003",
    "phase": "B",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Mid-way, a new idea appears.",
    "options": {
      "A": "Note it; finish current pass first.",
      "B": "Switch now to the new idea."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-PACE-CF-001",
    "phase": "B",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Mid-task, a ping asks for help.",
    "options": {
      "A": "Stay on the slot; help after.",
      "B": "Drop your task and switch fully."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-BOUND-CO-001",
    "phase": "B",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "You are in focus. A 'quick' ask lands.",
    "options": {
      "A": "Say not now. Offer the next slot.",
      "B": "Say yes for five minutes."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-BOUND-CO-002",
    "phase": "B",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "Scope creep: 'One more thing?'",
    "options": {
      "A": "Not in scope. Show the path.",
      "B": "Small add is fine."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-BOUND-CO-003",
    "phase": "B",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "DMs ping while you work.",
    "options": {
      "A": "Mute and continue.",
      "B": "Peek and answer soon."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-BOUND-CF-001",
    "phase": "B",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "A VIP asks for access beyond rules.",
    "options": {
      "A": "Hold the line; offer safe workaround.",
      "B": "Wave them through and skip checks."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-TRUTH-CO-001",
    "phase": "B",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "A claim is bold with weak proof.",
    "options": {
      "A": "Ask for the data and show the check.",
      "B": "Let it pass to keep the peace."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-TRUTH-CO-002",
    "phase": "B",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Two sources disagree.",
    "options": {
      "A": "Compare methods; pick the sound one.",
      "B": "Choose the source you like more."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-TRUTH-CO-003",
    "phase": "B",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "The metric looks off.",
    "options": {
      "A": "Recheck inputs; fix the number.",
      "B": "Ignore; it’s close enough."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-TRUTH-CF-001",
    "phase": "B",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Team asks to skip checks to ship.",
    "options": {
      "A": "Hold checks; ship with proof.",
      "B": "Skip checks to match the ask."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-RECO-CO-001",
    "phase": "B",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Your work is solid but unseen.",
    "options": {
      "A": "Show a short demo with clear wins.",
      "B": "Wait and hope people notice."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-RECO-CO-002",
    "phase": "B",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "A debate drifts off-topic.",
    "options": {
      "A": "Refocus on results; keep it brief.",
      "B": "Argue for attention and validation."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-RECO-CO-003",
    "phase": "B",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "A win needs sharing.",
    "options": {
      "A": "Post clear numbers and what changed.",
      "B": "Skip the share; maybe later."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-RECO-CF-001",
    "phase": "B",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "A thread centers you, not results.",
    "options": {
      "A": "Bring it back to outcomes.",
      "B": "Push for praise and takes."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-BOND-CO-001",
    "phase": "B",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "A friend asks for help; you have a deadline.",
    "options": {
      "A": "Set a time after; finish this first.",
      "B": "Drop your work and go now."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-BOND-CO-002",
    "phase": "B",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "You owe two people a reply.",
    "options": {
      "A": "Reply one now; schedule the other.",
      "B": "Try to handle both at once."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-BOND-CO-003",
    "phase": "B",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "A 'quick call?' lands during focus.",
    "options": {
      "A": "Offer later; keep your slot.",
      "B": "Say yes now to be nice."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-BOND-CF-001",
    "phase": "B",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "You feel guilty saying no.",
    "options": {
      "A": "Say no cleanly and offer a path.",
      "B": "Say yes even when it harms your plan."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-STRESS-CO-001",
    "phase": "B",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "A blocker hits mid-run.",
    "options": {
      "A": "Cut scope and keep motion.",
      "B": "Freeze and wait for a perfect path."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "kind": "family"
  },
  {
    "id": "B-STRESS-CO-002",
    "phase": "B",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Noise rises while you ship.",
    "options": {
      "A": "Mute low-signal; act on top item.",
      "B": "Chase every ping."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-STRESS-CO-003",
    "phase": "B",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "A risk appears late.",
    "options": {
      "A": "Adjust plan; keep moving.",
      "B": "Stop entirely until all risks vanish."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 3,
    "kind": "family"
  },
  {
    "id": "B-STRESS-CF-001",
    "phase": "B",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Too many alerts pull your focus.",
    "options": {
      "A": "Mute most; act on the top alert.",
      "B": "Chase each alert as it pops."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  },
  {
    "id": "B-STRESS-CF-002",
    "phase": "B",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "People panic and look to you.",
    "options": {
      "A": "Set one step now; breathe and move.",
      "B": "Join the panic; stall out."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 2,
    "kind": "family"
  }
];

export const MODULE_QUESTIONS: ModuleQuestion[] = [
  {
    "id": "C-CTRL-REB-CO-001",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Rules slow the team; the room stalls.",
    "options": {
      "A": "Break one small rule and start a live try.",
      "B": "Ask for permission and wait."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Control:Rebel",
    "kind": "fused_face"
  },
  {
    "id": "C-CTRL-REB-CO-002",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A rigid process blocks progress.",
    "options": {
      "A": "Carve an exception; try one small step.",
      "B": "Hold for approvals."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Control:Rebel",
    "kind": "fused_face"
  },
  {
    "id": "C-CTRL-SOV-CO-001",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Two groups need one lead for a joint move.",
    "options": {
      "A": "Claim the lead and write the first task.",
      "B": "Wait for consensus to form."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Control:Sovereign",
    "kind": "fused_face"
  },
  {
    "id": "C-CTRL-SOV-CO-002",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Multiple owners create conflict.",
    "options": {
      "A": "Name one owner now; set roles.",
      "B": "Let the conflict play out."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Control:Sovereign",
    "kind": "fused_face"
  },
  {
    "id": "C-PACE-VIS-CO-001",
    "phase": "C",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Big idea; small window right now.",
    "options": {
      "A": "Sketch the north star in 3 bullets and begin.",
      "B": "Keep ideating until it feels perfect."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Pace:Visionary",
    "kind": "fused_face"
  },
  {
    "id": "C-PACE-VIS-CO-002",
    "phase": "C",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "You can inspire or tinker.",
    "options": {
      "A": "Write a clear why-now and start.",
      "B": "Keep tinkering with no start."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Pace:Visionary",
    "kind": "fused_face"
  },
  {
    "id": "C-PACE-NAV-CO-001",
    "phase": "C",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "You must cross town fast with two routes.",
    "options": {
      "A": "Pick the sure route now; move.",
      "B": "Hold to compare more routes."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Pace:Navigator",
    "kind": "fused_face"
  },
  {
    "id": "C-PACE-NAV-CO-002",
    "phase": "C",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Ambiguity vs motion.",
    "options": {
      "A": "Choose a path; adjust on the move.",
      "B": "Pause until you have full certainty."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Pace:Navigator",
    "kind": "fused_face"
  },
  {
    "id": "C-BOUND-EQL-CO-001",
    "phase": "C",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "A loud voice talks over others.",
    "options": {
      "A": "Cut in: one at a time; give the floor.",
      "B": "Let it flow and circle back later."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Boundary:Equalizer",
    "kind": "fused_face"
  },
  {
    "id": "C-BOUND-EQL-CO-002",
    "phase": "C",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "A side group is excluded.",
    "options": {
      "A": "Open the floor and balance turns.",
      "B": "Ignore; let majority run."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Boundary:Equalizer",
    "kind": "fused_face"
  },
  {
    "id": "C-BOUND-GUA-CO-001",
    "phase": "C",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "A risky link is shared to many.",
    "options": {
      "A": "Block the link and post the safe path.",
      "B": "Do nothing; assume it's fine."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Boundary:Guardian",
    "kind": "fused_face"
  },
  {
    "id": "C-BOUND-GUA-CO-002",
    "phase": "C",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "An unsafe shortcut is common.",
    "options": {
      "A": "Close the gap; post the safer flow.",
      "B": "Allow the shortcut; hope for the best."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Boundary:Guardian",
    "kind": "fused_face"
  },
  {
    "id": "C-TRUTH-SEE-CO-001",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "You sense a blind spot in the plan.",
    "options": {
      "A": "Run a quick check and show the signal.",
      "B": "Assume it's fine and move on."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Truth:Seeker",
    "kind": "fused_face"
  },
  {
    "id": "C-TRUTH-SEE-CO-002",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Data looks too good.",
    "options": {
      "A": "Check for leakage or bias.",
      "B": "Celebrate and skip the check."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Truth:Seeker",
    "kind": "fused_face"
  },
  {
    "id": "C-TRUTH-ARC-CO-001",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "The system is messy and unclear.",
    "options": {
      "A": "Draft a simple structure and name parts.",
      "B": "Leave it as is; add notes later."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Truth:Architect",
    "kind": "fused_face"
  },
  {
    "id": "C-TRUTH-ARC-CO-002",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Naming is chaotic.",
    "options": {
      "A": "Set one naming scheme now.",
      "B": "Let everyone name freely."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Truth:Architect",
    "kind": "fused_face"
  },
  {
    "id": "C-RECO-SPO-CO-001",
    "phase": "C",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Team result is ready to show.",
    "options": {
      "A": "Present the win in simple words and numbers.",
      "B": "Skip the share; post later maybe."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Recognition:Spotlight",
    "kind": "fused_face"
  },
  {
    "id": "C-RECO-SPO-CO-002",
    "phase": "C",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Stakeholders ask for a quick update.",
    "options": {
      "A": "Show a 60-second demo focused on outcomes.",
      "B": "Delay until a bigger show."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Recognition:Spotlight",
    "kind": "fused_face"
  },
  {
    "id": "C-RECO-DIP-CO-001",
    "phase": "C",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Two teams disagree on credit.",
    "options": {
      "A": "Bridge the views and name shared gains.",
      "B": "Take sides; escalate the fight."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Recognition:Diplomat",
    "kind": "fused_face"
  },
  {
    "id": "C-RECO-DIP-CO-002",
    "phase": "C",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "A partner feels overlooked.",
    "options": {
      "A": "Acknowledge publicly; connect their work to the win.",
      "B": "Ignore the feeling; move on."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Recognition:Diplomat",
    "kind": "fused_face"
  },
  {
    "id": "C-BOND-PAR-CO-001",
    "phase": "C",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Your close partner is stressed before a demo.",
    "options": {
      "A": "Stay close; ground them and keep pace.",
      "B": "Step back and hope they sort it out."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Bonding:Partner",
    "kind": "fused_face"
  },
  {
    "id": "C-BOND-PAR-CO-002",
    "phase": "C",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "A teammate spirals in worry.",
    "options": {
      "A": "Anchor them; give one next action.",
      "B": "Let them vent without support."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Bonding:Partner",
    "kind": "fused_face"
  },
  {
    "id": "C-BOND-PRO-CO-001",
    "phase": "C",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "A teammate is blocked by a missing tool.",
    "options": {
      "A": "Get the tool now; unblock the flow.",
      "B": "Tell them to wait until later."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Bonding:Provider",
    "kind": "fused_face"
  },
  {
    "id": "C-BOND-PRO-CO-002",
    "phase": "C",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Someone lacks context for a task.",
    "options": {
      "A": "Provide the missing piece now.",
      "B": "Let them figure it out alone."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Bonding:Provider",
    "kind": "fused_face"
  },
  {
    "id": "C-STRESS-CAT-CO-001",
    "phase": "C",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "The room is flat and slow.",
    "options": {
      "A": "Spark a quick test to wake motion.",
      "B": "Wait until energy returns on its own."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Stress:Catalyst",
    "kind": "fused_face"
  },
  {
    "id": "C-STRESS-CAT-CO-002",
    "phase": "C",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Everyone hesitates to start.",
    "options": {
      "A": "Kick off a 10-minute try.",
      "B": "Call another planning meeting."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Stress:Catalyst",
    "kind": "fused_face"
  },
  {
    "id": "C-STRESS-ART-CO-001",
    "phase": "C",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Quality slipped in the last build.",
    "options": {
      "A": "Tighten one step; raise the bar today.",
      "B": "Ignore it; fix later when calm."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Stress:Artisan",
    "kind": "fused_face"
  },
  {
    "id": "C-STRESS-ART-CO-002",
    "phase": "C",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Defects repeat.",
    "options": {
      "A": "Add a check; teach the step.",
      "B": "Hope the next run is clean."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 2,
    "face": "Stress:Artisan",
    "kind": "fused_face"
  },
  {
    "id": "C-EXTRA-SOV-MICRO-001",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Crowd stalls on roles.",
    "options": {
      "A": "Assign roles now; move.",
      "B": "Let roles stay fuzzy."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Control:Sovereign",
    "kind": "fused_face"
  },
  {
    "id": "C-EXTRA-ARC-MICRO-001",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Folders are chaos.",
    "options": {
      "A": "Create one clear structure now.",
      "B": "Leave the chaos for later."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "type": "CO",
    "order": 1,
    "face": "Truth:Architect",
    "kind": "fused_face"
  },
  // CF questions for Phase C (order 3)
  {
    "id": "C-CTRL-REB-CF-001",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A rule blocks a clear win. The team looks to you.",
    "options": {
      "A": "Break the rule; own the call.",
      "B": "Follow the rule; miss the win."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Control:Rebel",
    "kind": "fused_face"
  },
  {
    "id": "C-CTRL-SOV-CF-001",
    "phase": "C",
    "line": "Control",
    "lineId": "Control",
    "prompt": "A partner resists your clear call.",
    "options": {
      "A": "Hold the call; state the next step.",
      "B": "Defer to them; avoid conflict."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Control:Sovereign",
    "kind": "fused_face"
  },
  {
    "id": "C-PACE-VIS-CF-001",
    "phase": "C",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "The vision is clear but the path is risky.",
    "options": {
      "A": "Take the risk; start the vision.",
      "B": "Wait for a safer path."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Pace:Visionary",
    "kind": "fused_face"
  },
  {
    "id": "C-PACE-NAV-CF-001",
    "phase": "C",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "The safe route is slow; the fast route is uncertain.",
    "options": {
      "A": "Take the fast route; adjust as needed.",
      "B": "Stick to the safe route."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Pace:Navigator",
    "kind": "fused_face"
  },
  {
    "id": "C-BOUND-EQL-CF-001",
    "phase": "C",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "A powerful person breaks the rules. Others notice.",
    "options": {
      "A": "Call it out; restore fairness.",
      "B": "Ignore it; avoid confrontation."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Boundary:Equalizer",
    "kind": "fused_face"
  },
  {
    "id": "C-BOUND-GUA-CF-001",
    "phase": "C",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "Someone takes a dangerous shortcut. Others might copy.",
    "options": {
      "A": "Stop them; protect the group.",
      "B": "Let it slide; avoid conflict."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Boundary:Guardian",
    "kind": "fused_face"
  },
  {
    "id": "C-TRUTH-SEE-CF-001",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "You see a critical flaw. Speaking up will delay the launch.",
    "options": {
      "A": "Speak up; fix the flaw.",
      "B": "Stay quiet; meet the deadline."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Truth:Seeker",
    "kind": "fused_face"
  },
  {
    "id": "C-TRUTH-ARC-CF-001",
    "phase": "C",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "The system is broken but fixing it will take time.",
    "options": {
      "A": "Fix it properly; delay the release.",
      "B": "Ship it broken; fix later."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Truth:Architect",
    "kind": "fused_face"
  },
  {
    "id": "C-RECO-SPO-CF-001",
    "phase": "C",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "You need to claim credit to get resources, but it feels wrong.",
    "options": {
      "A": "Claim credit; get the resources.",
      "B": "Stay humble; work with less."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Recognition:Spotlight",
    "kind": "fused_face"
  },
  {
    "id": "C-RECO-DIP-CF-001",
    "phase": "C",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "You need to take sides to get support, but it will divide the team.",
    "options": {
      "A": "Take sides; get the support.",
      "B": "Stay neutral; lose the support."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Recognition:Diplomat",
    "kind": "fused_face"
  },
  {
    "id": "C-BOND-PAR-CF-001",
    "phase": "C",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Your partner needs you, but you have a deadline.",
    "options": {
      "A": "Help them; miss the deadline.",
      "B": "Focus on work; let them struggle."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Bonding:Partner",
    "kind": "fused_face"
  },
  {
    "id": "C-BOND-PRO-CF-001",
    "phase": "C",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Someone needs help, but helping will hurt your own work.",
    "options": {
      "A": "Help them; sacrifice your work.",
      "B": "Focus on your work; let them fail."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Bonding:Provider",
    "kind": "fused_face"
  },
  {
    "id": "C-STRESS-CAT-CF-001",
    "phase": "C",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "The team is panicking. You need to act fast but might make mistakes.",
    "options": {
      "A": "Act fast; risk mistakes.",
      "B": "Wait for calm; miss the moment."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Stress:Catalyst",
    "kind": "fused_face"
  },
  {
    "id": "C-STRESS-ART-CF-001",
    "phase": "C",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Quality is slipping under pressure. You need to ship fast.",
    "options": {
      "A": "Maintain quality; delay the ship.",
      "B": "Ship fast; accept lower quality."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "type": "CF",
    "order": 3,
    "face": "Stress:Artisan",
    "kind": "fused_face"
  }
];

export const FINAL_PROBE_QUESTIONS: FinalProbeQuestion[] = [
  {
    "id": "D-FINAL-CTRL-CO-001",
    "phase": "D",
    "line": "Control",
    "lineId": "Control",
    "prompt": "When plans wobble, do you restate the call?",
    "options": {
      "A": "Yes. I restate and set one next step.",
      "B": "No. I wait for others to decide."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-CTRL-CF-001",
    "phase": "D",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Under pressure, do you hand off the hard call?",
    "options": {
      "A": "No. I keep it and decide.",
      "B": "Yes. I pass it off."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-PACE-CO-001",
    "phase": "D",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Do you finish one thing before opening another?",
    "options": {
      "A": "Yes. One slot to done.",
      "B": "No. I juggle many threads."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-PACE-CF-001",
    "phase": "D",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Do you drop your plan when people ping you?",
    "options": {
      "A": "No. I help after my slot.",
      "B": "Yes. I switch right away."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-BOUND-CO-001",
    "phase": "D",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "Do you say 'not now' when you’re in focus?",
    "options": {
      "A": "Yes. I offer a later slot.",
      "B": "No. I say yes now."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-BOUND-CF-001",
    "phase": "D",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "Do you let 'special cases' cross your line?",
    "options": {
      "A": "No. I keep the line and offer a path.",
      "B": "Yes. I wave them through."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-TRUTH-CO-001",
    "phase": "D",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "When sources clash, do you check methods?",
    "options": {
      "A": "Yes. I pick the sound method.",
      "B": "No. I pick the one I like."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-TRUTH-CF-001",
    "phase": "D",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Rushed: do you skip checks to ship?",
    "options": {
      "A": "No. I keep the checks.",
      "B": "Yes. I skip them."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-RECO-CO-001",
    "phase": "D",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Do you show results in plain words and numbers?",
    "options": {
      "A": "Yes. I show the win.",
      "B": "No. I hope people notice."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-RECO-CF-001",
    "phase": "D",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Do you chase attention over outcomes?",
    "options": {
      "A": "No. I anchor to outcomes.",
      "B": "Yes. I chase attention."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-BOND-CO-001",
    "phase": "D",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Do you keep commitments when people ask for 'quick' help?",
    "options": {
      "A": "Yes. I help later.",
      "B": "No. I say yes now."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-BOND-CF-001",
    "phase": "D",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Do you agree even when it breaks your plan?",
    "options": {
      "A": "No. I keep my plan.",
      "B": "Yes. I agree anyway."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-STRESS-CO-001",
    "phase": "D",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Do you keep motion when risk appears?",
    "options": {
      "A": "Yes. Adjust and move.",
      "B": "No. I stop until certain."
    },
    "mappings": {
      "A": "C",
      "B": "O"
    },
    "kind": "final_probe"
  },
  {
    "id": "D-FINAL-STRESS-CF-001",
    "phase": "D",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Do you chase every alert during crunch?",
    "options": {
      "A": "No. I act on the top alert only.",
      "B": "Yes. I chase all of them."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "final_probe"
  }
];

export const SEVERITY_PROBE_QUESTIONS: SeverityProbeQuestion[] = [
  {
    "id": "D-SEV-CTRL-001",
    "phase": "D",
    "line": "Control",
    "lineId": "Control",
    "prompt": "Do you often hand off hard calls to avoid blame?",
    "options": {
      "A": "No, I keep the call.",
      "B": "Yes, I pass it off."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  },
  {
    "id": "D-SEV-PACE-001",
    "phase": "D",
    "line": "Pace",
    "lineId": "Pace",
    "prompt": "Do you drop your plan when people ping you?",
    "options": {
      "A": "No, I finish then help.",
      "B": "Yes, I switch right away."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  },
  {
    "id": "D-SEV-BOUND-001",
    "phase": "D",
    "line": "Boundary",
    "lineId": "Boundary",
    "prompt": "Do you say yes when it harms your focus?",
    "options": {
      "A": "No, I keep the line.",
      "B": "Yes, I say yes anyway."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  },
  {
    "id": "D-SEV-TRUTH-001",
    "phase": "D",
    "line": "Truth",
    "lineId": "Truth",
    "prompt": "Do you ship claims without checks when rushed?",
    "options": {
      "A": "No, I check anyway.",
      "B": "Yes, I skip the checks."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  },
  {
    "id": "D-SEV-RECO-001",
    "phase": "D",
    "line": "Recognition",
    "lineId": "Recognition",
    "prompt": "Do you chase attention over results?",
    "options": {
      "A": "No, results first.",
      "B": "Yes, I push for attention."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  },
  {
    "id": "D-SEV-BOND-001",
    "phase": "D",
    "line": "Bonding",
    "lineId": "Bonding",
    "prompt": "Do you agree to help even when it breaks your plan?",
    "options": {
      "A": "No, I set a later time.",
      "B": "Yes, I agree now."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  },
  {
    "id": "D-SEV-STRESS-001",
    "phase": "D",
    "line": "Stress",
    "lineId": "Stress",
    "prompt": "Do you freeze instead of moving one step?",
    "options": {
      "A": "No, I move one step.",
      "B": "Yes, I freeze and wait."
    },
    "mappings": {
      "A": "C",
      "B": "F"
    },
    "kind": "severity_probe"
  }
];

export const ANCHOR_BLURBS: Record<string, string> = {
  "Control": "You are most yourself when you set the call and move the plan.",
  "Pace": "You are most yourself when you keep time by choosing one task and finishing it.",
  "Boundary": "You are most yourself when you draw the line and say what can fit now.",
  "Truth": "You are most yourself when you hold the reason and keep signals clear.",
  "Recognition": "You are most yourself when you show proof and claim the work you did.",
  "Bonding": "You are most yourself when you keep trust by caring for and protecting the link.",
  "Stress": "You are most yourself when you act under pressure while others stall."
};

export const ARCHETYPE_QUESTIONS: ArchetypeQuestion[] = [
  // Control family
  {
    "id": "CORE-CTRL-01",
    "family": "Control",
    "archetypes": ["Sovereign", "Rebel"],
    "prompt": "When you lead, what feels right at your core?",
    "options": {
      "A": "Set the line so others can move with you.",
      "B": "Break the line so movement starts again."
    },
    "map": {
      "A": "Sovereign",
      "B": "Rebel"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-CTRL-02",
    "family": "Control",
    "archetypes": ["Sovereign", "Rebel"],
    "prompt": "Rules to you are mainly…",
    "options": {
      "A": "Language I declare so work is clear.",
      "B": "Material I bend to open the path."
    },
    "map": {
      "A": "Sovereign",
      "B": "Rebel"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-CTRL-03",
    "family": "Control",
    "archetypes": ["Sovereign", "Rebel"],
    "prompt": "Power, in your body, feels like…",
    "options": {
      "A": "Calm authority that others align to.",
      "B": "A spark that flips the room into motion."
    },
    "map": {
      "A": "Sovereign",
      "B": "Rebel"
    },
    "reading_level": "G5"
  },
  // Pace family
  {
    "id": "CORE-PACE-01",
    "family": "Pace",
    "archetypes": ["Visionary", "Navigator"],
    "prompt": "What pulls you more when you move?",
    "options": {
      "A": "The end picture that calls from the future.",
      "B": "The next step that keeps the route clean."
    },
    "map": {
      "A": "Visionary",
      "B": "Navigator"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-PACE-02",
    "family": "Pace",
    "archetypes": ["Visionary", "Navigator"],
    "prompt": "Your time sense is mostly…",
    "options": {
      "A": "Timing the reveal when the arc is ready.",
      "B": "Pacing the work so it finishes on time."
    },
    "map": {
      "A": "Visionary",
      "B": "Navigator"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-PACE-03",
    "family": "Pace",
    "archetypes": ["Visionary", "Navigator"],
    "prompt": "When paths split, you trust…",
    "options": {
      "A": "The bold line that fits the long story.",
      "B": "The simple line that lands a result now."
    },
    "map": {
      "A": "Visionary",
      "B": "Navigator"
    },
    "reading_level": "G5"
  },
  // Boundary family
  {
    "id": "CORE-BOUND-01",
    "family": "Boundary",
    "archetypes": ["Equalizer", "Guardian"],
    "prompt": "Your first duty feels like…",
    "options": {
      "A": "Keep the field fair so power is balanced.",
      "B": "Keep people safe so harm does not land."
    },
    "map": {
      "A": "Equalizer",
      "B": "Guardian"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOUND-02",
    "family": "Boundary",
    "archetypes": ["Equalizer", "Guardian"],
    "prompt": "When lines get fuzzy, you…",
    "options": {
      "A": "Redraw the rule so all play by it.",
      "B": "Shield the person most at risk."
    },
    "map": {
      "A": "Equalizer",
      "B": "Guardian"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOUND-03",
    "family": "Boundary",
    "archetypes": ["Equalizer", "Guardian"],
    "prompt": "What settles you more?",
    "options": {
      "A": "Shared limits that make things fair.",
      "B": "Knowing the vulnerable are protected."
    },
    "map": {
      "A": "Equalizer",
      "B": "Guardian"
    },
    "reading_level": "G5"
  },
  // Truth family
  {
    "id": "CORE-TRUTH-01",
    "family": "Truth",
    "archetypes": ["Seeker", "Architect"],
    "prompt": "Truth, to you, shows up first as…",
    "options": {
      "A": "A live signal I can test in the wild.",
      "B": "A clear frame I can build and check."
    },
    "map": {
      "A": "Seeker",
      "B": "Architect"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-TRUTH-02",
    "family": "Truth",
    "archetypes": ["Seeker", "Architect"],
    "prompt": "Your mind rests better when…",
    "options": {
      "A": "Patterns emerge from real examples.",
      "B": "Definitions lock and terms stay clean."
    },
    "map": {
      "A": "Seeker",
      "B": "Architect"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-TRUTH-03",
    "family": "Truth",
    "archetypes": ["Seeker", "Architect"],
    "prompt": "Your core move with confusion is…",
    "options": {
      "A": "Ask for the one signal that matters.",
      "B": "Draw the structure so parts fit right."
    },
    "map": {
      "A": "Seeker",
      "B": "Architect"
    },
    "reading_level": "G5"
  },
  // Recognition family
  {
    "id": "CORE-RECOG-01",
    "family": "Recognition",
    "archetypes": ["Spotlight", "Diplomat"],
    "prompt": "How do you make change real?",
    "options": {
      "A": "Shine a light so people see and move.",
      "B": "Bridge sides so people align and move."
    },
    "map": {
      "A": "Spotlight",
      "B": "Diplomat"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-RECOG-02",
    "family": "Recognition",
    "archetypes": ["Spotlight", "Diplomat"],
    "prompt": "Your proof lives mostly in…",
    "options": {
      "A": "Public signal that carries far.",
      "B": "Quiet deals that unlock doors."
    },
    "map": {
      "A": "Spotlight",
      "B": "Diplomat"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-RECOG-03",
    "family": "Recognition",
    "archetypes": ["Spotlight", "Diplomat"],
    "prompt": "What feels more honest to you?",
    "options": {
      "A": "Stand up and show the win.",
      "B": "Line up the room, then share the win."
    },
    "map": {
      "A": "Spotlight",
      "B": "Diplomat"
    },
    "reading_level": "G5"
  },
  // Bonding family
  {
    "id": "CORE-BOND-01",
    "family": "Bonding",
    "archetypes": ["Partner", "Provider"],
    "prompt": "Care, in your body, is mostly…",
    "options": {
      "A": "Being there with you through the hard part.",
      "B": "Doing the thing so your load is lighter."
    },
    "map": {
      "A": "Partner",
      "B": "Provider"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOND-02",
    "family": "Bonding",
    "archetypes": ["Partner", "Provider"],
    "prompt": "What proves love to you more?",
    "options": {
      "A": "We face it side by side.",
      "B": "I handle it so you can rest."
    },
    "map": {
      "A": "Partner",
      "B": "Provider"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOND-03",
    "family": "Bonding",
    "archetypes": ["Partner", "Provider"],
    "prompt": "Your bond keeps strength by…",
    "options": {
      "A": "Staying close in the storm.",
      "B": "Taking care of the needs."
    },
    "map": {
      "A": "Partner",
      "B": "Provider"
    },
    "reading_level": "G5"
  },
  // Stress family
  {
    "id": "CORE-STRESS-01",
    "family": "Stress",
    "archetypes": ["Catalyst", "Artisan"],
    "prompt": "Under stress, your gift is…",
    "options": {
      "A": "Ignite motion and cut the drag.",
      "B": "Keep quality and land one clean piece."
    },
    "map": {
      "A": "Catalyst",
      "B": "Artisan"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-STRESS-02",
    "family": "Stress",
    "archetypes": ["Catalyst", "Artisan"],
    "prompt": "What do you trust more when it's tight?",
    "options": {
      "A": "Start the chain and push it forward.",
      "B": "Craft the standard others can copy."
    },
    "map": {
      "A": "Catalyst",
      "B": "Artisan"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-STRESS-03",
    "family": "Stress",
    "archetypes": ["Catalyst", "Artisan"],
    "prompt": "Your core pride comes from…",
    "options": {
      "A": "Making the first move that changes the field.",
      "B": "Making the thing so well it holds up."
    },
    "map": {
      "A": "Catalyst",
      "B": "Artisan"
    },
    "reading_level": "G5"
  }
];

// Helper functions for archetype questions
export function getArchetypeQuestionsForFamily(family: string): ArchetypeQuestion[] {
  return ARCHETYPE_QUESTIONS.filter(q => q.family === family);
}

export function getArchetypesForFamily(family: string): string[] {
  const questions = getArchetypeQuestionsForFamily(family);
  return questions.length > 0 ? questions[0].archetypes : [];
}
