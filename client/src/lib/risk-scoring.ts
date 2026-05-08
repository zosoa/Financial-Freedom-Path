/**
 * FinkSmart Risk DNA — scoring engine.
 *
 * 7 questions across 4 dimensions (capacity, tolerance, experience, emotion).
 * Each answer is worth 1–5 points. Total range: 7–35.
 * Score → climate (Glacier / Tempéré / Tropical / Volcan).
 * Each climate maps to an expected return + asset allocation + advice set
 * that gets fed back into the Phase 1 freedom-age projection.
 *
 * NOTE: only structure + scoring lives here. All user-facing copy
 * (questions, choices, advice) is in i18n under `riskDna.*`.
 */

export type Climate = "glacier" | "tempere" | "tropical" | "volcan";

export type Dimension = "capacity" | "tolerance" | "experience" | "emotion";

/** Stable identifier for each question. */
export type QuestionKey =
  | "incomeStability"   // Q1 (Capacity) — was: time horizon, removed (already in Phase 1)
  | "emergencyCushion"  // Q2 (Capacity)
  | "lossReaction"      // Q3 (Tolerance) — uses concrete amount
  | "pathPreference"    // Q4 (Tolerance) — uses age scenarios computed from Phase 1
  | "marketExperience"  // Q5 (Experience)
  | "literacyTest"      // Q6 (Experience)
  | "emotionalDriver";  // Q7 (Emotion)

export interface RiskChoice {
  id: string;        // stable id, used in URL state ("a"/"b"/.../"e")
  points: number;    // 1-5
}

export interface RiskQuestion {
  key: QuestionKey;
  dimension: Dimension;
  illustration:
    | "stability"
    | "cushion"
    | "loss"
    | "path"
    | "experience"
    | "literacy"
    | "emotion";
  /** Choice ids (in display order) and the points they award. */
  choices: RiskChoice[];
}

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    key: "incomeStability",
    dimension: "capacity",
    illustration: "stability",
    choices: [
      { id: "freelance", points: 1 },
      { id: "newSalary", points: 2 },
      { id: "stableSalary", points: 4 },
      { id: "diversified", points: 5 },
    ],
  },
  {
    key: "emergencyCushion",
    dimension: "capacity",
    illustration: "cushion",
    choices: [
      { id: "none", points: 1 },
      { id: "1to3", points: 2 },
      { id: "4to6", points: 3 },
      { id: "7to12", points: 4 },
      { id: "12plus", points: 5 },
    ],
  },
  {
    key: "lossReaction",
    dimension: "tolerance",
    illustration: "loss",
    choices: [
      { id: "sellAll", points: 1 },
      { id: "sellHalf", points: 2 },
      { id: "hold", points: 4 },
      { id: "buyMore", points: 5 },
    ],
  },
  {
    key: "pathPreference",
    dimension: "tolerance",
    illustration: "path",
    choices: [
      { id: "smooth", points: 1 },        // arrives later, no drops
      { id: "modest", points: 2 },        // small gain in time, max -10%
      { id: "growth", points: 4 },        // 2y earlier, max -25%
      { id: "aggressive", points: 5 },    // 6y earlier, max -45%
    ],
  },
  {
    key: "marketExperience",
    dimension: "experience",
    illustration: "experience",
    choices: [
      { id: "never", points: 1 },
      { id: "smallStakes", points: 3 },
      { id: "significant", points: 4 },
      { id: "veteran", points: 5 },
    ],
  },
  {
    key: "literacyTest",
    dimension: "experience",
    illustration: "literacy",
    choices: [
      { id: "true", points: 5 },   // correct
      { id: "false", points: 1 },
      { id: "dontKnow", points: 2 },
    ],
  },
  {
    key: "emotionalDriver",
    dimension: "emotion",
    illustration: "emotion",
    choices: [
      { id: "security", points: 1 },
      { id: "growth", points: 3 },
      { id: "freedom", points: 4 },
      { id: "bigWins", points: 5 },
    ],
  },
];

export interface ClimateProfile {
  /** Realistic long-run nominal return used to recompute Phase 1 freedom age. */
  expectedReturn: number;
  /** Worst historical drawdown the user should expect at least once. */
  worstDrawdown: number;
  /** Target asset allocation in %. */
  allocation: { bonds: number; equity: number; alternatives: number };
  /** Score range (inclusive). */
  scoreRange: [number, number];
}

export const CLIMATES: Record<Climate, ClimateProfile> = {
  glacier: {
    expectedReturn: 4.5,
    worstDrawdown: 8,
    allocation: { bonds: 75, equity: 20, alternatives: 5 },
    scoreRange: [7, 13],
  },
  tempere: {
    expectedReturn: 6.5,
    worstDrawdown: 15,
    allocation: { bonds: 50, equity: 45, alternatives: 5 },
    scoreRange: [14, 20],
  },
  tropical: {
    expectedReturn: 8.5,
    worstDrawdown: 25,
    allocation: { bonds: 25, equity: 70, alternatives: 5 },
    scoreRange: [21, 27],
  },
  volcan: {
    expectedReturn: 10,
    worstDrawdown: 40,
    allocation: { bonds: 10, equity: 80, alternatives: 10 },
    scoreRange: [28, 35],
  },
};

/** Sum points from a record of {questionKey: choiceId}. */
export function calculateScore(
  answers: Partial<Record<QuestionKey, string>>
): number {
  let total = 0;
  for (const q of RISK_QUESTIONS) {
    const chosen = answers[q.key];
    if (!chosen) continue;
    const choice = q.choices.find((c) => c.id === chosen);
    if (choice) total += choice.points;
  }
  return total;
}

/** Map a total score to its climate. */
export function scoreToClimate(score: number): Climate {
  if (score <= CLIMATES.glacier.scoreRange[1]) return "glacier";
  if (score <= CLIMATES.tempere.scoreRange[1]) return "tempere";
  if (score <= CLIMATES.tropical.scoreRange[1]) return "tropical";
  return "volcan";
}

/** Compute per-dimension subtotals (useful for nuanced advice). */
export function dimensionSubscores(
  answers: Partial<Record<QuestionKey, string>>
): Record<Dimension, number> {
  const subs: Record<Dimension, number> = {
    capacity: 0,
    tolerance: 0,
    experience: 0,
    emotion: 0,
  };
  for (const q of RISK_QUESTIONS) {
    const chosen = answers[q.key];
    if (!chosen) continue;
    const choice = q.choices.find((c) => c.id === chosen);
    if (choice) subs[q.dimension] += choice.points;
  }
  return subs;
}

/** Number of questions in the assessment. */
export const TOTAL_QUESTIONS = RISK_QUESTIONS.length;
