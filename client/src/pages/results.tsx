import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  ArrowDown,
  Sun,
  Moon,
  Heart,
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
import iconGoal from "@assets/icons/icon-goal.png";
import iconGrowth from "@assets/icons/icon-growth.png";
import iconAnalytics from "@assets/icons/icon-analytics.png";
import iconCompound from "@assets/icons/icon-compound.png";
import iconRiskDna from "@assets/icons/icon-risk-dna.png";
import iconDataPrivacy from "@assets/icons/icon-data-privacy.png";
import iconRoadmap from "@assets/icons/icon-roadmap.png";
import iconSmartLogic from "@assets/icons/icon-smart-logic.png";
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
        <button type="button" className="cursor-help inline-flex ml-1 touch-manipulation" data-testid="button-info-tooltip" aria-label="More information">
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-xs text-xs leading-relaxed p-3">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export default function Results() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const country = params.get("country") || "Mauritius";
  const currency = params.get("currency") || "MUR";
  const referralSource = params.get("ref") || "";

  const [annualReturn, setAnnualReturn] = useState(
    parseFloat(params.get("annualReturn") || "7")
  );
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

  const saveCalculation = useCallback(async (retryCount = 0) => {
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
  }, [hasSaved, inputs, results, country, currency, referralSource, sessionId]);

  useEffect(() => {
    saveCalculation();
  }, []);

  const narrativeColors: Record<string, string> = {
    critical: "text-red-500 dark:text-red-400",
    moderate: "text-amber-500 dark:text-amber-400",
    on_track: "text-emerald-500 dark:text-emerald-400",
    basically_there: "text-blue-500 dark:text-blue-400",
  };

  const narrativeBgColors: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/20",
    moderate: "bg-amber-500/10 border-amber-500/20",
    on_track: "bg-emerald-500/10 border-emerald-500/20",
    basically_there: "bg-blue-500/10 border-blue-500/20",
  };

  const narrativeIcons: Record<string, typeof Heart> = {
    critical: Footprints,
    moderate: TreePine,
    on_track: TrendingUp,
    basically_there: Rocket,
  };

  const NarrativeIcon = narrativeIcons[results.narrative.type];

  const narrativeTypeToKey: Record<string, string> = {
    "basically_there": "astronaut",
    "on_track": "trailBlazer",
    "moderate": "baseCamp",
    "critical": "firstSteps",
  };

  const profileBadgeStyles: Record<string, { bg: string; gradient: string }> = {
    critical: { bg: "bg-gradient-to-br from-orange-500 to-rose-600", gradient: "from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30" },
    moderate: { bg: "bg-gradient-to-br from-amber-500 to-orange-500", gradient: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" },
    on_track: { bg: "bg-gradient-to-br from-emerald-500 to-teal-500", gradient: "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30" },
    basically_there: { bg: "bg-gradient-to-br from-violet-500 to-blue-500", gradient: "from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30" },
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://finksmart.com";
  const shareText = t("results.share.shareText", { score: results.freedomScore, age: results.freedomAgeStandard });

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
  const PIE_COLORS = ["#6366f1", "#a78bfa"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={finksmartLogo} alt="FinkSmart - Pro-Investing Decoded" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle-results">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* 1. Profile Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className={`p-6 md:p-8 border ${narrativeBgColors[results.narrative.type]}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 ${profileBadgeStyles[results.narrative.type].bg} text-white`}>
                <NarrativeIcon className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div className="flex-1">
                <h1 className={`font-serif text-2xl md:text-3xl font-bold mb-1 ${narrativeColors[results.narrative.type]}`} data-testid="text-narrative-headline">
                  {t(`results.personalities.${narrativeTypeToKey[results.narrative.type]}.title`)}
                </h1>
                <p className="text-sm text-muted-foreground italic mb-2">{results.narrative.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-narrative-message">
                  {t(`narratives.${narrativeTypeToKey[results.narrative.type]}.description`)}
                </p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background flex items-center justify-center flex-shrink-0 border"
              >
                <div className="text-center">
                  <span className="text-2xl md:text-3xl font-bold text-primary" data-testid="text-freedom-score">
                    {results.freedomScore}
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-none">{t("results.score")}</p>
                </div>
              </motion.div>
              <InfoTooltip>
                <p className="font-semibold mb-1">{t("results.freedomScoreTooltip")}</p>
                <p>{t("results.freedomScoreExplanation")}</p>
              </InfoTooltip>
            </div>

            <div className="bg-background/60 rounded-md p-4">
              <p className="text-sm" data-testid="text-trajectory-analysis">
                {t("results.gap.atAge", { age: inputs.targetFreedomAge })}{" "}
                <span className="font-bold text-primary">{formatCurrencyFull(results.plannedCapitalStandard, currency)}</span>{" "}
                {results.plannedCapitalStandard < results.requiredCapital ? (
                  <>{t("results.gap.insteadOf")} <span className="font-bold">{formatCurrencyFull(results.requiredCapital, currency)}</span> {t("results.gap.needed")}</>
                ) : (
                  <>{t("results.gap.exceeds")} <span className="font-bold">{formatCurrencyFull(results.requiredCapital, currency)}</span> {t("results.gap.exceededNeeded")}</>
                )}
              </p>
              {results.freedomAgeStandard > inputs.targetFreedomAge && (
                <div className="flex flex-col gap-3 mt-3">
                  <p className="text-base md:text-lg font-bold text-foreground leading-snug">
                    {t("results.gap.currentPace")}{" "}
                    <span className="font-bold">{results.freedomAgeStandard}</span>{" "}
                    <span className="text-red-500 dark:text-red-400 font-bold">
                      ({t("results.gap.laterThanPlanned", { years: results.freedomAgeStandard - inputs.targetFreedomAge })})
                    </span>
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      {t("results.gap.label")} <span className="font-semibold">{formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}</span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 border-primary/30 text-primary"
                      onClick={() => document.getElementById("solution-section")?.scrollIntoView({ behavior: "smooth" })}
                      data-testid="button-show-close-gap"
                    >
                      <ArrowDown className="w-3.5 h-3.5 mr-1.5" />
                      {t("results.gap.solutions")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* 2. Target Capital */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <img src={iconGoal} alt="" className="w-5 h-5" />
              {t("results.targetCapital")}
            </p>
          </div>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              {t("results.toReceive", { amount: formatCurrencyFull(inputs.desiredMonthlyIncome, currency) })}
            </p>
            <p className="text-3xl md:text-4xl font-bold text-center my-4" data-testid="text-required-capital">
              {formatCurrencyFull(results.requiredCapital, currency)}
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto mt-2 mb-4 leading-relaxed">
              {t("results.targetCapitalExplanation")}
            </p>
            <div className="text-xs text-muted-foreground text-center mb-6 flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-medium text-primary tracking-wide">
                <Sparkles className="w-3 h-3" />{t("results.proInvesting")}
              </span>
              <span className="flex items-center gap-1">{t("results.withdrawalRateBasis")}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  {t("results.capitalAtAgeStandard", { age: inputs.targetFreedomAge })}
                  <InfoTooltip><p>{t("results.capitalAtAgeStandardTooltip", { age: inputs.targetFreedomAge })}</p></InfoTooltip>
                </p>
                <p className="text-xl font-bold" data-testid="text-capital-standard">{formatCurrencyFull(results.plannedCapitalStandard, currency)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.gapLabel")} {results.plannedCapitalStandard >= results.requiredCapital ? t("results.gapNone") : formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}
                </p>
              </div>
              <div className="bg-emerald-500/10 dark:bg-emerald-900/20 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  {t("results.capitalAtAgeManaged", { age: inputs.targetFreedomAge })}
                  <InfoTooltip><p>{t("results.capitalAtAgeManagedTooltip")}</p></InfoTooltip>
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-capital-managed">{formatCurrencyFull(results.plannedCapitalManaged, currency)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.gapLabel")} {results.plannedCapitalManaged >= results.requiredCapital ? t("results.gapNone") : formatCurrency(results.requiredCapital - results.plannedCapitalManaged, currency)}
                </p>
                <div className="mt-3 pt-3 border-t border-emerald-200/40 dark:border-emerald-700/40">
                  <button
                    onClick={() => document.getElementById("phase2-cta")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-teal-500 text-teal-600 dark:text-teal-400 text-xs font-semibold bg-transparent transition-colors hover:bg-teal-500/10"
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
          </Card>
        </motion.div>

        {/* 3. Solution Module */}
        <motion.div id="solution-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <Card className="p-6 md:p-8">
            {results.solutionModule.hasGap ? (
              <>
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/40 p-5 mb-6">
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    {t("results.gap.dontPanic")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("results.gap.dontPanicText")}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-5">
                  {t("results.gap.yourGap", { amount: formatCurrency(results.gapAmount, currency) })}
                </p>

                <div className="inline-flex rounded-md shadow-sm border bg-muted/50 p-1 mb-6 flex-wrap gap-1" data-testid="solution-tabs">
                  {(["savings", "lumpsum", "efficiency"] as const).map((key, idx) => (
                    <button
                      key={key}
                      onClick={() => setActiveSolution(key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeSolution === key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-background"}`}
                      data-testid={`button-solution-${key}`}
                    >
                      {key === "savings" && <><DollarSign className="w-4 h-4" />{t("results.solutions.lever1")}</>}
                      {key === "lumpsum" && <><ArrowUpRight className="w-4 h-4" />{t("results.solutions.lever2")}</>}
                      {key === "efficiency" && <><TrendingUp className="w-4 h-4" />{t("results.solutions.lever3")}</>}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeSolution} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {activeSolution === "savings" && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5" data-testid="solution-savings">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" />{t("results.solutions.savingsLeverTitle")}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{t("results.solutions.savingsLeverDesc")}</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formatCurrencyFull(results.solutionModule.savingsLeverAmount, currency)}<span className="text-base font-normal text-muted-foreground">{t("results.solutions.perMonth")}</span></p>
                        <p className="text-xs text-muted-foreground">{t("results.solutions.savingsLeverDetail", { amount: formatCurrencyFull(results.solutionModule.savingsLeverAmount, currency), current: formatCurrencyFull(inputs.monthlySavingsRate, currency) })}</p>
                      </div>
                    )}
                    {activeSolution === "lumpsum" && (
                      <div className="rounded-md bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-5" data-testid="solution-lumpsum">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-violet-500" />{t("results.solutions.lumpSumTitle")}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{t("results.solutions.lumpSumDesc")}</p>
                        <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">{formatCurrencyFull(results.solutionModule.lumpSumAmount, currency)}<span className="text-base font-normal text-muted-foreground"> {t("results.solutions.lumpSumToday")}</span></p>
                        <p className="text-xs text-muted-foreground">{t("results.solutions.lumpSumDetail")}</p>
                      </div>
                    )}
                    {activeSolution === "efficiency" && (
                      <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5" data-testid="solution-efficiency">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />{t("results.solutions.smartManagerTitle")}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{t("results.solutions.smartManagerDesc")}</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{results.solutionModule.efficiencyLeverReturn}%<span className="text-base font-normal text-muted-foreground"> {t("results.solutions.annualReturnNeeded")}</span></p>
                        <p className="text-xs text-muted-foreground">{t("results.solutions.smartManagerDetail", { rate: (results.solutionModule.efficiencyLeverReturn - 6).toFixed(1) })}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 pt-5 border-t border-border/40">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("results.solutions.notHappy")}
                  </p>
                  <Button variant="outline" onClick={() => navigate("/")} data-testid="button-retake-assessment">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("results.retake")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">{t("results.surplus.title")}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("results.surplus.description", { amount: formatCurrencyFull(results.solutionModule.surplusAmount, currency) })}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />{t("results.surplus.retireEarlier")}</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{t("results.age")} {results.solutionModule.earlyFreedomAge}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("results.surplus.earlierThanPlanned", { years: inputs.targetFreedomAge - results.solutionModule.earlyFreedomAge })}</p>
                  </div>
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />{t("results.surplus.increaseBudget")}</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrencyFull(results.solutionModule.increasedMonthlyBudget, currency)}/mo</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("results.surplus.maintainTarget")}</p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* 4. Return Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <img src={iconGrowth} alt="" className="w-5 h-5" />
            {t("results.returnComparison")}
          </p>
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-return-comparison">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">{t("results.returnRate")}</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">{t("results.returnTable.capitalAtAge", { age: inputs.targetFreedomAge })}</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">{t("results.freedomAge")}</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">{t("results.returnTable.vsTarget")}</th>
                </tr>
              </thead>
              <tbody>
                {results.returnComparisons.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${row.rate === 6 ? "bg-blue-400" : "bg-emerald-500"}`} />
                      {row.label}
                    </td>
                    <td className="py-3 text-right font-semibold">{formatCurrencyFull(row.capitalAtTarget, currency)}</td>
                    <td className="py-3 text-right">{row.ageReached} {t("results.returnTable.yrs")}</td>
                    <td className="py-3 text-right">
                      {row.timeDifference <= 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {t("results.returnTable.yrsEarly", { years: Math.abs(row.timeDifference) })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">+{row.timeDifference} {t("results.returnTable.yrs")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>

        {/* 5. Capital Evolution Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <img src={iconAnalytics} alt="" className="w-5 h-5" />
            {t("results.capitalEvolution")}
          </p>
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
                  {t("results.managed11")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-blue-400" />
                  {t("results.standard6")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-red-400" />
                  {t("results.requiredCapitalLabel")}
                </span>
              </div>
            </div>
            <div className="h-72 md:h-80" data-testid="chart-capital-evolution">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.wealthCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradManaged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradStandard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={formatChartValue} width={50} />
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrencyFull(value, currency), ""]}
                    labelFormatter={(label) => `${t("results.age")} ${label}`}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                  />
                  <ReferenceLine x={inputs.targetFreedomAge} stroke="hsl(var(--primary))" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `${t("results.age")} ${inputs.targetFreedomAge}`, position: "top", fontSize: 10 }} />
                  <Area type="monotone" dataKey="requiredCapital" stroke="#f87171" strokeWidth={2} strokeDasharray="6 3" fill="none" name={t("results.requiredCapitalLabel")} />
                  <Area type="monotone" dataKey="managedWealth" stroke="#10b981" strokeWidth={2} fill="url(#gradManaged)" name={t("results.managed11")} />
                  <Area type="monotone" dataKey="standardWealth" stroke="#60a5fa" strokeWidth={2} fill="url(#gradStandard)" name={t("results.standard6")} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* 6. Capital Composition Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <img src={iconCompound} alt="" className="w-5 h-5" />
            {t("results.capitalCompositionTitle")}
          </p>
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={2} stroke="hsl(var(--background))">
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("results.capitalLabel")}</p>
                      <p className="text-lg font-bold">{formatCurrency(results.capitalComposition.totalCapital, currency)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />{t("results.contributionsLabel")}</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />{t("results.gainsLabel")}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-md bg-indigo-50 dark:bg-indigo-900/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Coins className="w-3 h-3" />{t("results.yourContributions")}</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrencyFull(results.capitalComposition.totalContributions, currency)}</p>
                  <p className="text-xs text-muted-foreground">{t("results.ofFinalCapital", { percent: results.capitalComposition.contributionPercent })}</p>
                </div>
                <div className="rounded-md bg-violet-50 dark:bg-violet-900/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3" />{t("results.generatedGains")}</p>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{formatCurrencyFull(results.capitalComposition.generatedGains, currency)}</p>
                  <p className="text-xs text-muted-foreground">{t("results.ofFinalCapital", { percent: results.capitalComposition.gainsPercent })}</p>
                </div>
                {results.capitalComposition.gainsPercent > 0 && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">{t("results.compoundInterestTitle")}</p>
                      <p>{t("results.compoundInterestDesc", { percent: results.capitalComposition.gainsPercent })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 7. Key Stats Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("results.keyStats.monthlySavings")}</p>
              <p className="text-lg font-bold" data-testid="text-monthly-savings">{formatCurrencyFull(inputs.monthlySavingsRate, currency)}</p>
            </Card>
            <Card className="p-4 text-center bg-emerald-500/5">
              <p className="text-xs text-muted-foreground mb-1">{t("results.keyStats.managedCapital")}</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(results.plannedCapitalManaged, currency)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("results.keyStats.standardCapital")}</p>
              <p className="text-lg font-bold">{formatCurrency(results.plannedCapitalStandard, currency)}</p>
            </Card>
            <Card className="p-4 text-center bg-primary/5">
              <p className="text-xs text-muted-foreground mb-1">{t("results.keyStats.yearsGained")}</p>
              <p className="text-lg font-bold text-primary" data-testid="text-years-gained">
                {yearsDifference > 0 ? `+${yearsDifference}` : yearsDifference} {t("results.returnTable.yrs")}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("results.keyStats.withManaged")}</p>
            </Card>
          </div>
        </motion.div>

        {/* 8. Sensitivity / Education Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <img src={iconSmartLogic} alt="" className="w-6 h-6" />
              <h3 className="font-semibold text-lg">{t("results.sensitivity.title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {(() => {
                const raw = t("results.sensitivity.sensitivityDesc");
                const parts = raw.split(/<bold>|<\/bold>/);
                return parts.map((part: string, i: number) =>
                  i === 1 ? <span key={i} className="font-semibold text-foreground">{part}</span> : <span key={i}>{part}</span>
                );
              })()}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded-full bg-blue-400" /><span className="text-xs text-muted-foreground">{t("results.sensitivity.standardLabel")}</span></div>
                <p className="text-xl font-bold">{t("results.sensitivity.freedomAt", { age: results.freedomAgeStandard })}</p>
                <p className="text-xs text-muted-foreground">{t("results.sensitivity.capitalAmount", { amount: formatCurrencyFull(results.plannedCapitalStandard, currency) })}</p>
              </div>
              <div className="rounded-md bg-emerald-500/10 dark:bg-emerald-900/20 p-4">
                <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">{t("results.sensitivity.managedLabel")}</span></div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{t("results.sensitivity.freedomAt", { age: results.freedomAgeManaged })}</p>
                <p className="text-xs text-muted-foreground">{t("results.sensitivity.capitalAmount", { amount: formatCurrencyFull(results.plannedCapitalManaged, currency) })}</p>
              </div>
            </div>
            {yearsDifference > 0 && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 mb-6">
                <div className="mt-1 rounded-md bg-background/80 p-3 text-xs space-y-1.5">
                  <p className="font-medium text-foreground flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500" />{t("results.sensitivity.concreteExample")}</p>
                  <p className="text-muted-foreground">{t("results.sensitivity.at6Percent")} <span className="font-bold text-foreground">{results.freedomAgeStandard}</span></p>
                  <p className="text-muted-foreground">{t("results.sensitivity.at11Percent")} <span className="font-bold text-foreground">{results.freedomAgeManaged}</span></p>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">{t("results.sensitivity.yearsGainedProfessional", { years: yearsDifference })}</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                {t("results.sensitivity.trySlider")}
                <InfoTooltip><p>{t("results.sensitivity.sliderTooltip")}</p></InfoTooltip>
              </p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">4%</span>
                <div className="flex-1"><Slider value={[annualReturn]} onValueChange={([val]) => setAnnualReturn(val)} min={4} max={12} step={0.5} data-testid="slider-annual-return" /></div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">12%</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary" data-testid="text-slider-return">{annualReturn}%</span>
                <p className="text-xs text-muted-foreground mt-1">{t("results.sensitivity.annualReturnAssumption")}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("results.sensitivity.atRateFreedomAge", { rate: annualReturn, age: sliderResults.freedomAge })}
                  {sliderResults.freedomAge <= inputs.targetFreedomAge && <span className="ml-1 text-emerald-500 font-medium"> {t("results.sensitivity.beforeTarget")}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t("results.sensitivity.capitalAtAgeSlider", { age: inputs.targetFreedomAge, amount: formatCurrencyFull(sliderResults.plannedCapital, currency) })}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 9. Profile Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <NarrativeIcon className="w-4 h-4 text-primary" />
            {t("results.profileBadge")}
          </p>
          <Card className={`p-6 md:p-8 bg-gradient-to-br ${profileBadgeStyles[results.narrative.type].gradient}`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full ${profileBadgeStyles[results.narrative.type].bg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <NarrativeIcon className="w-12 h-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className={`font-serif text-2xl font-bold mb-1 ${narrativeColors[results.narrative.type]}`}>{t(`results.personalities.${narrativeTypeToKey[results.narrative.type]}.title`)}</h3>
                <p className="text-sm text-muted-foreground italic mb-3">{results.narrative.subtitle}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${narrativeBgColors[results.narrative.type]}`}>
                  <Sparkles className="w-3 h-3" />
                  {t("results.freedomScoreLabel", { score: results.freedomScore })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 10. Share Your Score - Icon Only */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <Card className="p-6 text-center">
            <h3 className="font-serif text-xl font-bold mb-2">{t("results.share.title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("results.share.subtitle")}</p>
            <div className="flex items-center justify-center gap-4 mb-5">
              <Button size="icon" onClick={() => handleShare("whatsapp")} className="bg-[#25D366] hover:bg-[#25D366] text-white rounded-full w-12 h-12" data-testid="button-share-whatsapp">
                <SiWhatsapp className="w-5 h-5" />
              </Button>
              <Button size="icon" onClick={() => handleShare("facebook")} className="bg-[#1877F2] hover:bg-[#1877F2] text-white rounded-full w-12 h-12" data-testid="button-share-facebook">
                <SiFacebook className="w-5 h-5" />
              </Button>
              <Button size="icon" onClick={() => handleShare("twitter")} className="bg-[#000000] hover:bg-[#000000] text-white rounded-full w-12 h-12" data-testid="button-share-twitter">
                <SiX className="w-5 h-5" />
              </Button>
              <Button size="icon" onClick={() => handleShare("linkedin")} className="bg-[#0A66C2] hover:bg-[#0A66C2] text-white rounded-full w-12 h-12" data-testid="button-share-linkedin">
                <SiLinkedin className="w-5 h-5" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShowShareCard(true)} data-testid="button-download-card">
              <Download className="w-4 h-4 mr-2" />
              {t("results.share.downloadCard")}
            </Button>
          </Card>
        </motion.div>

        {/* 10b. Save My Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.52 }}>
          <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-bold">{t("results.saveReport.title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {t("results.saveReport.description")}
            </p>
            <Button onClick={() => setShowSaveReport(true)} data-testid="button-save-report">
              <Mail className="w-4 h-4 mr-2" />
              {t("results.saveReport.emailButton")}
            </Button>
          </Card>
        </motion.div>

        {/* 11. Phase 2: Locked Risk Assessment */}
        <motion.div id="phase2-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
          <Card className="p-6 md:p-10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <img src={iconRiskDna} alt="" className="w-14 h-14" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2" data-testid="text-phase2-title">
                {t("results.phase2.title")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                {t("results.phase2.subtitle")}
              </p>
              <div className="space-y-3 text-left max-w-sm mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <img src={iconDataPrivacy} alt="" className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t("results.phase2.bulletproof")}</p>
                    <p className="text-xs text-muted-foreground">{t("results.phase2.bulletproofText")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <img src={iconRiskDna} alt="" className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t("results.phase2.riskDna")}</p>
                    <p className="text-xs text-muted-foreground">{t("results.phase2.riskDnaText")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <ChevronRight className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t("results.phase2.investmentBridge")}</p>
                    <p className="text-xs text-muted-foreground">{t("results.phase2.investmentBridgeText")}</p>
                  </div>
                </div>
              </div>
              <button className="premium-cta premium-cta-lg" onClick={() => setShowLeadModal(true)} data-testid="button-unlock-phase2">
                <Lock className="w-4 h-4" />
                {t("results.phase2.cta")}
              </button>
            </div>
          </Card>
        </motion.div>

        {/* 12. Precision Pitch + Second Opinion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <img src={iconGoal} alt="" className="w-6 h-6" />
                <h3 className="font-semibold">{t("results.precision.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {t("results.precision.text")}
              </p>
              <Button variant="outline" onClick={() => setShowLeadModal(true)} data-testid="button-precision-cta">
                {t("results.precision.cta")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <img src={iconDataPrivacy} alt="" className="w-6 h-6" />
                <h3 className="font-semibold">{t("results.secondOpinion.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {t("results.secondOpinion.text")}
              </p>
              <Button variant="outline" onClick={() => setShowLeadModal(true)} data-testid="button-second-opinion">
                {t("results.secondOpinion.cta")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </div>
        </motion.div>

        {/* 13. Bottom navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/")} data-testid="button-start-over">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("results.startOver")}
          </Button>
        </motion.div>

        <footer className="text-center py-6 mt-4 border-t">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={finksmartLogo} alt="FinkSmart" className="h-7 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {t("results.footerEngine")}
          </p>
          <p className="text-[10px] text-muted-foreground">finksmart.com</p>
          <div className="mt-3 pt-3 border-t border-border/40 max-w-xl mx-auto">
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              {t("results.footerDisclaimer")}
            </p>
          </div>
        </footer>
      </main>

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

      <Dialog open={showSaveReport} onOpenChange={(open) => { setShowSaveReport(open); if (!open) { setReportSent(false); setReportName(""); setReportEmail(""); } }}>
        <DialogContent className="max-w-md">
          <AnimatePresence mode="wait">
            {!reportSent ? (
              <motion.div key="report-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <DialogTitle className="font-serif text-xl text-center">
                    {t("results.saveReport.dialogTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {t("results.saveReport.dialogDesc")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="report-name">{t("results.saveReport.nameLabel")}</Label>
                    <Input
                      id="report-name"
                      placeholder={t("results.saveReport.namePlaceholder")}
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
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
                      data-testid="input-report-email"
                    />
                  </div>
                  <Button
                    className="w-full"
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
                  <p className="text-[10px] text-muted-foreground text-center">
                    {t("results.saveReport.privacy")}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="report-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{t("results.saveReport.successTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("results.saveReport.successDesc", { email: reportEmail })}
                </p>
                <Button variant="outline" onClick={() => setShowSaveReport(false)} data-testid="button-close-report-modal">
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
