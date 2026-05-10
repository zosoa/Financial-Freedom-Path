/**
 * Score → Membership tier mapping.
 *
 * The Freedom Score (0–100) is mapped to one of 4 membership tiers.
 * Each tier carries an i18n key prefix (`scoreTier.<id>.*`) that the UI
 * uses to surface the tier name, tagline and 3 concrete perks.
 *
 * The point: turn a cold number into a value proposition.
 */

export type TierId = "elite" | "pioneers" | "builders" | "explorers";

export interface Tier {
  id: TierId;
  /** Threshold (inclusive) — e.g. score >= 75 → elite. */
  minScore: number;
  /** Tailwind/HSL accent classes used by callers. */
  accent: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
  };
}

export const TIERS: Tier[] = [
  {
    id: "elite",
    minScore: 75,
    accent: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    },
  },
  {
    id: "pioneers",
    minScore: 50,
    accent: {
      bg: "bg-mint/10",
      border: "border-mint/30",
      text: "text-mint",
      iconBg: "bg-gradient-to-br from-emerald-400 to-mint",
    },
  },
  {
    id: "builders",
    minScore: 30,
    accent: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      iconBg: "bg-gradient-to-br from-amber-400 to-primary",
    },
  },
  {
    id: "explorers",
    minScore: 0,
    accent: {
      bg: "bg-sky/10",
      border: "border-sky/30",
      text: "text-sky",
      iconBg: "bg-gradient-to-br from-sky-400 to-blue-500",
    },
  },
];

export function getTierForScore(score: number): Tier {
  return TIERS.find((t) => score >= t.minScore) ?? TIERS[TIERS.length - 1];
}
