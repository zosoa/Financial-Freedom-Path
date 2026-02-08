import { SUPPORTED_CURRENCIES } from "@shared/schema";

export interface CalculationInputs {
  age: number;
  monthlyIncome: number;
  desiredMonthlyIncome: number;
  currentSavings: number;
  monthlySavingsRate: number;
  targetFreedomAge: number;
  annualReturn: number;
  currency: string;
}

export interface WealthDataPoint {
  age: number;
  standardWealth: number;
  boostedWealth: number;
  requiredCapital: number;
}

export interface ReturnComparison {
  label: string;
  rate: number;
  capitalAtTarget: number;
  ageReached: number;
  timeDifference: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "locked";
  unlocked: boolean;
}

export interface CalculationResults {
  inflationAdjustedMonthlyIncome: number;
  annualTargetIncome: number;
  requiredCapital: number;
  plannedCapital: number;
  plannedCapitalStandard: number;
  plannedCapitalBoosted: number;
  additionalGain: number;
  gapPercent: number;
  gapAmount: number;
  freedomAge: number;
  freedomAgeStandard: number;
  freedomAgeBoosted: number;
  freedomScore: number;
  yearsToFreedom: number;
  timeDifference: number;
  narrative: {
    type: "critical" | "moderate" | "on_track" | "basically_there";
    headline: string;
    message: string;
    personality: string;
    subtitle: string;
  };
  wealthCurve: WealthDataPoint[];
  returnComparisons: ReturnComparison[];
  badges: Badge[];
}

const INFLATION_RATE = 0.02;
const SAFE_WITHDRAWAL_RATE = 0.06;
const STANDARD_RETURN = 6;
const BOOSTED_RETURN = 11;

function computeCapitalAtAge(
  currentAge: number,
  targetAge: number,
  currentSavings: number,
  monthlySavingsRate: number,
  annualReturnPct: number
): number {
  const years = targetAge - currentAge;
  if (years <= 0) return currentSavings;
  const monthlyReturn = annualReturnPct / 100 / 12;
  const months = years * 12;

  let accumulated = currentSavings * Math.pow(1 + monthlyReturn, months);
  for (let m = 0; m < months; m++) {
    accumulated += monthlySavingsRate * Math.pow(1 + monthlyReturn, months - m - 1);
  }
  return Math.max(0, accumulated);
}

function computeRequiredCapitalAtAge(
  currentAge: number,
  targetAge: number,
  desiredMonthlyIncome: number
): number {
  const years = targetAge - currentAge;
  const inflationMultiplier = Math.pow(1 + INFLATION_RATE, years);
  const inflatedMonthly = desiredMonthlyIncome * inflationMultiplier;
  const annualTarget = inflatedMonthly * 12;
  return annualTarget / SAFE_WITHDRAWAL_RATE;
}

function findFreedomAge(
  currentAge: number,
  desiredMonthlyIncome: number,
  currentSavings: number,
  monthlySavingsRate: number,
  annualReturnPct: number
): number {
  for (let targetAge = currentAge + 1; targetAge <= 100; targetAge++) {
    const accumulated = computeCapitalAtAge(currentAge, targetAge, currentSavings, monthlySavingsRate, annualReturnPct);
    const required = computeRequiredCapitalAtAge(currentAge, targetAge, desiredMonthlyIncome);
    if (accumulated >= required) {
      return targetAge;
    }
  }
  return 100;
}

function generateWealthCurve(
  currentAge: number,
  currentSavings: number,
  monthlySavingsRate: number,
  desiredMonthlyIncome: number,
  maxAge: number
): WealthDataPoint[] {
  const points: WealthDataPoint[] = [];
  const endAge = Math.min(maxAge + 10, 100);

  for (let age = currentAge; age <= endAge; age++) {
    const standardWealth = computeCapitalAtAge(currentAge, age, currentSavings, monthlySavingsRate, STANDARD_RETURN);
    const boostedWealth = computeCapitalAtAge(currentAge, age, currentSavings, monthlySavingsRate, BOOSTED_RETURN);
    const requiredCapital = computeRequiredCapitalAtAge(currentAge, age, desiredMonthlyIncome);

    points.push({
      age,
      standardWealth: Math.round(standardWealth),
      boostedWealth: Math.round(boostedWealth),
      requiredCapital: Math.round(requiredCapital),
    });
  }
  return points;
}

