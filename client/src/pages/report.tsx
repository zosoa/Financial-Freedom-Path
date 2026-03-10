import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

const NARRATIVE_KEY_MAP: Record<string, string> = {
  basically_there: "astronaut",
  on_track: "trailBlazer",
  moderate: "baseCamp",
  critical: "firstSteps",
};

export default function Report() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const { data: calc, isLoading, error } = useQuery<Calculation>({
    queryKey: ["/api/calculations", params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">{t("report.title")}...</p>
        </div>
      </div>
    );
  }

  if (error || !calc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">{t("report.title")}</h2>
          <p className="text-muted-foreground text-sm mb-4">
            {t("report.disclaimer")}
          </p>
          <a href="/" className="text-primary underline text-sm" data-testid="link-back-home">
            {t("report.tryIt")}
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
  const narrativeKey = NARRATIVE_KEY_MAP[narrativeType] || "firstSteps";
  const personality = t(`narratives.${narrativeKey}.title`);
  const personalityDesc = t(`narratives.${narrativeKey}.description`);
  const scoreColorClass = getScoreColor(calc.freedomScore);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <img src={finksmartLogo} alt="FinkSmart - Pro-Investing Decoded" className="h-9 w-auto" />
          </div>
          <span className="text-xs text-muted-foreground">{t("report.title")}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-6 text-center" data-testid="report-score-card">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">{t("report.freedomScore")}</p>
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${scoreColorClass} border-current/20 mb-3`}>
            <span className={`text-4xl font-extrabold ${scoreColorClass}`} data-testid="text-freedom-score">{calc.freedomScore}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("report.outOf100")}</p>
          <p className="text-lg font-bold mt-2" data-testid="text-personality">{personality}</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">{personalityDesc}</p>
        </Card>

        <Card className={`p-6 text-center ${isOnTrack ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-orange-50/50 dark:bg-orange-900/10"}`} data-testid="report-age-comparison">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-semibold">{t("report.timeline")}</p>
          <div className="flex items-center justify-center gap-6 md:gap-12">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("report.targetFreedomAge")}</p>
              <p className="text-5xl font-extrabold" data-testid="text-target-age">{calc.targetFreedomAge}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("calculator.yearsOld")}</p>
            </div>
            <div className={`text-2xl font-bold ${isOnTrack ? "text-emerald-500" : "text-orange-500"}`}>vs</div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("report.projectedCapital")} (6%)</p>
              <p className={`text-5xl font-extrabold ${isOnTrack ? "text-emerald-500" : "text-orange-500"}`} data-testid="text-freedom-age">{calc.freedomAge}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("calculator.yearsOld")}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40">
            {isOnTrack ? (
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                {yearsDiff < 0 
                  ? t("report.yearsEarly", { count: Math.abs(yearsDiff) })
                  : `${t("report.onTrack")} !`}
              </p>
            ) : (
              <p className="text-orange-600 dark:text-orange-400 font-bold">
                {t("report.yearsGap", { count: yearsDiff })}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6" data-testid="report-key-numbers">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-semibold text-center">{t("report.title")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-b border-border/40 pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.yourAge")}</p>
              <p className="text-lg font-bold">{calc.age}</p>
            </div>
            <div className="border-b border-border/40 pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.targetFreedomAge")}</p>
              <p className="text-lg font-bold">{calc.targetFreedomAge}</p>
            </div>
            <div className="border-b border-border/40 pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.desiredMonthlyIncome")}</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.desiredMonthlyIncome, currency)}</p>
            </div>
            <div className="border-b border-border/40 pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.monthlyNetIncome")}</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.monthlyIncome, currency)}</p>
            </div>
            <div className="border-b border-border/40 pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.currentSavings")}</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.currentSavings, currency)}</p>
            </div>
            <div className="border-b border-border/40 pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.monthlySavingsRate")}</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.monthlySavingsRate, currency)}</p>
            </div>
            <div className="pb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.requiredCapital")}</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.requiredCapital, currency)}</p>
            </div>
            <div className="pb-3 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.projectedCapital")} (6%)</p>
              <p className="text-lg font-bold">{formatCurrencyFull(calc.plannedCapital, currency)}</p>
            </div>
            {gapCapital > 0 && (
              <div className="col-span-2 bg-orange-50 dark:bg-orange-900/10 rounded-md p-3 border border-orange-200/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("report.gap")}</p>
                <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                  {formatCurrencyFull(gapCapital, currency)}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="text-center space-y-3 py-4">
          <a
            href="/"
            className="premium-cta premium-cta-lg inline-flex items-center gap-2 px-8 py-4 text-white font-bold"
            data-testid="button-retake-from-report"
          >
            {t("report.generateYours")}
          </a>
          <p className="text-xs text-muted-foreground">
            {t("report.poweredBy")}
          </p>
          <p className="text-[10px] text-muted-foreground max-w-md mx-auto">
            {t("report.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
