import type { Placement } from "@/lib/terms/term-layout";
import type { Term } from "@/lib/terms/types";

export const FULL_TERM: Term = {
  id: "blocker",
  term: "Blocker",
  category: "Meetings",
  definition: "Something that stops you from making progress until it is cleared.",
  mentalModel: "A closed gate on a path. You can’t go around it; someone has to open it.",
  example: "“I’m blocked on the API keys. Can someone from infra look today?”",
  antiExample: "A task you simply haven’t started yet. Nothing is stopping you.",
  discussion: "Say it early in standup. The point is to get help, not to explain why you’re late.",
  controversy:
    "Some teams avoid the word because it can sound like blame. They say “needs help” instead.",
  note: "Often shortened to “blocked on X”.",
  relationships: [
    {
      id: "r1",
      relationshipType: "relates_to",
      description: "Standups are where most blockers get raised.",
      direction: "outgoing",
      relatedTermId: "standup",
      relatedTermName: "Standup",
    },
    {
      id: "r2",
      relationshipType: "opposite_of",
      description: "The state once the blocker is cleared.",
      direction: "outgoing",
      relatedTermId: "unblocked",
      relatedTermName: "Unblocked",
    },
  ],
};

export const DEFINITION_ONLY_TERM: Term = {
  id: "retro",
  term: "Retro",
  category: null,
  definition: "A meeting where the team looks back on how the last sprint went.",
  example: "",
  discussion: "",
  relationships: [],
};

export const LONG_TERM: Term = {
  ...FULL_TERM,
  id: "crdt",
  term: "Conflict-free replicated data type (CRDT)",
  category: "Consistency and replication across regions",
  definition:
    "A data structure that many machines can change at the same time, without talking to each other first, and that always ends up in the same state once every machine has seen every change, no matter in what order the changes arrived.",
};

export const JAPANESE_TERM: Term = {
  id: "yoroshiku",
  term: "よろしくお願いします",
  category: "あいさつ",
  definition: "please treat me well; a polite phrase used when meeting someone or asking a favour",
  example: "「初めまして、田中です。よろしくお願いします。」",
  discussion: "メールの最後にもよく使います。",
  relationships: [],
};

export const DUTCH_TERM: Term = {
  id: "gezellig",
  term: "gezellig",
  category: "Gevoel",
  definition: "cosy, pleasant and sociable; the warm feeling of a good time with people",
  example: "“Het was echt gezellig gisteravond.”",
  antiExample: "A tidy, quiet room on its own isn’t gezellig. It needs people or warmth.",
  note: "There’s no exact English word for it.",
  discussion: "",
  relationships: [],
};

export const MORE_PLACEMENT: Placement = {
  mentalModel: "shown",
  example: "shown",
  antiExample: "more",
  discussion: "more",
  controversy: "more",
  note: "more",
  relationships: "shown",
  searchLink: "shown",
};

export const COLLECTIONS = [
  {
    name: "Standup",
    letter: "S",
    tone: "read",
    mastered: 119,
    learning: 43,
    notStarted: 24,
  },
  {
    name: "Dutch basics",
    letter: "D",
    tone: "review",
    mastered: 130,
    learning: 52,
    notStarted: 238,
  },
  {
    name: "Distributed Systems Fundamentals for Engineering Interviews",
    letter: "D",
    tone: "quiz",
    mastered: 175,
    learning: 12,
    notStarted: 2293,
  },
] as const;
