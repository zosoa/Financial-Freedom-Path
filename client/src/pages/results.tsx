import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Compass,
  Share2,
  MessageCircle,
  Sun,
  Moon,
  Wind,
  Heart,
  Sparkles,
  TrendingUp,
  Target,
  Trophy,
  Rocket,
  TreePine,
  Footprints,
  Award,
  Lock,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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

export default function Results() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const country = params.get("country") || "United States";
  const currency = params.get("currency") || "USD";
  const referralSource = params.get("ref") || "";

  const [annualReturn, setAnnualReturn] = useState(
    parseFloat(params.get("annualReturn") || "7")
  );
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  const inputs: CalculationInputs = {
    age: parseInt(params.get("age") || "30"),
    monthlyIncome: parseFloat(params.get("monthlyIncome") || "5000"),
    desiredMonthlyIncome: parseFloat(params.get("desiredMonthlyIncome") || "3000"),
    currentSavings: parseFloat(params.get("currentSavings") || "0"),
    monthlySavingsRate: parseFloat(params.get("monthlySavingsRate") || "500"),
    targetFreedomAge: parseInt(params.get("targetFreedomAge") || "55"),
    annualReturn,
    currency,
  };

  const results = calculateFreedom(inputs);
  const currencyInfo = SUPPORTED_CURRENCIES[currency];

  const saveCalculation = useCallback(async () => {
    if (hasSaved) return;
    try {
      const res = await apiRequest("POST", "/api/calculations", {
        country,
        currency,
        age: inputs.age,
        monthlyIncome: inputs.monthlyIncome,
        desiredMonthlyIncome: inputs.desiredMonthlyIncome,
        currentSavings: inputs.currentSavings,
        monthlySavingsRate: inputs.monthlySavingsRate,
        targetFreedomAge: inputs.targetFreedomAge,
        expectedLumpSum: 0,
        annualReturn,
        requiredCapital: results.requiredCapital,
        plannedCapital: results.plannedCapital,
        gapPercent: results.gapPercent,
        freedomAge: results.freedomAge,
        freedomScore: results.freedomScore,
        referralSource: referralSource || null,
      });
      const data = await res.json();
      setCalculationId(data.id);
      setHasSaved(true);
    } catch (e) {
      // silently fail
    }
  }, [hasSaved, inputs, results, country, currency, annualReturn, referralSource]);

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

  const unlockedBadges = results.badges.filter((b) => b.unlocked);
  const lockedBadges = results.badges.filter((b) => !b.unlocked);
  const badgeProgress = Math.round((unlockedBadges.length / results.badges.length) * 100);

  const tierColors: Record<string, string> = {
    platinum: "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300",
    gold: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300",
    silver: "bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300",
    bronze: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300",
    locked: "bg-muted/50 border-muted text-muted-foreground opacity-50",
  };

  const tierIcons: Record<string, typeof Trophy> = {
    platinum: Sparkles,
    gold: Trophy,
    silver: Award,
    bronze: Award,
    locked: Lock,
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://thefreedompath.com";
  const shareText = `I just discovered my Freedom Score: ${results.freedomScore}/100! I could reach financial freedom by age ${results.freedomAge}. Can you beat my score? Try it free:`;

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

  const formatChartValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm font-semibold">The Freedom Path</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle-results">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className={`p-6 md:p-8 border ${narrativeBgColors[results.narrative.type]}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`mt-0.5 ${narrativeColors[results.narrative.type]}`}>
                <NarrativeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className={`font-serif text-2xl md:text-3xl font-bold mb-1 ${narrativeColors[results.narrative.type]}`} data-testid="text-narrative-headline">
                  {results.narrative.headline}
                </h1>
                <p className="text-sm text-muted-foreground italic">{results.narrative.subtitle}</p>
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
                  <p className="text-[10px] text-muted-foreground leading-none">score</p>
                </div>
              </motion.div>
            </div>

            <div className="bg-background/60 rounded-md p-4 mb-4">
              <p className="text-sm" data-testid="text-trajectory-analysis">
                At age <span className="font-bold">{inputs.targetFreedomAge}</span>, you will have accumulated{" "}
                <span className="font-bold text-primary">{formatCurrencyFull(results.plannedCapital, currency)}</span>{" "}
                {results.gapAmount > 0 ? (
                  <>instead of the <span className="font-bold">{formatCurrencyFull(results.requiredCapital, currency)}</span> needed.</>
                ) : (
                  <>which exceeds the <span className="font-bold">{formatCurrencyFull(results.requiredCapital, currency)}</span> needed!</>
                )}
              </p>
              {results.timeDifference > 0 && (
                <p className="text-sm mt-1 text-muted-foreground">
                  Gap: <span className="font-semibold">{formatCurrency(results.gapAmount, currency)}</span> &middot; Target reached at age{" "}
                  <span className="font-semibold">{results.freedomAge}</span>{" "}
                  ({results.timeDifference} year{results.timeDifference === 1 ? "" : "s"} later than planned)
                </p>
              )}
            </div>

            <div className={`rounded-md p-3 ${results.gapPercent <= 20 ? "bg-emerald-500/10" : "bg-primary/5"}`}>
              <p className="text-sm">
                {results.gapPercent <= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Excellent news! You're on track to reach your target before age {inputs.targetFreedomAge}! Our recommendations below can help you optimize even further.
                  </span>
                ) : results.gapPercent <= 20 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Great news! Even if the objective isn't reached at {inputs.targetFreedomAge}, you're on an excellent trajectory! Our recommendations below can help you close the gap.
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium">
                    The journey matters more than the speed. With the right adjustments, you can significantly accelerate your path to freedom. Explore the scenarios below.
                  </span>
                )}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Your Target Capital
          </p>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              To receive <span className="font-semibold">{formatCurrencyFull(inputs.desiredMonthlyIncome, currency)}</span>/month, you need to build a capital of:
            </p>
            <p className="text-3xl md:text-4xl font-bold text-center my-4" data-testid="text-required-capital">
              {formatCurrencyFull(results.requiredCapital, currency)}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-6">
              Based on a 6% withdrawal rate per year (adjusted for inflation)
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 dark:bg-emerald-900/20 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Capital at {inputs.targetFreedomAge} (11%)</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-capital-boosted">
                  {formatCurrencyFull(results.plannedCapitalBoosted, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {results.plannedCapitalBoosted >= results.requiredCapital ? "None!" : formatCurrency(results.requiredCapital - results.plannedCapitalBoosted, currency)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Capital at {inputs.targetFreedomAge} (6%)</p>
                <p className="text-xl font-bold" data-testid="text-capital-standard">
                  {formatCurrencyFull(results.plannedCapitalStandard, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {results.plannedCapitalStandard >= results.requiredCapital ? "None!" : formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Return Comparison
          </p>
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-return-comparison">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Return</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Capital at {inputs.targetFreedomAge}</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Age Reached</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Time Diff</th>
                </tr>
              </thead>
              <tbody>
                {results.returnComparisons.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${row.rate === 6 ? "bg-muted-foreground" : "bg-emerald-500"}`} />
                      {row.label}
                    </td>
                    <td className="py-3 text-right font-semibold">{formatCurrencyFull(row.capitalAtTarget, currency)}</td>
                    <td className="py-3 text-right">{row.ageReached} yrs</td>
                    <td className="py-3 text-right">
                      {row.timeDifference <= 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {Math.abs(row.timeDifference)} yrs early
                        </span>
                      ) : (
                        <span className="text-muted-foreground">+{row.timeDifference} yrs</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary" />
            Capital Evolution
          </p>
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
                  Boosted (11%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-blue-400" />
                  Standard (6%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-red-400" />
                  Required Capital
                </span>
              </div>
            </div>
            <div className="h-72 md:h-80" data-testid="chart-capital-evolution">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.wealthCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBoosted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradStandard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatChartValue}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrencyFull(value, currency), ""]}
                    labelFormatter={(label) => `Age ${label}`}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      fontSize: "12px",
                    }}
                  />
                  <ReferenceLine
                    x={inputs.targetFreedomAge}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: `Target: ${inputs.targetFreedomAge}`, position: "top", fontSize: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requiredCapital"
                    stroke="#f87171"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="none"
                    name="Required Capital"
                  />
                  <Area
                    type="monotone"
                    dataKey="boostedWealth"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gradBoosted)"
                    name="Boosted (11%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="standardWealth"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fill="url(#gradStandard)"
                    name="Standard (6%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
              <p className="text-lg font-bold" data-testid="text-monthly-savings">
                {formatCurrencyFull(inputs.monthlySavingsRate, currency)}
              </p>
            </Card>
            <Card className="p-4 text-center bg-emerald-500/5">
              <p className="text-xs text-muted-foreground mb-1">Boosted Capital</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(results.plannedCapitalBoosted, currency)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Standard Capital</p>
              <p className="text-lg font-bold">
                {formatCurrency(results.plannedCapitalStandard, currency)}
              </p>
            </Card>
            <Card className="p-4 text-center bg-primary/5">
              <p className="text-xs text-muted-foreground mb-1">Additional Gain</p>
              <p className="text-lg font-bold text-primary" data-testid="text-additional-gain">
                +{formatCurrency(results.additionalGain, currency)}
              </p>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Market Wind Sensitivity</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Drag the slider to see how different market conditions change your Freedom Age.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Conservative 4%</span>
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
                <span className="text-sm text-muted-foreground whitespace-nowrap">Optimistic 12%</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary" data-testid="text-slider-return">
                  {annualReturn}%
                </span>
                <p className="text-xs text-muted-foreground mt-1">Annual return assumption</p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  At {annualReturn}% annual returns, your Freedom Age is{" "}
                  <span className="font-bold text-foreground">{results.freedomAge}</span>
                  {results.freedomAge <= inputs.targetFreedomAge && (
                    <span className="ml-1 text-emerald-500 font-medium"> -- before your target!</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <NarrativeIcon className="w-4 h-4 text-primary" />
            Your Personality
          </p>
          <Card className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${narrativeBgColors[results.narrative.type]}`}>
                <NarrativeIcon className={`w-8 h-8 ${narrativeColors[results.narrative.type]}`} />
              </div>
              <div>
                <h3 className={`font-serif text-xl font-bold ${narrativeColors[results.narrative.type]}`}>
                  {results.narrative.personality}
                </h3>
                <p className="text-sm text-muted-foreground italic mb-2">{results.narrative.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-narrative-message">
                  {results.narrative.message}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Your Achievement Badges
          </p>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Unlock badges by reaching your financial goals
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{unlockedBadges.length}</p>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{lockedBadges.length}</p>
                <p className="text-xs text-muted-foreground">To unlock</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{badgeProgress}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${badgeProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" data-testid="badges-grid">
              {results.badges.map((badge) => {
                const TierIcon = tierIcons[badge.tier];
                return (
                  <div
                    key={badge.id}
                    className={`rounded-md border p-3 text-center ${tierColors[badge.tier]}`}
                    data-testid={`badge-${badge.id}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-background/60 flex items-center justify-center mx-auto mb-2">
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold leading-tight mb-0.5">{badge.name}</p>
                    <p className="text-[10px] capitalize">{badge.tier}</p>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              You're doing well! {lockedBadges.length} more badge{lockedBadges.length === 1 ? "" : "s"} to unlock.
              Current level: <span className="font-semibold text-primary">{badgeProgress}% Financial Expert</span>
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <Card className="p-6 text-center">
            <h3 className="font-serif text-xl font-bold mb-2">Share Your Score!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Inspire your network and see who else is aiming for financial independence
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
              <Button
                onClick={() => handleShare("whatsapp")}
                className="bg-[#25D366] hover:bg-[#25D366] text-white"
                data-testid="button-share-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                className="bg-[#1877F2] hover:bg-[#1877F2] text-white"
                data-testid="button-share-facebook"
              >
                <SiFacebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => handleShare("twitter")}
                className="bg-[#000000] hover:bg-[#000000] text-white"
                data-testid="button-share-twitter"
              >
                <SiX className="w-4 h-4 mr-2" />
                X (Twitter)
              </Button>
              <Button
                onClick={() => handleShare("linkedin")}
                className="bg-[#0A66C2] hover:bg-[#0A66C2] text-white"
                data-testid="button-share-linkedin"
              >
                <SiLinkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowShareCard(true)}
              data-testid="button-download-card"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Download My Freedom Card
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-6 md:p-8 bg-primary/5">
            <div className="text-center mb-4">
              <h3 className="font-serif text-xl font-bold mb-1">Enjoyed this experience?</h3>
              <p className="text-sm text-muted-foreground">
                Share your score with friends and compare your journeys!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => setShowLeadModal(true)}
                data-testid="button-talk-expert"
              >
                <Users className="w-4 h-4 mr-2" />
                Get contacted by an expert
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare("whatsapp")}
                data-testid="button-join-community"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Join our community
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            data-testid="button-start-over"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </motion.div>

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Powered by FINSIM v5 &middot; 2% inflation buffer &middot; 6% Safe Withdrawal Rate &middot; Not financial advice
          </p>
        </div>
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
      />

      {showShareCard && (
        <FreedomScoreCard
          open={showShareCard}
          onClose={() => setShowShareCard(false)}
          freedomScore={results.freedomScore}
          freedomAge={results.freedomAge}
          targetAge={inputs.targetFreedomAge}
          gapPercent={results.gapPercent}
          country={country}
          currency={currency}
          narrativeType={results.narrative.type}
          personality={results.narrative.personality}
          subtitle={results.narrative.subtitle}
          monthlySavings={inputs.monthlySavingsRate}
          badges={unlockedBadges.length}
          totalBadges={results.badges.length}
        />
      )}
    </div>
  );
}
