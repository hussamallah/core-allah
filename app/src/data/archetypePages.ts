export interface ArchetypePageData {
  id: string;
  name: string;
  nickname: string;
  family: string;
  description: string;
  color: string;
  content: {
    overview: string;
    strengths: string[];
    challenges: string[];
    growthAreas: string[];
    relationships: {
      worksWellWith: string[];
      conflictsWith: string[];
    };
    careerPaths: string[];
    dailyPractices: string[];
    quotes: string[];
  };
}

export const ARCHETYPE_PAGES: Record<string, ArchetypePageData> = {
  "sovereign": {
    id: "Control:Sovereign",
    name: "Sovereign",
    nickname: "Commander",
    family: "Control",
    description: "Seen as the authority who sets the line and directs others to move with clarity.",
    color: "Gold",
    content: {
      overview: "The Sovereign is the natural leader who takes charge and sets clear direction. You're the one people look to when decisions need to be made and action needs to be taken.",
      strengths: [
        "Natural authority and presence",
        "Clear decision-making ability",
        "Ability to inspire and motivate others",
        "Strong sense of responsibility",
        "Confident in high-pressure situations"
      ],
      challenges: [
        "Can be perceived as controlling",
        "May struggle with delegation",
        "Tendency to take on too much responsibility",
        "Difficulty admitting mistakes",
        "Can overwhelm others with intensity"
      ],
      growthAreas: [
        "Learn to create consent before taking charge",
        "Practice active listening and collaboration",
        "Develop patience with slower processes",
        "Build skills in mentoring others",
        "Cultivate humility and vulnerability"
      ],
      relationships: {
        worksWellWith: ["Navigator", "Architect", "Provider"],
        conflictsWith: ["Rebel", "Catalyst", "Seeker"]
      },
      careerPaths: [
        "Executive Leadership",
        "Project Management",
        "Military Command",
        "Political Leadership",
        "Entrepreneurship"
      ],
      dailyPractices: [
        "Write a 3-step frame and assign owners",
        "Ask for input before making major decisions",
        "Practice saying 'I don't know' when appropriate",
        "Delegate one task you normally do yourself",
        "Listen without responding for 2 minutes"
      ],
      quotes: [
        "Leadership is not about being in charge. It's about taking care of those in your charge.",
        "The best leaders are those most interested in surrounding themselves with assistants and associates smarter than they are.",
        "A leader is one who knows the way, goes the way, and shows the way."
      ]
    }
  },
  "rebel": {
    id: "Control:Rebel",
    name: "Rebel",
    nickname: "Disruptor",
    family: "Control",
    description: "Read as the spark that breaks rules to restart motion, though not always trusted with leadership.",
    color: "Red",
    content: {
      overview: "The Rebel is the catalyst for change who challenges the status quo and breaks through barriers. You're the one who sees what's broken and isn't afraid to shake things up.",
      strengths: [
        "Fearless in challenging authority",
        "Creative problem-solving approach",
        "High energy and passion",
        "Ability to see through facades",
        "Natural change agent"
      ],
      challenges: [
        "Can be seen as disruptive or negative",
        "May struggle with follow-through",
        "Tendency to burn bridges",
        "Difficulty with routine tasks",
        "Can alienate potential allies"
      ],
      growthAreas: [
        "Learn to build structure while breaking it",
        "Develop patience with gradual change",
        "Practice constructive criticism",
        "Build coalitions before acting",
        "Cultivate respect for different approaches"
      ],
      relationships: {
        worksWellWith: ["Catalyst", "Seeker", "Visionary"],
        conflictsWith: ["Sovereign", "Guardian", "Architect"]
      },
      careerPaths: [
        "Innovation Consulting",
        "Social Activism",
        "Creative Industries",
        "Startup Culture",
        "Research & Development"
      ],
      dailyPractices: [
        "Name the constraint and pick the next smallest ship",
        "Find one thing to build before breaking something",
        "Ask 'What if we tried...' instead of 'This is wrong'",
        "Listen to one opposing viewpoint fully",
        "Complete one routine task without shortcuts"
      ],
      quotes: [
        "The reasonable man adapts himself to the world; the unreasonable one persists in trying to adapt the world to himself.",
        "If you want to make enemies, try to change something.",
        "Innovation distinguishes between a leader and a follower."
      ]
    }
  },
  "visionary": {
    id: "Pace:Visionary",
    name: "Visionary",
    nickname: "Future-seer",
    family: "Pace",
    description: "Recognized for pointing to the long arc and painting the future picture, even if timing wobbles.",
    color: "Purple",
    content: {
      overview: "The Visionary sees possibilities others miss and paints compelling pictures of what could be. You're the one who inspires others with your big-picture thinking and future-focused perspective.",
      strengths: [
        "Exceptional long-term thinking",
        "Ability to inspire and motivate",
        "Creative problem-solving",
        "Natural optimism and hope",
        "Strong intuition about trends"
      ],
      challenges: [
        "Can lose focus on immediate details",
        "May struggle with implementation",
        "Tendency to overpromise",
        "Difficulty with routine tasks",
        "Can be seen as unrealistic"
      ],
      growthAreas: [
        "Freeze scope; open a follow-on lane",
        "Develop concrete next steps",
        "Practice grounding ideas in reality",
        "Build implementation skills",
        "Learn to communicate timelines clearly"
      ],
      relationships: {
        worksWellWith: ["Navigator", "Architect", "Diplomat"],
        conflictsWith: ["Guardian", "Provider", "Artisan"]
      },
      careerPaths: [
        "Strategic Planning",
        "Innovation Leadership",
        "Consulting",
        "Product Development",
        "Futurism"
      ],
      dailyPractices: [
        "Write down one concrete step for each big idea",
        "Set realistic timelines for projects",
        "Ask 'What needs to happen first?'",
        "Practice explaining complex ideas simply",
        "Ground one vision in current reality"
      ],
      quotes: [
        "The future belongs to those who believe in the beauty of their dreams.",
        "Vision without action is merely a dream. Action without vision just passes the time.",
        "The best way to predict the future is to create it."
      ]
    }
  },
  "navigator": {
    id: "Pace:Navigator",
    name: "Navigator",
    nickname: "Pathfinder",
    family: "Pace",
    description: "Trusted to keep routes clean and tasks paced so work actually lands on time.",
    color: "Teal",
    content: {
      overview: "The Navigator is the practical planner who maps out the path and keeps everyone moving forward efficiently. You're the one who ensures projects stay on track and deadlines are met.",
      strengths: [
        "Excellent planning and organization",
        "Reliable and consistent",
        "Strong attention to detail",
        "Ability to break down complex tasks",
        "Natural project management skills"
      ],
      challenges: [
        "Can be overly rigid with plans",
        "May struggle with sudden changes",
        "Tendency to micromanage",
        "Difficulty with ambiguity",
        "Can be seen as inflexible"
      ],
      growthAreas: [
        "Develop flexibility with changing plans",
        "Practice delegating more effectively",
        "Learn to embrace some uncertainty",
        "Build skills in creative problem-solving",
        "Cultivate patience with different working styles"
      ],
      relationships: {
        worksWellWith: ["Sovereign", "Architect", "Provider"],
        conflictsWith: ["Rebel", "Catalyst", "Visionary"]
      },
      careerPaths: [
        "Project Management",
        "Operations",
        "Logistics",
        "Process Improvement",
        "Administration"
      ],
      dailyPractices: [
        "Name the constraint and pick the next smallest ship",
        "Build in 20% buffer time for unexpected changes",
        "Ask 'What could go wrong?' and plan for it",
        "Practice saying 'Let me think about that' before committing",
        "Delegate one task you normally do yourself"
      ],
      quotes: [
        "A goal without a plan is just a wish.",
        "The secret of getting ahead is getting started.",
        "Success is the sum of small efforts repeated day in and day out."
      ]
    }
  },
  "equalizer": {
    id: "Boundary:Equalizer",
    name: "Equalizer",
    nickname: "Referee",
    family: "Boundary",
    description: "Installed as the fairness enforcer who redraws lines so no one overpowers the rest.",
    color: "Green",
    content: {
      overview: "The Equalizer is the justice-seeker who ensures fairness and balance in all situations. You're the one who speaks up when something isn't right and works to create equity for everyone.",
      strengths: [
        "Strong sense of justice and fairness",
        "Excellent mediation skills",
        "Ability to see multiple perspectives",
        "Natural conflict resolution abilities",
        "Commitment to equality"
      ],
      challenges: [
        "Can be seen as overly critical",
        "May struggle with making tough decisions",
        "Tendency to avoid taking sides",
        "Difficulty with hierarchical structures",
        "Can be perceived as indecisive"
      ],
      growthAreas: [
        "Write a 3-step frame and assign owners",
        "Practice making decisions even when not everyone agrees",
        "Develop skills in difficult conversations",
        "Learn to balance fairness with efficiency",
        "Cultivate courage in standing up for what's right"
      ],
      relationships: {
        worksWellWith: ["Diplomat", "Provider", "Guardian"],
        conflictsWith: ["Sovereign", "Catalyst", "Spotlight"]
      },
      careerPaths: [
        "Human Resources",
        "Legal Advocacy",
        "Social Work",
        "Mediation",
        "Non-profit Leadership"
      ],
      dailyPractices: [
        "Ask 'What would be fair here?' before deciding",
        "Practice saying 'I need to think about this' before responding",
        "Look for win-win solutions in conflicts",
        "Speak up when you see injustice",
        "Listen to all sides before forming an opinion"
      ],
      quotes: [
        "Injustice anywhere is a threat to justice everywhere.",
        "The arc of the moral universe is long, but it bends toward justice.",
        "Fairness is not an attitude. It's a professional skill that must be developed and exercised."
      ]
    }
  },
  "guardian": {
    id: "Boundary:Guardian",
    name: "Guardian",
    nickname: "Protector",
    family: "Boundary",
    description: "Read as the shield who protects the vulnerable and keeps harm from landing.",
    color: "Light Blue",
    content: {
      overview: "The Guardian is the protector who watches over others and ensures their safety and well-being. You're the one people turn to when they need protection or support.",
      strengths: [
        "Natural protective instincts",
        "Strong sense of responsibility for others",
        "Excellent crisis management skills",
        "Loyalty and commitment",
        "Ability to anticipate threats"
      ],
      challenges: [
        "Can be overly controlling",
        "May struggle with letting others take risks",
        "Tendency to take on too much responsibility",
        "Difficulty with boundaries",
        "Can be seen as overprotective"
      ],
      growthAreas: [
        "Freeze scope; open a follow-on lane",
        "Learn to let others learn from their mistakes",
        "Develop skills in empowering others",
        "Practice setting healthy boundaries",
        "Cultivate trust in others' abilities"
      ],
      relationships: {
        worksWellWith: ["Provider", "Partner", "Architect"],
        conflictsWith: ["Rebel", "Catalyst", "Seeker"]
      },
      careerPaths: [
        "Security",
        "Healthcare",
        "Social Services",
        "Emergency Services",
        "Child Protection"
      ],
      dailyPractices: [
        "Ask 'What do you need?' before offering help",
        "Practice saying 'I trust you to handle this'",
        "Let someone else take the lead on a project",
        "Set one clear boundary and stick to it",
        "Focus on empowering rather than protecting"
      ],
      quotes: [
        "The ultimate measure of a man is not where he stands in moments of comfort, but where he stands at times of challenge.",
        "Courage is not the absence of fear, but action in spite of it.",
        "Protection is not a principle, but an expedient."
      ]
    }
  },
  "seeker": {
    id: "Truth:Seeker",
    name: "Seeker",
    nickname: "Truth-hunter",
    family: "Truth",
    description: "Cast as the one who hunts signals and tests reality directly in the field.",
    color: "Blue",
    content: {
      overview: "The Seeker is the truth-hunter who digs deep to find answers and test assumptions. You're the one who questions everything and isn't satisfied with surface-level explanations.",
      strengths: [
        "Natural curiosity and questioning nature",
        "Excellent research and investigation skills",
        "Ability to see through falsehoods",
        "Strong analytical thinking",
        "Commitment to truth and accuracy"
      ],
      challenges: [
        "Can be seen as overly skeptical",
        "May struggle with accepting things on faith",
        "Tendency to over-analyze",
        "Difficulty with quick decisions",
        "Can be perceived as negative or critical"
      ],
      growthAreas: [
        "Write a 3-step frame and assign owners",
        "Practice making decisions with incomplete information",
        "Develop skills in presenting findings clearly",
        "Learn to balance skepticism with openness",
        "Cultivate patience with others' processes"
      ],
      relationships: {
        worksWellWith: ["Architect", "Diplomat", "Visionary"],
        conflictsWith: ["Sovereign", "Guardian", "Provider"]
      },
      careerPaths: [
        "Research",
        "Journalism",
        "Investigation",
        "Science",
        "Consulting"
      ],
      dailyPractices: [
        "Ask 'What evidence do we have?' before deciding",
        "Practice saying 'I need more information' when appropriate",
        "Look for three different sources before forming an opinion",
        "Question one assumption you normally take for granted",
        "Share your findings in simple, clear language"
      ],
      quotes: [
        "The truth will set you free, but first it will piss you off.",
        "Doubt is not a pleasant condition, but certainty is absurd.",
        "The important thing is not to stop questioning."
      ]
    }
  },
  "architect": {
    id: "Truth:Architect",
    name: "Architect",
    nickname: "Builder",
    family: "Truth",
    description: "Seen as the structurer who defines frames and fits pieces together until the model holds.",
    color: "Yellow",
    content: {
      overview: "The Architect is the system-builder who creates structure and order from chaos. You're the one who designs frameworks and ensures everything fits together logically.",
      strengths: [
        "Excellent system design skills",
        "Strong logical thinking",
        "Ability to see patterns and connections",
        "Natural problem-solving abilities",
        "Attention to detail and precision"
      ],
      challenges: [
        "Can be overly rigid with systems",
        "May struggle with ambiguity",
        "Tendency to over-engineer solutions",
        "Difficulty with rapid changes",
        "Can be seen as inflexible"
      ],
      growthAreas: [
        "Name the constraint and pick the next smallest ship",
        "Learn to embrace some chaos and uncertainty",
        "Develop skills in rapid prototyping",
        "Practice building flexible systems",
        "Cultivate patience with iterative processes"
      ],
      relationships: {
        worksWellWith: ["Sovereign", "Navigator", "Seeker"],
        conflictsWith: ["Rebel", "Catalyst", "Visionary"]
      },
      careerPaths: [
        "Systems Design",
        "Engineering",
        "Software Development",
        "Process Design",
        "Consulting"
      ],
      dailyPractices: [
        "Start with a simple version before building complex systems",
        "Ask 'What's the minimum viable solution?'",
        "Practice saying 'Let's test this first' before implementing",
        "Build in flexibility for future changes",
        "Focus on user needs over technical perfection"
      ],
      quotes: [
        "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
        "The best way to get a good idea is to get lots of ideas.",
        "Simplicity is the ultimate sophistication."
      ]
    }
  },
  "spotlight": {
    id: "Recognition:Spotlight",
    name: "Spotlight",
    nickname: "Performer",
    family: "Recognition",
    description: "Read as the one who shines a light publicly so others see and move.",
    color: "Violet",
    content: {
      overview: "The Spotlight is the performer who draws attention and inspires action through public presence. You're the one who motivates others by being visible and leading by example.",
      strengths: [
        "Natural charisma and presence",
        "Excellent communication skills",
        "Ability to inspire and motivate others",
        "Comfortable with public attention",
        "Strong leadership through visibility"
      ],
      challenges: [
        "Can be seen as attention-seeking",
        "May struggle with working behind the scenes",
        "Tendency to take on too much responsibility",
        "Difficulty with criticism",
        "Can be perceived as self-centered"
      ],
      growthAreas: [
        "Write a 3-step frame and assign owners",
        "Learn to work effectively behind the scenes",
        "Develop skills in listening and collaboration",
        "Practice humility and giving others credit",
        "Cultivate patience with slower processes"
      ],
      relationships: {
        worksWellWith: ["Sovereign", "Visionary", "Catalyst"],
        conflictsWith: ["Guardian", "Provider", "Artisan"]
      },
      careerPaths: [
        "Public Speaking",
        "Entertainment",
        "Marketing",
        "Leadership Development",
        "Media"
      ],
      dailyPractices: [
        "Ask 'How can I help others shine?' before taking center stage",
        "Practice saying 'What do you think?' before sharing your opinion",
        "Give credit to others for their contributions",
        "Listen more than you speak in meetings",
        "Focus on the message, not the messenger"
      ],
      quotes: [
        "A leader is one who knows the way, goes the way, and shows the way.",
        "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things.",
        "Leadership is not about being in charge. It's about taking care of those in your charge."
      ]
    }
  },
  "diplomat": {
    id: "Recognition:Diplomat",
    name: "Diplomat",
    nickname: "Bridge-builder",
    family: "Recognition",
    description: "Installed as the connector who negotiates sides quietly and aligns groups into motion.",
    color: "Amber",
    content: {
      overview: "The Diplomat is the bridge-builder who connects people and finds common ground. You're the one who brings opposing sides together and creates harmony through understanding.",
      strengths: [
        "Excellent negotiation skills",
        "Ability to see multiple perspectives",
        "Natural conflict resolution abilities",
        "Strong emotional intelligence",
        "Talent for building relationships"
      ],
      challenges: [
        "Can be seen as indecisive",
        "May struggle with taking strong positions",
        "Tendency to avoid difficult conversations",
        "Difficulty with making tough decisions",
        "Can be perceived as manipulative"
      ],
      growthAreas: [
        "Write a 3-step frame and assign owners",
        "Practice taking clear positions when needed",
        "Develop skills in difficult conversations",
        "Learn to balance harmony with truth",
        "Cultivate courage in standing up for principles"
      ],
      relationships: {
        worksWellWith: ["Equalizer", "Provider", "Seeker"],
        conflictsWith: ["Rebel", "Catalyst", "Sovereign"]
      },
      careerPaths: [
        "Diplomacy",
        "Human Resources",
        "Mediation",
        "International Relations",
        "Community Organizing"
      ],
      dailyPractices: [
        "Ask 'What do both sides need?' before mediating",
        "Practice saying 'I understand your perspective' before disagreeing",
        "Look for win-win solutions in conflicts",
        "Listen to understand, not to respond",
        "Find common ground before addressing differences"
      ],
      quotes: [
        "The art of diplomacy is to say the nastiest thing in the nicest way.",
        "Diplomacy is the art of letting someone else have your way.",
        "The best way to destroy an enemy is to make him a friend."
      ]
    }
  },
  "partner": {
    id: "Bonding:Partner",
    name: "Partner",
    nickname: "Ally",
    family: "Bonding",
    description: "Seen as the steady presence who stays close and loyal through difficulty.",
    color: "Pink",
    content: {
      overview: "The Partner is the loyal ally who provides steady support and builds deep relationships. You're the one people can count on through thick and thin, always there when needed.",
      strengths: [
        "Exceptional loyalty and commitment",
        "Strong relationship-building skills",
        "Natural empathy and understanding",
        "Reliability and consistency",
        "Ability to provide emotional support"
      ],
      challenges: [
        "Can be overly dependent on others",
        "May struggle with setting boundaries",
        "Tendency to lose personal identity",
        "Difficulty with conflict",
        "Can be perceived as clingy or needy"
      ],
      growthAreas: [
        "Freeze scope; open a follow-on lane",
        "Learn to maintain your own identity",
        "Develop skills in healthy conflict",
        "Practice setting clear boundaries",
        "Cultivate independence while staying connected"
      ],
      relationships: {
        worksWellWith: ["Guardian", "Provider", "Diplomat"],
        conflictsWith: ["Rebel", "Catalyst", "Seeker"]
      },
      careerPaths: [
        "Counseling",
        "Social Work",
        "Team Building",
        "Relationship Coaching",
        "Community Development"
      ],
      dailyPractices: [
        "Ask 'What do I need?' before focusing on others",
        "Practice saying 'I need some time to think' before responding",
        "Set one clear boundary and stick to it",
        "Focus on your own goals for 30 minutes each day",
        "Learn to say 'no' without feeling guilty"
      ],
      quotes: [
        "The greatest thing in the world is to know how to belong to oneself.",
        "You can't pour from an empty cup.",
        "The most important relationship you'll ever have is with yourself."
      ]
    }
  },
  "provider": {
    id: "Bonding:Provider",
    name: "Provider",
    nickname: "Caretaker",
    family: "Bonding",
    description: "Trusted as the one who carries burdens and meets needs to keep others steady.",
    color: "Aqua",
    content: {
      overview: "The Provider is the caretaker who ensures everyone's needs are met and burdens are shared. You're the one who takes care of others and keeps the group functioning smoothly.",
      strengths: [
        "Natural nurturing and caregiving abilities",
        "Strong sense of responsibility for others",
        "Excellent organizational skills",
        "Ability to anticipate needs",
        "Commitment to service"
      ],
      challenges: [
        "Can be overly self-sacrificing",
        "May struggle with receiving help",
        "Tendency to take on too much",
        "Difficulty with setting boundaries",
        "Can be perceived as controlling"
      ],
      growthAreas: [
        "Freeze scope; open a follow-on lane",
        "Learn to receive help and support",
        "Develop skills in delegation",
        "Practice self-care and boundaries",
        "Cultivate balance between giving and receiving"
      ],
      relationships: {
        worksWellWith: ["Guardian", "Partner", "Navigator"],
        conflictsWith: ["Rebel", "Catalyst", "Spotlight"]
      },
      careerPaths: [
        "Healthcare",
        "Education",
        "Social Services",
        "Hospitality",
        "Non-profit Work"
      ],
      dailyPractices: [
        "Ask 'What do I need?' before focusing on others",
        "Practice saying 'I need help with this' when appropriate",
        "Delegate one task you normally do yourself",
        "Set aside 30 minutes each day for self-care",
        "Learn to accept help without feeling guilty"
      ],
      quotes: [
        "You cannot serve from an empty vessel.",
        "The best way to find yourself is to lose yourself in the service of others.",
        "Self-care is not selfish. You cannot serve from an empty vessel."
      ]
    }
  },
  "catalyst": {
    id: "Stress:Catalyst",
    name: "Catalyst",
    nickname: "Spark",
    family: "Stress",
    description: "Read as the initiator who ignites motion and starts the chain reaction under pressure.",
    color: "Orange",
    content: {
      overview: "The Catalyst is the spark that ignites action and creates momentum in challenging situations. You're the one who thrives under pressure and gets things moving when others are stuck.",
      strengths: [
        "Thrives under pressure",
        "Natural ability to create momentum",
        "Excellent crisis management skills",
        "High energy and drive",
        "Ability to inspire action in others"
      ],
      challenges: [
        "Can be seen as chaotic or disruptive",
        "May struggle with routine tasks",
        "Tendency to create unnecessary urgency",
        "Difficulty with long-term planning",
        "Can be perceived as overwhelming"
      ],
      growthAreas: [
        "Name the constraint and pick the next smallest ship",
        "Learn to work effectively in calm situations",
        "Develop skills in long-term planning",
        "Practice patience with slower processes",
        "Cultivate balance between urgency and calm"
      ],
      relationships: {
        worksWellWith: ["Rebel", "Visionary", "Spotlight"],
        conflictsWith: ["Guardian", "Provider", "Navigator"]
      },
      careerPaths: [
        "Emergency Services",
        "Crisis Management",
        "Sales",
        "Event Planning",
        "Startup Leadership"
      ],
      dailyPractices: [
        "Ask 'Is this really urgent?' before acting",
        "Practice saying 'Let me think about this' before responding",
        "Focus on one task at a time instead of multitasking",
        "Build in time for reflection and planning",
        "Learn to appreciate calm moments"
      ],
      quotes: [
        "In the middle of difficulty lies opportunity.",
        "The way to get started is to quit talking and begin doing.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts."
      ]
    }
  },
  "artisan": {
    id: "Stress:Artisan",
    name: "Artisan",
    nickname: "Craftsman",
    family: "Stress",
    description: "Installed as the maker who holds quality steady and delivers clean, lasting pieces even in strain.",
    color: "Sapphire",
    content: {
      overview: "The Artisan is the craftsman who maintains quality and precision even under pressure. You're the one who delivers excellent work consistently, no matter the circumstances.",
      strengths: [
        "Exceptional attention to detail",
        "Strong work ethic and commitment",
        "Ability to maintain quality under pressure",
        "Natural craftsmanship and skill",
        "Reliability and consistency"
      ],
      challenges: [
        "Can be overly perfectionist",
        "May struggle with time pressure",
        "Tendency to overwork",
        "Difficulty with delegation",
        "Can be perceived as inflexible"
      ],
      growthAreas: [
        "Name the constraint and pick the next smallest ship",
        "Learn to balance quality with efficiency",
        "Develop skills in time management",
        "Practice saying 'This is good enough' when appropriate",
        "Cultivate flexibility with changing requirements"
      ],
      relationships: {
        worksWellWith: ["Navigator", "Architect", "Provider"],
        conflictsWith: ["Catalyst", "Rebel", "Visionary"]
      },
      careerPaths: [
        "Craftsmanship",
        "Quality Assurance",
        "Manufacturing",
        "Design",
        "Technical Writing"
      ],
      dailyPractices: [
        "Set a time limit for each task to avoid over-perfecting",
        "Practice saying 'This meets the requirements' when appropriate",
        "Focus on progress over perfection",
        "Ask 'What's the minimum viable quality?' before starting",
        "Learn to appreciate 'good enough' work"
      ],
      quotes: [
        "Perfection is the enemy of progress.",
        "Done is better than perfect.",
        "The secret to getting ahead is getting started."
      ]
    }
  }
};

export const getArchetypeBySlug = (slug: string): ArchetypePageData | null => {
  return ARCHETYPE_PAGES[slug] || null;
};

export const getAllArchetypeSlugs = (): string[] => {
  return Object.keys(ARCHETYPE_PAGES);
};
