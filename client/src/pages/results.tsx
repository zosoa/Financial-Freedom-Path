import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  ArrowDown,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  Rocket,
  TreePine,
  Footprints,
  Info,
  Lightbulb,
  Zap,
  Coins,
  Lock,
  ChevronRight,
  DollarSign,
  Clock,
  ArrowUpRight,
  Download,
  Mail,
  Loader2,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  IconTarget,
  IconGrowth,
  IconBars,
  IconCompound,
  IconDNA,
  IconShield,
  IconCompass,
  IconLightbulb,
} from "@/components/icons";
import MountainAscent from "@/components/illustrations/MountainAscent";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "@/lib/theme-provider";
import {
  calculateFreedom,
  formatCurrency,
  formatCurrencyFull,
  type CalculationInputs,
} from "@/lib/calculations";
import { SUPPORTED_CURRENCIES } from "@shared/schema";
import { LeadCaptureModal } from "@/components/lead-capture-modal";
import { FreedomScoreCard } from "@/components/freedom-score-card";
import { apiRequest } from "@/lib/queryClient";
import { SiWhatsapp, SiFacebook, SiLinkedin, SiX } from "react-icons/si";

function InfoTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-help inline-flex ml-1 touch-manipulation"
          data-testid="button-info-tooltip"
          aria-label="More information"
        >
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-xs text-xs leading-relaxed p-3">
        {children}
      </PopoverContent>
    </Popover>
  );
}

/* Friendly Atlas chart palette */
const CHART_AMBER = "#F59E0B";
const CHART_MINT = "#10B981";
const CHART_SKY = "#0EA5E9";
const CHART_CORAL = "#FB923C";
const CHART_VIOLET = "#7C3AED";
const PIE_COLORS = [CHART_SKY, CHART_VIOLET];