function computeBadges(inputs: CalculationInputs, results: Partial<CalculationResults>): Badge[] {
  const { age, monthlySavingsRate, monthlyIncome, currentSavings, desiredMonthlyIncome, targetFreedomAge } = inputs;
  const savingsRatio = monthlyIncome > 0 ? monthlySavingsRate / monthlyIncome : 0;
  const gapPercent = results.gapPercent || 100;
  const freedomAge = results.freedomAge || 100;
  const timeDiff = results.timeDifference || 0;

  const badges: Badge[] = [
    {
      id: "objective_reached",
      name: "Objective Reached",
      description: "Your plan lets you reach your financial independence goal!",
      tier: gapPercent <= 0 ? "platinum" : "locked",
      unlocked: gapPercent <= 0,
    },
    {
      id: "smart_investor",
      name: "Smart Investor",
      description: "You're projected to grow your capital beyond the standard rate.",
      tier: results.plannedCapitalBoosted && results.plannedCapitalStandard && results.plannedCapitalBoosted > results.plannedCapitalStandard * 1.3 ? "gold" : "locked",
      unlocked: !!(results.plannedCapitalBoosted && results.plannedCapitalStandard && results.plannedCapitalBoosted > results.plannedCapitalStandard * 1.3),
    },
    {
      id: "time_optimizer",
      name: "Time Optimizer",
      description: "You could reach freedom earlier than your target age!",
      tier: freedomAge < targetFreedomAge ? "gold" : freedomAge <= targetFreedomAge + 2 ? "silver" : "locked",
      unlocked: freedomAge <= targetFreedomAge + 2,
    },
    {
      id: "savings_champion",
      name: "Savings Champion",
      description: "You're saving more than 20% of your income. Outstanding discipline!",
      tier: savingsRatio >= 0.4 ? "platinum" : savingsRatio >= 0.3 ? "gold" : savingsRatio >= 0.2 ? "silver" : savingsRatio >= 0.1 ? "bronze" : "locked",
      unlocked: savingsRatio >= 0.1,
    },
    {
      id: "progressive_saver",
      name: "Progressive Saver",
      description: "You've already started building your nest egg. Great job!",
      tier: currentSavings > desiredMonthlyIncome * 24 ? "gold" : currentSavings > desiredMonthlyIncome * 12 ? "silver" : currentSavings > 0 ? "bronze" : "locked",
      unlocked: currentSavings > 0,
    },
    {
      id: "early_start",
      name: "Early Start",
      description: "Starting young gives compound interest time to work its magic!",
      tier: age < 30 ? "gold" : age < 40 ? "silver" : age < 50 ? "bronze" : "locked",
      unlocked: age < 50,
    },
    {
      id: "ambitious_growth",
      name: "Ambitious Growth",
      description: "Your target lifestyle shows healthy ambition balanced with realism.",
      tier: desiredMonthlyIncome <= monthlyIncome * 0.6 ? "gold" : desiredMonthlyIncome <= monthlyIncome * 0.8 ? "silver" : desiredMonthlyIncome <= monthlyIncome ? "bronze" : "locked",
      unlocked: desiredMonthlyIncome <= monthlyIncome,
    },
    {
      id: "inflation_aware",
      name: "Inflation Aware",
      description: "You understand that today's money won't buy the same tomorrow.",
      tier: "silver",
      unlocked: true,
    },
    {
      id: "sharing_experience",
      name: "Sharing Experience",
      description: "Share your score with friends to unlock this badge!",
      tier: "locked",
      unlocked: false,
    },
    {
      id: "diversification_master",
      name: "Diversification Master",
      description: "Explore boosted returns to unlock this badge.",
      tier: "locked",
      unlocked: false,
    },
  ];

  return badges;
}

function getNarrative(gapPercent: number, freedomAge: number, targetAge: number, yearsToFreedom: number): CalculationResults["narrative"] {
  const diff = freedomAge - targetAge;

  if (gapPercent <= 0 || diff <= 0) {
    return {
      type: "basically_there",
      headline: "You're a Financial Astronaut!",
      message: `Incredible! You're on track to reach financial freedom by age ${freedomAge} -- that's at or before your target of ${targetAge}. Your discipline and planning have paid off brilliantly. You're not just on the path, you're practically at the summit. Keep this trajectory and freedom is yours.`,
      personality: "Astronaut",
      subtitle: "Your rocket is fueled and ready for liftoff",
    };
  } else if (gapPercent <= 20) {
    return {
      type: "on_track",
      headline: "You're a Trail Blazer!",
      message: `You're incredibly close! At your current pace, you'll reach freedom by age ${freedomAge}, just ${diff} year${diff === 1 ? "" : "s"} after your target of ${targetAge}. A small boost to your savings or returns could close the gap entirely. You're cutting through the jungle like a pro.`,
      personality: "Trail Blazer",
      subtitle: "Cutting through the jungle with style",
    };
  } else if (gapPercent <= 50) {
    return {
      type: "moderate",
      headline: "You're a Base Camp Builder!",
      message: `Solid foundation! You'll reach freedom by age ${freedomAge}, about ${diff} years after your target of ${targetAge}. The tent is pitched and the ladder is being built. With some strategic adjustments to your savings rate, you could shave years off your timeline. Small changes compound into big results.`,
      personality: "Base Camp Builder",
      subtitle: "The tent is pitched, now build the ladder",
    };
  } else {
    return {
      type: "critical",
      headline: "You're a First Steps Explorer!",
      message: `Every great summit starts with a single step -- and you just took yours! Your projected freedom age is ${freedomAge}, but here's the thing: understanding where you stand is the most powerful move you can make. With the right strategy, you can dramatically change your trajectory. Let's explore how.`,
      personality: "First Steps Explorer",
      subtitle: "Every summit starts with a single step",
    };
  }
}

