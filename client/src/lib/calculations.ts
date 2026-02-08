import { SUPPORTED_CURRENCIES } from "@shared/schema";

export interface CalculationInputs {
  age: number;
  monthlyIncome: number;
  desiredMonthlyIncome: number;
  currentSavings: number;
  monthlySavingsRate: number;
  expectedLumpSum: number;
  lumpSumAge: number;
  annualReturn: number;
  currency: string;
}

export interface CalculationResults {
  inflationAdjustedMonthlyIncome: number;
  annualTargetIncome: number;
  requiredCapital: number;
  plannedCapital: number;
  gapPercent: number;
  gapAmount: number;
  freedomAge: number;
  freedomScore: number;
  yearsToFreedom: number;
  narrative: {
    type: "critical" | "moderate" | "on_track" | "basically_there";
    headline: string;
    message: string;
  };
}

const INFLATION_RATE = 0.02;
const SAFE_WITHDRAWAL_RATE = 0.06;
const RETIREMENT_AGE = 65;

export function calculateFreedom(inputs: CalculationInputs): CalculationResults {
  const {
    age,
    desiredMonthlyIncome,
    currentSavings,
    monthlySavingsRate,
    expectedLumpSum,
    lumpSumAge,
    annualReturn,
  } = inputs;

  const yearsToRetirement = RETIREMENT_AGE - age;
  const monthlyReturn = annualReturn / 100 / 12;
  const annualReturnDecimal = annualReturn / 100;

  const inflationMultiplier = Math.pow(1 + INFLATION_RATE, yearsToRetirement);
  const inflationAdjustedMonthlyIncome = desiredMonthlyIncome * inflationMultiplier;
  const annualTargetIncome = inflationAdjustedMonthlyIncome * 12;
  const requiredCapital = annualTargetIncome / SAFE_WITHDRAWAL_RATE;

  const monthsToRetirement = yearsToRetirement * 12;
  let futureSavings = currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement);

  for (let m = 0; m < monthsToRetirement; m++) {
    futureSavings += monthlySavingsRate * Math.pow(1 + monthlyReturn, monthsToRetirement - m - 1);
  }

  if (expectedLumpSum > 0 && lumpSumAge > age) {
    const yearsUntilLump = lumpSumAge - age;
    const remainingYearsAfterLump = RETIREMENT_AGE - lumpSumAge;
    if (remainingYearsAfterLump > 0) {
      futureSavings += expectedLumpSum * Math.pow(1 + annualReturnDecimal, remainingYearsAfterLump);
    } else {
      futureSavings += expectedLumpSum;
    }
  }

  const plannedCapital = Math.max(0, futureSavings);
  const gapAmount = Math.max(0, requiredCapital - plannedCapital);
  const gapPercent = requiredCapital > 0 ? Math.max(0, Math.min(100, (gapAmount / requiredCapital) * 100)) : 0;

  const freedomAge = findFreedomAge(inputs);
  const yearsToFreedom = Math.max(0, freedomAge - age);
  const freedomScore = Math.round(Math.max(0, Math.min(100, 100 - gapPercent)));

  const narrative = getNarrative(gapPercent);

  return {
    inflationAdjustedMonthlyIncome,
    annualTargetIncome,
    requiredCapital,
    plannedCapital,
    gapPercent,
    gapAmount,
    freedomAge,
    freedomScore,
    yearsToFreedom,
    narrative,
  };
}

function findFreedomAge(inputs: CalculationInputs): number {
  const {
    age,
    desiredMonthlyIncome,
    currentSavings,
    monthlySavingsRate,
    expectedLumpSum,
    lumpSumAge,
    annualReturn,
  } = inputs;

  const monthlyReturn = annualReturn / 100 / 12;

  for (let targetAge = age + 1; targetAge <= 100; targetAge++) {
    const years = targetAge - age;
    const inflationMultiplier = Math.pow(1 + INFLATION_RATE, years);
    const inflatedMonthly = desiredMonthlyIncome * inflationMultiplier;
    const annualTarget = inflatedMonthly * 12;
    const requiredAtAge = annualTarget / SAFE_WITHDRAWAL_RATE;

    const months = years * 12;
    let accumulated = currentSavings * Math.pow(1 + monthlyReturn, months);
    for (let m = 0; m < months; m++) {
      accumulated += monthlySavingsRate * Math.pow(1 + monthlyReturn, months - m - 1);
    }

    if (expectedLumpSum > 0 && lumpSumAge > age && lumpSumAge <= targetAge) {
      const yearsAfterLump = targetAge - lumpSumAge;
      accumulated += expectedLumpSum * Math.pow(1 + annualReturn / 100, yearsAfterLump);
    }

    if (accumulated >= requiredAtAge) {
      return targetAge;
    }
  }

  return 100;
}

function getNarrative(gapPercent: number): CalculationResults["narrative"] {
  if (gapPercent > 80) {
    return {
      type: "critical",
      headline: "Your journey begins today",
      message:
        "It may look like a long road ahead, but you are not alone. Millions of people are in the same position. The most important step? The one you just took\u2014understanding where you stand. The second best time to plant a tree is today.",
    };
  } else if (gapPercent > 40) {
    return {
      type: "moderate",
      headline: "You're on your way",
      message:
        "You've already built a foundation. With some adjustments to your savings strategy, your freedom date could move closer than you think. Small changes compound into big results over time.",
    };
  } else if (gapPercent > 5) {
    return {
      type: "on_track",
      headline: "Looking strong",
      message:
        "You're well ahead of most people. Your discipline is paying off, and your future self is already smiling. A few fine-tuning moves could help you cross the finish line even sooner.",
    };
  } else {
    return {
      type: "basically_there",
      headline: "You're basically there!",
      message:
        "Fantastic news! Your financial future looks incredibly bright. Your future self will thank you for the choices you've made. Stay the course\u2014freedom is within reach.",
    };
  }
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