export default function Results() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const country = params.get("country") || "Mauritius";
  const currency = params.get("currency") || "MUR";
  const referralSource = params.get("ref") || "";

  const [annualReturn, setAnnualReturn] = useState(parseFloat(params.get("annualReturn") || "7"));
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [activeSolution, setActiveSolution] = useState<"savings" | "lumpsum" | "efficiency">("savings");
  const sessionId = useMemo(() => {
    const existing = sessionStorage.getItem("fp_session_id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem("fp_session_id", id);
    return id;
  }, []);
  const [showSaveReport, setShowSaveReport] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const baseInputs: CalculationInputs = {
    age: parseInt(params.get("age") || "30"),
    monthlyIncome: parseFloat(params.get("monthlyIncome") || "5000"),
    desiredMonthlyIncome: parseFloat(params.get("desiredMonthlyIncome") || "3000"),
    currentSavings: parseFloat(params.get("currentSavings") || "0"),
    monthlySavingsRate: parseFloat(params.get("monthlySavingsRate") || "500"),
    targetFreedomAge: parseInt(params.get("targetFreedomAge") || "55"),
    annualReturn: 6,
    currency,
  };

  const baseResults = calculateFreedom(baseInputs);
  const sliderInputs: CalculationInputs = { ...baseInputs, annualReturn };
  const sliderResults = calculateFreedom(sliderInputs);

  const inputs = baseInputs;
  const results = baseResults;

  const saveCalculation = useCallback(
    async (retryCount = 0) => {
      if (hasSaved) return;
      const payload = {
        sessionId,
        country,
        currency,
        age: inputs.age,
        monthlyIncome: inputs.monthlyIncome,
        desiredMonthlyIncome: inputs.desiredMonthlyIncome,
        currentSavings: inputs.currentSavings,
        monthlySavingsRate: inputs.monthlySavingsRate,
        targetFreedomAge: inputs.targetFreedomAge,
        expectedLumpSum: 0,
        annualReturn: 6,
        requiredCapital: results.requiredCapital,
        plannedCapital: results.plannedCapitalStandard,
        gapPercent: results.gapPercent,
        freedomAge: results.freedomAgeStandard,
        freedomScore: results.freedomScore,
        solutionSaveMore: results.solutionModule.hasGap ? results.solutionModule.savingsLeverAmount : null,
        solutionLumpSum: results.solutionModule.hasGap ? results.solutionModule.lumpSumAmount : null,
        solutionReturnNeeded: results.solutionModule.hasGap ? results.solutionModule.efficiencyLeverReturn : null,
        referralSource: referralSource || null,
      };
      try {
        const res = await apiRequest("POST", "/api/calculations", payload);
        const data = await res.json();
        setCalculationId(data.id);
        setHasSaved(true);
      } catch (e) {
        console.error(`Calculation save failed (attempt ${retryCount + 1}):`, e);
        if (retryCount < 2) {
          setTimeout(() => saveCalculation(retryCount + 1), 2000 * (retryCount + 1));
        }
      }
    },
    [hasSaved, inputs, results, country, currency, referralSource, sessionId]
  );

  useEffect(() => {
    saveCalculation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============== Narrative theming ============== */
  const narrativeChip: Record<string, string> = {
    critical: "fa-pill-coral",
    moderate: "fa-pill-amber",
    on_track: "fa-pill-mint",
    basically_there: "fa-pill-sky",
  };

  const narrativeAccent: Record<string, string> = {
    critical: "text-coral",
    moderate: "text-primary",
    on_track: "text-mint",
    basically_there: "text-sky",
  };

  const narrativeIconBg: Record<string, string> = {
    critical: "bg-gradient-to-br from-coral to-orange-500",
    moderate: "bg-gradient-to-br from-amber-400 to-primary",
    on_track: "bg-gradient-to-br from-emerald-400 to-mint",
    basically_there: "bg-gradient-to-br from-sky-400 to-violet-500",
  };

  const narrativeIcons: Record<string, typeof Footprints> = {
    critical: Footprints,
    moderate: TreePine,
    on_track: TrendingUp,
    basically_there: Rocket,
  };
  const NarrativeIcon = narrativeIcons[results.narrative.type];

  const narrativeTypeToKey: Record<string, string> = {
    basically_there: "astronaut",
    on_track: "trailBlazer",
    moderate: "baseCamp",
    critical: "firstSteps",
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://finksmart.com";
  const shareText = t("results.share.shareText", {
    score: results.freedomScore,
    age: results.freedomAgeStandard,
  });

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  const currencySymbol = SUPPORTED_CURRENCIES[currency]?.symbol || currency;

  const handleSendReport = async () => {
    if (!reportEmail || !reportName) return;
    setIsSendingReport(true);
    try {
      const res = await apiRequest("POST", "/api/send-report", {
        email: reportEmail,
        name: reportName,
        calculationId,
        freedomScore: results.freedomScore,
        freedomAge: results.freedomAgeStandard,
        targetAge: inputs.targetFreedomAge,
        gapPercent: results.gapPercent,
        requiredCapital: results.requiredCapital,
        plannedCapital: results.plannedCapitalStandard,
        country,
        currency,
        currencySymbol,
        age: inputs.age,
        monthlyIncome: inputs.monthlyIncome,
        desiredMonthlyIncome: inputs.desiredMonthlyIncome,
        monthlySavingsRate: inputs.monthlySavingsRate,
        currentSavings: inputs.currentSavings,
        personality: results.narrative.personality,
        narrativeType: results.narrative.type,
      });
      if (res.ok) {
        setReportSent(true);
      }
    } catch (e) {
      console.error("Failed to send report:", e);
    } finally {
      setIsSendingReport(false);
    }
  };

  const formatChartValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  };

  const yearsDifference = results.yearsGained;

  const pieData = [
    { name: t("results.yourContributions"), value: results.capitalComposition.totalContributions },
    { name: t("results.generatedGains"), value: results.capitalComposition.generatedGains },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ============== HEADER ============== */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center" aria-label="FinkSmart">
            <img src={finksmartLogo} alt="FinkSmart" className="h-9 w-auto" />
          </button>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            className="rounded-full"
            data-testid="button-theme-toggle-results"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 md:py-12 space-y-7">
        {/* ============== 1. SUMMIT HERO ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="fa-surface-cream rounded-3xl p-6 md:p-10"
        >
          <div className="grid md:grid-cols-[auto_1fr] gap-5 md:gap-6 items-start mb-6">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${narrativeIconBg[results.narrative.type]} text-white grid place-items-center shadow-lg shadow-black/10`}
            >
              <NarrativeIcon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`fa-pill ${narrativeChip[results.narrative.type]}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {t(`results.personalities.${narrativeTypeToKey[results.narrative.type]}.title`)}
              </span>
              <h1
                className={`fa-display text-3xl md:text-4xl mt-3 ${narrativeAccent[results.narrative.type]}`}
                data-testid="text-narrative-headline"
              >
                {results.narrative.subtitle}
              </h1>
              <p className="text-base text-muted-foreground mt-3 leading-relaxed" data-testid="text-narrative-message">
                {t(`narratives.${narrativeTypeToKey[results.narrative.type]}.description`)}
              </p>
            </div>
          </div>

          {/* Mountain ascent visualization */}
          <div className="rounded-2xl bg-card border border-card-border p-4 md:p-6">
            <MountainAscent
              currentAge={inputs.age}
              freedomAge={results.freedomAgeStandard}
              targetAge={inputs.targetFreedomAge}
              labels={{
                today: t("results.gap.todayLabel"),
                freedom: t("results.gap.freedomMarker"),
                target: t("results.gap.targetMarker"),
                yearsSuffix: t("results.returnTable.yrs"),
              }}
              className="w-full"
            />
            {/* Stat row */}
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <StatCard
                Icon={IconTarget}
                label={t("results.targetCapital")}
                value={formatCurrencyFull(results.requiredCapital, currency)}
              />
              <StatCard
                Icon={IconGrowth}
                label={t("results.score")}
                value={`${results.freedomScore} / 100`}
                tone="amber"
              />
              <StatCard
                Icon={IconCompound}
                label={t("results.keyStats.yearsGained")}
                value={`${yearsDifference > 0 ? "+" : ""}${yearsDifference} ${t("results.returnTable.yrs")}`}
                tone="mint"
              />
            </div>
          </div>

          {/* Gap callout */}
          {results.freedomAgeStandard > inputs.targetFreedomAge && (
            <div className="mt-5 rounded-2xl bg-card border border-coral/30 p-5">
              <p className="text-sm md:text-base">
                <span className="font-semibold">{t("results.gap.currentPace")}</span>{" "}
                <span className="font-bold text-foreground">{results.freedomAgeStandard} {t("results.returnTable.yrs")}</span>
                <span className="text-coral font-bold">
                  {" "}
                  ({t("results.gap.laterThanPlanned", { years: results.freedomAgeStandard - inputs.targetFreedomAge })})
                </span>
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                <p className="text-sm text-muted-foreground">
                  {t("results.gap.label")}{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => document.getElementById("solution-section")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="button-show-close-gap"
                >
                  <ArrowDown className="w-3.5 h-3.5 mr-1.5" />
                  {t("results.gap.solutions")}
                </Button>
              </div>
            </div>
          )}
        </motion.section>

        {/* ============== 2. TARGET CAPITAL ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          <SectionHeader Icon={IconTarget} label={t("results.targetCapital")} />

          <div className="fa-card p-6">
            <p className="text-sm text-muted-foreground text-center">
              {t("results.toReceive", { amount: formatCurrencyFull(inputs.desiredMonthlyIncome, currency) })}
            </p>
            <p className="font-serif text-4xl md:text-5xl font-bold text-center mt-3 mb-4 text-primary" data-testid="text-required-capital">
              {formatCurrencyFull(results.requiredCapital, currency)}
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto leading-relaxed">
              {t("results.targetCapitalExplanation")}
            </p>
            <div className="text-xs text-muted-foreground text-center mt-3 mb-6 flex flex-col items-center gap-2">
              <span className="fa-pill fa-pill-amber">
                <Sparkles className="w-3 h-3" />
                {t("results.proInvesting")}
              </span>
              <span>{t("results.withdrawalRateBasis")}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/40 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1 font-medium">
                  {t("results.capitalAtAgeStandard", { age: inputs.targetFreedomAge })}
                  <InfoTooltip>
                    <p>{t("results.capitalAtAgeStandardTooltip", { age: inputs.targetFreedomAge })}</p>
                  </InfoTooltip>
                </p>
                <p className="font-serif text-2xl font-bold" data-testid="text-capital-standard">
                  {formatCurrencyFull(results.plannedCapitalStandard, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.gapLabel")}{" "}
                  {results.plannedCapitalStandard >= results.requiredCapital
                    ? t("results.gapNone")
                    : formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}
                </p>
              </div>
              <div className="rounded-2xl bg-mint/10 dark:bg-mint/15 p-4 text-center border border-mint/30">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1 font-medium">
                  {t("results.capitalAtAgeManaged", { age: inputs.targetFreedomAge })}
                  <InfoTooltip>
                    <p>{t("results.capitalAtAgeManagedTooltip")}</p>
                  </InfoTooltip>
                </p>
                <p className="font-serif text-2xl font-bold text-mint" data-testid="text-capital-managed">
                  {formatCurrencyFull(results.plannedCapitalManaged, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.gapLabel")}{" "}
                  {results.plannedCapitalManaged >= results.requiredCapital
                    ? t("results.gapNone")
                    : formatCurrency(results.requiredCapital - results.plannedCapitalManaged, currency)}
                </p>
                <div className="mt-3 pt-3 border-t border-mint/30">
                  <button
                    onClick={() => document.getElementById("phase2-cta")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-mint text-mint text-xs font-semibold transition-colors hover:bg-mint/10"
                    data-testid="button-heat-risk-dna"
                  >
                    {t("results.heatRiskDna")}
                  </button>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {t("results.aboveMarketAverage", { rate: "5.0" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============== 3. SOLUTIONS ============== */}
        <motion.section
          id="solution-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="fa-card p-6 md:p-8">
            {results.solutionModule.hasGap ? (
              <>
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/40 p-5 mb-6">
                  <h3 className="fa-display text-xl mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    {t("results.gap.dontPanic")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("results.gap.dontPanicText")}</p>
                </div>

                <p className="text-sm text-muted-foreground mb-5">
                  {t("results.gap.yourGap", { amount: formatCurrency(results.gapAmount, currency) })}
                </p>

                <div className="inline-flex rounded-2xl border border-border bg-muted/40 p-1 mb-6 flex-wrap gap-1" data-testid="solution-tabs">
                  {(["savings", "lumpsum", "efficiency"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveSolution(key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeSolution === key
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-background"
                      }`}
                      data-testid={`button-solution-${key}`}
                    >
                      {key === "savings" && (
                        <>
                          <DollarSign className="w-4 h-4" />
                          {t("results.solutions.lever1")}
                        </>
                      )}
                      {key === "lumpsum" && (
                        <>
                          <ArrowUpRight className="w-4 h-4" />
                          {t("results.solutions.lever2")}
                        </>
                      )}
                      {key === "efficiency" && (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          {t("results.solutions.lever3")}
                        </>
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSolution}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeSolution === "savings" && (
                      <SolutionPanel
                        Icon={DollarSign}
                        tone="sky"
                        title={t("results.solutions.savingsLeverTitle")}
                        desc={t("results.solutions.savingsLeverDesc")}
                        big={`${formatCurrencyFull(results.solutionModule.savingsLeverAmount, currency)}`}
                        bigSuffix={t("results.solutions.perMonth")}
                        detail={t("results.solutions.savingsLeverDetail", {
                          amount: formatCurrencyFull(results.solutionModule.savingsLeverAmount, currency),
                          current: formatCurrencyFull(inputs.monthlySavingsRate, currency),
                        })}
                        testId="solution-savings"
                      />
                    )}
                    {activeSolution === "lumpsum" && (
                      <SolutionPanel
                        Icon={ArrowUpRight}
                        tone="violet"
                        title={t("results.solutions.lumpSumTitle")}
                        desc={t("results.solutions.lumpSumDesc")}
                        big={formatCurrencyFull(results.solutionModule.lumpSumAmount, currency)}
                        bigSuffix={` ${t("results.solutions.lumpSumToday")}`}
                        detail={t("results.solutions.lumpSumDetail")}
                        testId="solution-lumpsum"
                      />
                    )}
                    {activeSolution === "efficiency" && (
                      <SolutionPanel
                        Icon={TrendingUp}
                        tone="mint"
                        title={t("results.solutions.smartManagerTitle")}
                        desc={t("results.solutions.smartManagerDesc")}
                        big={`${results.solutionModule.efficiencyLeverReturn}%`}
                        bigSuffix={` ${t("results.solutions.annualReturnNeeded")}`}
                        detail={t("results.solutions.smartManagerDetail", {
                          rate: (results.solutionModule.efficiencyLeverReturn - 6).toFixed(1),
                        })}
                        testId="solution-efficiency"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">{t("results.solutions.notHappy")}</p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => navigate("/")}
                    data-testid="button-retake-assessment"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("results.retake")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-mint" />
                  <h3 className="fa-display text-xl text-mint">{t("results.surplus.title")}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("results.surplus.description", {
                    amount: formatCurrencyFull(results.solutionModule.surplusAmount, currency),
                  })}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-mint/10 border border-mint/30 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      {t("results.surplus.retireEarlier")}
                    </p>
                    <p className="font-serif text-2xl font-bold text-mint">
                      {t("results.age")} {results.solutionModule.earlyFreedomAge}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("results.surplus.earlierThanPlanned", {
                        years: inputs.targetFreedomAge - results.solutionModule.earlyFreedomAge,
                      })}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky/10 border border-sky/30 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                      <DollarSign className="w-3 h-3" />
                      {t("results.surplus.increaseBudget")}
                    </p>
                    <p className="font-serif text-2xl font-bold text-sky">
                      {formatCurrencyFull(results.solutionModule.increasedMonthlyBudget, currency)}/mo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t("results.surplus.maintainTarget")}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* ============== 4. RETURN COMPARISON TABLE ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          <SectionHeader Icon={IconGrowth} label={t("results.returnComparison")} />
          <div className="fa-card p-6 overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-return-comparison">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">{t("results.returnRate")}</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">
                    {t("results.returnTable.capitalAtAge", { age: inputs.targetFreedomAge })}
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">{t("results.freedomAge")}</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">{t("results.returnTable.vsTarget")}</th>
                </tr>
              </thead>
              <tbody>
                {results.returnComparisons.map((row) => (
                  <tr key={row.label} className="border-b last:border-0 border-border">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${row.rate === 6 ? "bg-sky" : "bg-mint"}`}
                      />
                      {row.label}
                    </td>
                    <td className="py-3 text-right font-semibold">{formatCurrencyFull(row.capitalAtTarget, currency)}</td>
                    <td className="py-3 text-right">
                      {row.ageReached} {t("results.returnTable.yrs")}
                    </td>
                    <td className="py-3 text-right">
                      {row.timeDifference <= 0 ? (
                        <span className="fa-pill fa-pill-mint">
                          {t("results.returnTable.yrsEarly", { years: Math.abs(row.timeDifference) })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          +{row.timeDifference} {t("results.returnTable.yrs")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ============== 5. CAPITAL EVOLUTION CHART ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="space-y-3"
        >
          <SectionHeader Icon={IconBars} label={t("results.capitalEvolution")} />
          <div className="fa-card p-6">
            <div className="flex items-center gap-4 text-xs flex-wrap mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-mint" />
                {t("results.managed11")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-sky" />
                {t("results.standard6")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-coral" />
                {t("results.requiredCapitalLabel")}
              </span>
            </div>
            <div className="h-72 md:h-80" data-testid="chart-capital-evolution">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.wealthCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradManaged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_MINT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_MINT} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradStandard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_SKY} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CHART_SKY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatChartValue}
                    width={50}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrencyFull(value, currency), ""]}
                    labelFormatter={(label) => `${t("results.age")} ${label}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      fontSize: "12px",
                      boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
                    }}
                  />
                  <ReferenceLine
                    x={inputs.targetFreedomAge}
                    stroke={CHART_AMBER}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `${t("results.age")} ${inputs.targetFreedomAge}`,
                      position: "top",
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requiredCapital"
                    stroke={CHART_CORAL}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="none"
                    name={t("results.requiredCapitalLabel")}
                  />
                  <Area
                    type="monotone"
                    dataKey="managedWealth"
                    stroke={CHART_MINT}
                    strokeWidth={2.5}
                    fill="url(#gradManaged)"
                    name={t("results.managed11")}
                  />
                  <Area
                    type="monotone"
                    dataKey="standardWealth"
                    stroke={CHART_SKY}
                    strokeWidth={2.5}
                    fill="url(#gradStandard)"
                    name={t("results.standard6")}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ============== 6. CAPITAL COMPOSITION DONUT ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          <SectionHeader Icon={IconCompound} label={t("results.capitalCompositionTitle")} />
          <div className="fa-card p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-52 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={92}
                        dataKey="value"
                        strokeWidth={3}
                        stroke="hsl(var(--card))"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        {t("results.capitalLabel")}
                      </p>
                      <p className="font-serif text-xl font-bold mt-1">
                        {formatCurrency(results.capitalComposition.totalCapital, currency)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
                    {t("results.contributionsLabel")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
                    {t("results.gainsLabel")}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-sky/10 border border-sky/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Coins className="w-3 h-3" />
                    {t("results.yourContributions")}
                  </p>
                  <p className="font-serif text-xl font-bold text-sky">
                    {formatCurrencyFull(results.capitalComposition.totalContributions, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("results.ofFinalCapital", { percent: results.capitalComposition.contributionPercent })}
                  </p>
                </div>
                <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Zap className="w-3 h-3" />
                    {t("results.generatedGains")}
                  </p>
                  <p className="font-serif text-xl font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrencyFull(results.capitalComposition.generatedGains, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("results.ofFinalCapital", { percent: results.capitalComposition.gainsPercent })}
                  </p>
                </div>
                {results.capitalComposition.gainsPercent > 0 && (
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-2 border border-amber-200/50">
                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">{t("results.compoundInterestTitle")}</p>
                      <p>
                        {t("results.compoundInterestDesc", {
                          percent: results.capitalComposition.gainsPercent,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============== 7. KEY STATS ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KeyStat
              label={t("results.keyStats.monthlySavings")}
              value={formatCurrencyFull(inputs.monthlySavingsRate, currency)}
              testId="text-monthly-savings"
            />
            <KeyStat
              label={t("results.keyStats.managedCapital")}
              value={formatCurrency(results.plannedCapitalManaged, currency)}
              tone="mint"
            />
            <KeyStat label={t("results.keyStats.standardCapital")} value={formatCurrency(results.plannedCapitalStandard, currency)} />
            <KeyStat
              label={t("results.keyStats.yearsGained")}
              value={`${yearsDifference > 0 ? "+" : ""}${yearsDifference} ${t("results.returnTable.yrs")}`}
              hint={t("results.keyStats.withManaged")}
              tone="amber"
              testId="text-years-gained"
            />
          </div>
        </motion.section>

        {/* ============== 8. SENSITIVITY ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="fa-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <IconLightbulb size={36} />
              <h3 className="fa-display text-xl">{t("results.sensitivity.title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {(() => {
                const raw = t("results.sensitivity.sensitivityDesc");
                const parts = raw.split(/<bold>|<\/bold>/);
                return parts.map((part: string, i: number) =>
                  i === 1 ? (
                    <span key={i} className="font-semibold text-foreground">
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                );
              })()}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-sky" />
                  <span className="text-xs text-muted-foreground font-semibold">
                    {t("results.sensitivity.standardLabel")}
                  </span>
                </div>
                <p className="font-serif text-xl font-bold">
                  {t("results.sensitivity.freedomAt", { age: results.freedomAgeStandard })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("results.sensitivity.capitalAmount", {
                    amount: formatCurrencyFull(results.plannedCapitalStandard, currency),
                  })}
                </p>
              </div>
              <div className="rounded-2xl bg-mint/10 border border-mint/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-mint" />
                  <span className="text-xs text-muted-foreground font-semibold">
                    {t("results.sensitivity.managedLabel")}
                  </span>
                </div>
                <p className="font-serif text-xl font-bold text-mint">
                  {t("results.sensitivity.freedomAt", { age: results.freedomAgeManaged })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("results.sensitivity.capitalAmount", {
                    amount: formatCurrencyFull(results.plannedCapitalManaged, currency),
                  })}
                </p>
              </div>
            </div>
            {yearsDifference > 0 && (
              <div className="rounded-2xl bg-sky/10 border border-sky/20 p-4 mb-6">
                <div className="rounded-xl bg-card p-3 text-xs space-y-1.5 border border-border">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-primary" />
                    {t("results.sensitivity.concreteExample")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("results.sensitivity.at6Percent")}{" "}
                    <span className="font-bold text-foreground">{results.freedomAgeStandard}</span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("results.sensitivity.at11Percent")}{" "}
                    <span className="font-bold text-foreground">{results.freedomAgeManaged}</span>
                  </p>
                  <p className="text-sky font-semibold">
                    {t("results.sensitivity.yearsGainedProfessional", { years: yearsDifference })}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                {t("results.sensitivity.trySlider")}
                <InfoTooltip>
                  <p>{t("results.sensitivity.sliderTooltip")}</p>
                </InfoTooltip>
              </p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">4%</span>
                <div className="flex-1">
                  <Slider
                    value={[annualReturn]}
                    onValueChange={([val]) => setAnnualReturn(val)}
                    min={4}
                    max={12}
                    step={0.5}
                    data-testid="slider-annual-return"
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">12%</span>
              </div>
              <div className="text-center">
                <span className="font-serif text-4xl font-bold text-primary" data-testid="text-slider-return">
                  {annualReturn}%
                </span>
                <p className="text-xs text-muted-foreground mt-1">{t("results.sensitivity.annualReturnAssumption")}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("results.sensitivity.atRateFreedomAge", { rate: annualReturn, age: sliderResults.freedomAge })}
                  {sliderResults.freedomAge <= inputs.targetFreedomAge && (
                    <span className="ml-1 text-mint font-semibold">
                      {" "}
                      {t("results.sensitivity.beforeTarget")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.sensitivity.capitalAtAgeSlider", {
                    age: inputs.targetFreedomAge,
                    amount: formatCurrencyFull(sliderResults.plannedCapital, currency),
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============== 9. PROFILE BADGE RECAP ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <div className="fa-card p-6 md:p-8 fa-surface-cream">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className={`w-24 h-24 rounded-3xl ${narrativeIconBg[results.narrative.type]} grid place-items-center shadow-xl shadow-black/15`}
              >
                <NarrativeIcon className="w-12 h-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className={`fa-display text-2xl ${narrativeAccent[results.narrative.type]}`}>
                  {t(`results.personalities.${narrativeTypeToKey[results.narrative.type]}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground italic mt-1 mb-3">{results.narrative.subtitle}</p>
                <div className={`fa-pill ${narrativeChip[results.narrative.type]}`}>
                  <Sparkles className="w-3 h-3" />
                  {t("results.freedomScoreLabel", { score: results.freedomScore })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============== 10. SHARE ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="fa-card p-6 text-center">
            <h3 className="fa-display text-2xl mb-2">{t("results.share.title")}</h3>
            <p className="text-sm text-muted-foreground mb-5">{t("results.share.subtitle")}</p>
            <div className="flex items-center justify-center gap-4 mb-5">
              {[
                { id: "whatsapp", color: "#25D366", Icon: SiWhatsapp },
                { id: "facebook", color: "#1877F2", Icon: SiFacebook },
                { id: "twitter", color: "#000000", Icon: SiX },
                { id: "linkedin", color: "#0A66C2", Icon: SiLinkedin },
              ].map(({ id, color, Icon }) => (
                <Button
                  key={id}
                  size="icon"
                  onClick={() => handleShare(id)}
                  className="rounded-full w-12 h-12 shadow-md"
                  style={{ backgroundColor: color }}
                  data-testid={`button-share-${id}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setShowShareCard(true)}
              data-testid="button-download-card"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("results.share.downloadCard")}
            </Button>
          </div>
        </motion.section>

        {/* ============== 11. SAVE REPORT ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52 }}
        >
          <div className="fa-card p-6 text-center fa-surface-cream">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 grid place-items-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h3 className="fa-display text-2xl mb-2">{t("results.saveReport.title")}</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              {t("results.saveReport.description")}
            </p>
            <Button
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => setShowSaveReport(true)}
              data-testid="button-save-report"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t("results.saveReport.emailButton")}
            </Button>
          </div>
        </motion.section>

        {/* ============== 12. PHASE 2 RISK DNA ============== */}
        <motion.section
          id="phase2-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <div className="fa-card p-6 md:p-10">
            <div className="flex flex-col items-center text-center">
              <IconDNA size={84} className="mb-4" />
              <h3 className="fa-display text-3xl mb-2" data-testid="text-phase2-title">
                {t("results.phase2.title")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">{t("results.phase2.subtitle")}</p>
              <div className="space-y-3 text-left max-w-sm mb-6">
                <Phase2Bullet
                  Icon={IconShield}
                  title={t("results.phase2.bulletproof")}
                  text={t("results.phase2.bulletproofText")}
                />
                <Phase2Bullet
                  Icon={IconDNA}
                  title={t("results.phase2.riskDna")}
                  text={t("results.phase2.riskDnaText")}
                />
                <Phase2Bullet
                  Icon={IconCompass}
                  title={t("results.phase2.investmentBridge")}
                  text={t("results.phase2.investmentBridgeText")}
                />
              </div>
              <button className="premium-cta premium-cta-lg" onClick={() => setShowLeadModal(true)} data-testid="button-unlock-phase2">
                <Lock className="w-4 h-4" />
                {t("results.phase2.cta")}
              </button>
            </div>
          </div>
        </motion.section>

        {/* ============== 13. PRECISION + SECOND OPINION ============== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="fa-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <IconTarget size={36} />
                <h3 className="font-serif text-lg font-bold">{t("results.precision.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t("results.precision.text")}</p>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowLeadModal(true)} data-testid="button-precision-cta">
                {t("results.precision.cta")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="fa-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <IconShield size={36} />
                <h3 className="font-serif text-lg font-bold">{t("results.secondOpinion.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t("results.secondOpinion.text")}</p>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowLeadModal(true)} data-testid="button-second-opinion">
                {t("results.secondOpinion.cta")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* ============== 14. BOTTOM NAV ============== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex justify-center"
        >
          <Button variant="outline" className="rounded-xl" onClick={() => navigate("/")} data-testid="button-start-over">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("results.startOver")}
          </Button>
        </motion.div>

        <footer className="text-center py-8 mt-2 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={finksmartLogo} alt="FinkSmart" className="h-7 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">{t("results.footerEngine")}</p>
          <p className="text-[10px] text-muted-foreground">finksmart.com</p>
          <div className="mt-3 pt-3 border-t border-border max-w-xl mx-auto">
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{t("results.footerDisclaimer")}</p>
          </div>
        </footer>
      </main>

      {/* Lead capture & share dialogs */}
      <LeadCaptureModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        calculationId={calculationId}
        country={country}
        currency={currency}
        gapPercent={results.gapPercent}
        freedomScore={results.freedomScore}
        referralSource={referralSource}
        sessionId={sessionId}
        leadStatus="risk_dna_started"
      />

      {showShareCard && (
        <FreedomScoreCard
          open={showShareCard}
          onClose={() => setShowShareCard(false)}
          freedomScore={results.freedomScore}
          freedomAge={results.freedomAgeStandard}
          targetAge={inputs.targetFreedomAge}
          gapPercent={results.gapPercent}
          country={country}
          currency={currency}
          narrativeType={results.narrative.type}
          personality={results.narrative.personality}
          subtitle={results.narrative.subtitle}
          monthlySavings={inputs.monthlySavingsRate}
        />
      )}

      <Dialog
        open={showSaveReport}
        onOpenChange={(open) => {
          setShowSaveReport(open);
          if (!open) {
            setReportSent(false);
            setReportName("");
            setReportEmail("");
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl">
          <AnimatePresence mode="wait">
            {!reportSent ? (
              <motion.div key="report-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader>
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 grid place-items-center mx-auto mb-3">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <DialogTitle className="font-serif text-xl text-center">
                    {t("results.saveReport.dialogTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-center">{t("results.saveReport.dialogDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="report-name">{t("results.saveReport.nameLabel")}</Label>
                    <Input
                      id="report-name"
                      placeholder={t("results.saveReport.namePlaceholder")}
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="rounded-xl"
                      data-testid="input-report-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-email">{t("results.saveReport.emailLabel")}</Label>
                    <Input
                      id="report-email"
                      type="email"
                      placeholder={t("results.saveReport.emailPlaceholder")}
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="rounded-xl"
                      data-testid="input-report-email"
                    />
                  </div>
                  <Button
                    className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
                    onClick={handleSendReport}
                    disabled={isSendingReport || !reportEmail || !reportName}
                    data-testid="button-send-report"
                  >
                    {isSendingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("results.saveReport.sending")}
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        {t("results.saveReport.sendButton")}
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">{t("results.saveReport.privacy")}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="report-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-mint/15 grid place-items-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-mint" />
                </div>
                <h3 className="fa-display text-2xl mb-2">{t("results.saveReport.successTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("results.saveReport.successDesc", { email: reportEmail })}
                </p>
                <Button variant="outline" className="rounded-xl" onClick={() => setShowSaveReport(false)} data-testid="button-close-report-modal">
                  {t("results.saveReport.close")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============== Helper components ============== */

function SectionHeader({ Icon, label }: { Icon: (p: { size?: number }) => JSX.Element; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={28} />
      <p className="text-foreground/80 text-sm font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: (p: { size?: number }) => JSX.Element;
  label: string;
  value: string;
  tone?: "amber" | "mint";
}) {
  const toneCls =
    tone === "amber"
      ? "bg-primary/8 border-primary/20"
      : tone === "mint"
      ? "bg-mint/8 border-mint/20"
      : "bg-card border-border";
  return (
    <div className={`rounded-2xl border p-3 flex items-center gap-3 ${toneCls}`}>
      <Icon size={36} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
        <p className="font-serif text-lg font-bold leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

function KeyStat({
  label,
  value,
  hint,
  tone,
  testId,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "mint" | "amber";
  testId?: string;
}) {
  const toneCls =
    tone === "mint" ? "bg-mint/8 border-mint/20 text-mint" : tone === "amber" ? "bg-primary/8 border-primary/20 text-primary" : "bg-card border-border text-foreground";
  return (
    <div className={`fa-card p-4 text-center ${tone ? toneCls : ""}`}>
      <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
      <p className="font-serif text-lg font-bold" data-testid={testId}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function SolutionPanel({
  Icon,
  tone,
  title,
  desc,
  big,
  bigSuffix,
  detail,
  testId,
}: {
  Icon: typeof DollarSign;
  tone: "sky" | "violet" | "mint";
  title: string;
  desc: string;
  big: string;
  bigSuffix: string;
  detail: string;
  testId: string;
}) {
  const toneCls =
    tone === "sky"
      ? "bg-sky/10 border-sky/30 text-sky"
      : tone === "violet"
      ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
      : "bg-mint/10 border-mint/30 text-mint";
  return (
    <div className={`rounded-2xl border p-5 ${toneCls.split(" ").slice(0, 2).join(" ")}`} data-testid={testId}>
      <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
        <Icon className={`w-4 h-4 ${toneCls.split(" ")[2] || ""}`} />
        {title}
      </h4>
      <p className="text-sm text-muted-foreground mb-3">{desc}</p>
      <p className={`font-serif text-3xl font-bold mb-2 ${toneCls.split(" ").slice(2).join(" ")}`}>
        {big}
        <span className="text-base font-normal text-muted-foreground">{bigSuffix}</span>
      </p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function Phase2Bullet({
  Icon,
  title,
  text,
}: {
  Icon: (p: { size?: number }) => JSX.Element;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon size={28} />
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
