import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { calculateFreedom } from "@/lib/calculations";
import type { CalculationInputs } from "@/lib/calculations";
import { SUPPORTED_CURRENCIES } from "@shared/schema";
import type { Calculation } from "@shared/schema";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function formatNumber(num: number): string {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatCurrencyFull(value: number, currency: string): string {
  const sym = SUPPORTED_CURRENCIES[currency]?.symbol || currency;
  return `${sym}${formatNumber(value)}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getPersonalityLabel(type: string): string {
  const map: Record<string, string> = {
    basically_there: "Astronaut",
    on_track: "Trail Blazer",
    moderate: "Base Camp Builder",
    critical: "First Steps Explorer",
  };
  return map[type] || "Explorer";
}

function getPersonalityDescription(type: string): string {
  const map: Record<string, string> = {
    basically_there: "Your financial trajectory puts freedom within reach right on schedule. Your discipline and planning have paid off brilliantly.",
    on_track: "You're cutting through financial complexity with confidence. A few smart optimizations could launch you even faster toward freedom.",
    moderate: "You're building something real. Your foundation is solid, and with strategic tweaks you can shave years off your timeline.",
    critical: "You've taken the most important step -- knowing where you stand. With the right moves, you can dramatically reshape your trajectory.",
  };
  return map[type] || "";
}

export default function Report() {
  const params = useParams<{ id: string }>();

  const { data: calc, isLoading, error } = useQuery<Calculation>({
    queryKey: ["/api/calculations", params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading your Freedom Report...</p>
        </div>
      </div>
    );
  }

  if (error || !calc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground text-sm mb-4">
            This report may have been removed or the link is invalid.
          </p>
          <a href="/" className="text-primary underline text-sm" data-testid="link-back-home">
            Take the Freedom Check
          </a>
        </Card>
      </div>
    );
  }

  const inputs: CalculationInputs = {
    age: calc.age,
    monthlyIncome: calc.monthlyIncome,
    desiredMonthlyIncome: calc.desiredMonthlyIncome,
    currentSavings: calc.currentSavings,
    monthlySavingsRate: calc.monthlySavingsRate,
    targetFreedomAge: calc.targetFreedomAge,
    annualReturn: 6,
    currency: calc.currency,
  };
  const results = calculateFreedom(inputs);
  const currency = calc.currency;
  const yearsDiff = calc.freedomAge - calc.targetFreedomAge;
  const isOnTrack = yearsDiff <= 0;
  const gapCapital = Math.max(0, calc.requiredCapital - calc.plannedCapital);
  const narrativeType = results.narrative.type;
  const personality = getPersonalityLabel(narrativeType);
  const personalityDesc = getPersonalityDescription(narrativeType);
  const scoreColorClass = getScoreColor(calc.freedomScore);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <img src={finksmartLogo} alt="FinkSmart - Pro-Investing Decoded" className="h-9 w-auto" />
          </div>
          <span className="text-xs text-muted-foreground">Freedom Report</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Freedom Score */}
        <Card className="p-6 text-center" data-testid="report-score-card">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Your Freedom Score</p>
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${scoreColorClass} border-current/20 mb-3`}>
            <span className={`text-4xl font-extrabold ${scoreColorClass}`} data-testid="text-freedom-score">{calc.freedomScore}</span>
          </div>
          <p className="text-xs text-muted-foreground">out of 100</p>
          <p className="text-lg font-bold mt-2" data-testid="text-personality">{personality}</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">{personalityDesc}</p>
        </Card>

        {/* Freedom Age vs Target Age */}
        <Card className={`p-6 text-center ${isOnTrack ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-orange-50/50 dark:bg-orange-900/10"}`} data-testid="report-age-comparison">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-semibold">Financial Freedom Timeline</p>
          <div className="flex items-center justify-center gap-6 md:gap-12">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Target</p>
              <p className="text-5xl font-extrabold" data-testid="text-target-age">{calc.targetFreedomAge}</p>
              <p className="text-xs text-muted-foreground mt-1">years old</p>
            </div>
            <div className={`text-2xl font-bold ${isOnTrack ? "text-emerald-500" : "text-orange-500"}`}>vs</div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Projected (6%)</p>
              <p className={`text-5xl font-extrabold ${isOnTrack ? "text-emerald-500" : "text-orange-500"}`} data-testid="text-freedom-age">{calc.freedomAge}</p>
              <p className="text-xs text-muted-foreground mt-1">years old</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40">
            {isOnTrack ? (
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                On track{yearsDiff < 0 ? ` -- ${Math.abs(yearsDiff)} year${Math.abs(yearsDiff) !== 1 ? "s" : ""} early!` : "!"}
              </p>
            ) : (
              <p className="text-orange-600 dark:text-orange-400 font-bold">
                {yearsDiff} year{yearsDiff !== 1 ? "s" : ""} gap to close
              </p>
            )}
          </div>
        </Card>

        {/* Key Numbers */}
        <Card className="p-6" data-testid="report-key-numbers">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-semibold text-center">Your Full Report</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-b border-border/40 pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Your Age</p>
              <p className="text-lg font-bold">{calc.age}</p>
            </div>
            <div className="border-b border-border/40 pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target Freedom Age</p>
              <p className="text-lg font-bold">{calc.targetFreedomAge}</p>
            </div>
            <div className="border-b border-border/40 pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Desired Monthly Income</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.desiredMonthlyIncome, currency)}</p>
            </div>
            <div className="border-b border-border/40 pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Net Income</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.monthlyIncome, currency)}</p>
            </div>
            <div className="border-b border-border/40 pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Savings</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.currentSavings, currency)}</p>
            </div>
            <div className="border-b border-border/40 pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Savings</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.monthlySavingsRate, currency)}</p>
            </div>
            <div className="pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Required Capital</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.requiredCapital, currency)}</p>
            </div>
            <div className="pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected Capital (6%)</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.plannedCapital, currency)}</p>
            </div>
            {gapCapital > 0 && (
              <div className="col-span-2 bg-orange-50 dark:bg-orange-900/10 rounded-md p-3 border border-orange-200/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capital Gap</p>
                <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                  {formatCurrencyFull(gapCapital, currency)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">needed to close the gap</span>
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-3 py-4">
          <a
            href="/"
            className="premium-cta premium-cta-lg inline-flex items-center gap-2 px-8 py-4 text-white font-bold"
            data-testid="button-retake-from-report"
          >
            Take the Freedom Check Yourself
          </a>
          <p className="text-xs text-muted-foreground">
            FinkSmart: Pro-Investing Decoded &middot; Sponsored by BLACKWAVE CAPITAL
          </p>
          <p className="text-[10px] text-muted-foreground max-w-md mx-auto">
            This report is for educational purposes only. All projections are hypothetical.
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}