export function calculateFreedom(inputs: CalculationInputs): CalculationResults {
  const {
    age,
    desiredMonthlyIncome,
    currentSavings,
    monthlySavingsRate,
    targetFreedomAge,
    annualReturn,
  } = inputs;

  const yearsToTarget = targetFreedomAge - age;
  const inflationMultiplier = Math.pow(1 + INFLATION_RATE, yearsToTarget);
  const inflationAdjustedMonthlyIncome = desiredMonthlyIncome * inflationMultiplier;
  const annualTargetIncome = inflationAdjustedMonthlyIncome * 12;
  const requiredCapital = annualTargetIncome / SAFE_WITHDRAWAL_RATE;

  const plannedCapital = computeCapitalAtAge(age, targetFreedomAge, currentSavings, monthlySavingsRate, annualReturn);
  const plannedCapitalStandard = computeCapitalAtAge(age, targetFreedomAge, currentSavings, monthlySavingsRate, STANDARD_RETURN);
  const plannedCapitalBoosted = computeCapitalAtAge(age, targetFreedomAge, currentSavings, monthlySavingsRate, BOOSTED_RETURN);
  const additionalGain = plannedCapitalBoosted - plannedCapitalStandard;

  const gapAmount = Math.max(0, requiredCapital - plannedCapital);
  const gapPercent = requiredCapital > 0 ? Math.max(0, Math.min(100, (gapAmount / requiredCapital) * 100)) : 0;

  const freedomAge = findFreedomAge(age, desiredMonthlyIncome, currentSavings, monthlySavingsRate, annualReturn);
  const freedomAgeStandard = findFreedomAge(age, desiredMonthlyIncome, currentSavings, monthlySavingsRate, STANDARD_RETURN);
  const freedomAgeBoosted = findFreedomAge(age, desiredMonthlyIncome, currentSavings, monthlySavingsRate, BOOSTED_RETURN);

  const yearsToFreedom = Math.max(0, freedomAge - age);
  const timeDifference = freedomAge - targetFreedomAge;
  const freedomScore = Math.round(Math.max(0, Math.min(100, 100 - gapPercent)));

  const partialResults = {
    gapPercent,
    freedomAge,
    timeDifference,
    plannedCapitalStandard,
    plannedCapitalBoosted,
  };

  const narrative = getNarrative(gapPercent, freedomAge, targetFreedomAge, yearsToFreedom);
  const wealthCurve = generateWealthCurve(age, currentSavings, monthlySavingsRate, desiredMonthlyIncome, targetFreedomAge);
  const badges = computeBadges(inputs, partialResults);

  const returnComparisons: ReturnComparison[] = [
    {
      label: "Standard (6%)",
      rate: STANDARD_RETURN,
      capitalAtTarget: Math.round(plannedCapitalStandard),
      ageReached: freedomAgeStandard,
      timeDifference: freedomAgeStandard - targetFreedomAge,
    },
    {
      label: "Boosted (11%)",
      rate: BOOSTED_RETURN,
      capitalAtTarget: Math.round(plannedCapitalBoosted),
      ageReached: freedomAgeBoosted,
      timeDifference: freedomAgeBoosted - targetFreedomAge,
    },
  ];

  return {
    inflationAdjustedMonthlyIncome,
    annualTargetIncome,
    requiredCapital,
    plannedCapital,
    plannedCapitalStandard,
    plannedCapitalBoosted,
    additionalGain,
    gapPercent,
    gapAmount,
    freedomAge,
    freedomAgeStandard,
    freedomAgeBoosted,
    freedomScore,
    yearsToFreedom,
    timeDifference,
    narrative,
    wealthCurve,
    returnComparisons,
    badges,
  };
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const curr = SUPPORTED_CURRENCIES[currencyCode];
  if (!curr) return `${amount.toLocaleString()}`;

  const absAmount = Math.abs(amount);
  let formatted: string;

  if (absAmount >= 1_000_000) {
    formatted = `${curr.symbol}${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    formatted = `${curr.symbol}${(absAmount / 1_000).toFixed(0)}K`;
  } else {
    formatted = `${curr.symbol}${absAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatCurrencyFull(amount: number, currencyCode: string): string {
  const curr = SUPPORTED_CURRENCIES[currencyCode];
  if (!curr) return `${amount.toLocaleString()}`;
  return `${curr.symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
