/**
 * Score-context helper.
 *
 * The Freedom Score (0–100) and the projected freedom age are objectively
 * accurate but emotionally cold. This module turns them into something
 * users can grasp immediately — a comparison against the **legal retirement
 * age** of their country and a peer-percentile tier.
 *
 * Returns plain data; copy is built via i18n keys (`scoreContext.*`).
 */

/** Legal retirement age (or de-facto effective retirement) per country.
 *  Anchored on real public statistics, kept conservative. Default 65. */
const RETIREMENT_AGE_BY_COUNTRY: Record<string, number> = {
  // Africa
  Mauritius: 60,
  Madagascar: 60,
  "South Africa": 60,
  Morocco: 63,
  Tunisia: 62,
  Egypt: 60,
  Kenya: 60,
  Nigeria: 60,
  Senegal: 60,
  "Côte d'Ivoire": 60,
  // Europe
  France: 64,
  Belgium: 65,
  Switzerland: 65,
  Luxembourg: 65,
  Spain: 67,
  Portugal: 66,
  Italy: 67,
  Germany: 67,
  Netherlands: 67,
  Austria: 65,
  "United Kingdom": 66,
  Ireland: 66,
  Sweden: 65,
  Denmark: 67,
  Norway: 67,
  Finland: 65,
  Greece: 67,
  Poland: 65,
  Romania: 65,
  // Americas
  "United States": 67,
  Canada: 65,
  Mexico: 65,
  Brazil: 65,
  Argentina: 65,
  Chile: 65,
  Colombia: 62,
  Peru: 65,
  // Asia / Oceania
  India: 60,
  China: 60,
  Japan: 65,
  "South Korea": 62,
  Singapore: 63,
  Malaysia: 60,
  Thailand: 60,
  Indonesia: 58,
  Vietnam: 62,
  Philippines: 60,
  Australia: 67,
  "New Zealand": 65,
  // Middle East
  "United Arab Emirates": 60,
  "Saudi Arabia": 60,
  Israel: 67,
  Turkey: 65,
  // Other
  Russia: 65,
};

export const DEFAULT_RETIREMENT_AGE = 65;

export function getRetirementAge(country: string): number {
  return RETIREMENT_AGE_BY_COUNTRY[country] ?? DEFAULT_RETIREMENT_AGE;
}

/** Percentile tier label (used for "Top X%" framing). */
export type PeerTier = "elite" | "ahead" | "average" | "lagging";

export interface ScoreContext {
  /** Legal retirement age in user's country. */
  retirementAge: number;
  /** Years before legal retirement (positive = ahead, negative = after). */
  yearsBeforeRetirement: number;
  /** Peer comparison tier. */
  tier: PeerTier;
  /** Approximate percentile (e.g. 8 = top 8%). */
  approxPercentile: number;
  /** i18n key suffix to use (e.g. "scoreContext.tier.elite"). */
  tierKey: string;
}

/**
 * Translate (freedomScore, freedomAge, country) into a comparable context.
 *
 * Tiers — derived from freedomScore distribution intuitions, anchored to
 * the legal retirement age:
 *   - elite (top ~10%):    score ≥ 75
 *   - ahead (top ~30%):    score 50–74
 *   - average:             score 30–49
 *   - lagging:             score < 30
 */
export function getScoreContext(
  freedomScore: number,
  freedomAge: number,
  country: string
): ScoreContext {
  const retirementAge = getRetirementAge(country);
  const yearsBeforeRetirement = retirementAge - freedomAge;

  let tier: PeerTier;
  let approxPercentile: number;
  if (freedomScore >= 75) {
    tier = "elite";
    approxPercentile = Math.max(3, 12 - Math.floor((freedomScore - 75) / 3));
  } else if (freedomScore >= 50) {
    tier = "ahead";
    approxPercentile = Math.max(15, 35 - Math.floor((freedomScore - 50) / 2));
  } else if (freedomScore >= 30) {
    tier = "average";
    approxPercentile = Math.max(40, 60 - Math.floor((freedomScore - 30) / 2));
  } else {
    tier = "lagging";
    approxPercentile = Math.max(65, 85 - Math.floor(freedomScore));
  }

  return {
    retirementAge,
    yearsBeforeRetirement,
    tier,
    approxPercentile,
    tierKey: `scoreContext.tier.${tier}`,
  };
}
