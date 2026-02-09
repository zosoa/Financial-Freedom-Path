import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Rocket,
  TreePine,
  Footprints,
  Users,
  Info,
  PieChart,
  Lightbulb,
  Zap,
  Coins,
} from "lucide-react";
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
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help inline-flex ml-1">
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Results() {
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
        annualReturn: 6,
        requiredCapital: results.requiredCapital,
        plannedCapital: results.plannedCapitalStandard,
        gapPercent: results.gapPercent,
        freedomAge: results.freedomAgeStandard,
        freedomScore: results.freedomScore,
        referralSource: referralSource || null,
      });
      const data = await res.json();
      setCalculationId(data.id);
      setHasSaved(true);
    } catch (e) {
      // silently fail
    }
  }, [hasSaved, inputs, results, country, currency, referralSource]);

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

  const profileBadgeStyles: Record<string, { bg: string; border: string; gradient: string }> = {
    critical: { bg: "bg-gradient-to-br from-orange-500 to-rose-600", border: "border-orange-400/50", gradient: "from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30" },
    moderate: { bg: "bg-gradient-to-br from-amber-500 to-orange-500", border: "border-amber-400/50", gradient: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" },
    on_track: { bg: "bg-gradient-to-br from-emerald-500 to-teal-500", border: "border-emerald-400/50", gradient: "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30" },
    basically_there: { bg: "bg-gradient-to-br from-violet-500 to-blue-500", border: "border-violet-400/50", gradient: "from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30" },
  };

  const profileBadgeDescriptions: Record<string, string> = {
    critical: "You've just taken the most important step -- knowing where you stand. Most people never even get here. Your journey has officially begun, and with the right moves, you can dramatically reshape your trajectory.",
    moderate: "You're building something real. Your foundation is solid, and the path to freedom is clear. With some strategic tweaks to your savings or returns, you can shave years off your timeline. The compound effect is on your side.",
    on_track: "You're cutting through the jungle of financial complexity with confidence. Your numbers show discipline and vision. A few smart optimizations could launch you even faster toward freedom. Keep blazing!",
    basically_there: "You've achieved what most only dream about -- your financial trajectory puts freedom within reach right on schedule (or ahead!). Your discipline and planning have paid off brilliantly. Time to think about what freedom means to you.",
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://thefreedompath.com";
  const shareText = `I just discovered my Freedom Score: ${results.freedomScore}/100! I could reach financial freedom by age ${results.freedomAgeStandard}. Can you beat my score? Try it free:`;

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

  const yearsDifference = results.freedomAgeStandard - results.freedomAgeBoosted;

  const pieData = [
    { name: "Your Contributions", value: results.capitalComposition.totalContributions },
    { name: "Generated Gains", value: results.capitalComposition.generatedGains },
  ];
  const PIE_COLORS = ["#6366f1", "#a78bfa"];

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
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 ${profileBadgeStyles[results.narrative.type].bg} text-white`}>
                <NarrativeIcon className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div className="flex-1">
                <h1 className={`font-serif text-2xl md:text-3xl font-bold mb-1 ${narrativeColors[results.narrative.type]}`} data-testid="text-narrative-headline">
                  {results.narrative.headline}
                </h1>
                <p className="text-sm text-muted-foreground italic mb-2">{results.narrative.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-narrative-message">
                  {profileBadgeDescriptions[results.narrative.type]}
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
                  <p className="text-[10px] text-muted-foreground leading-none">score</p>
                </div>
              </motion.div>
              <InfoTooltip>
                <p className="font-semibold mb-1">How is the Freedom Score calculated?</p>
                <p>Your Freedom Score (0-100) measures how close you are to your financial independence goal at your target age. A score of 100 means you'll have enough capital to cover your desired income without ever touching the principal. The higher the score, the closer you are to full financial freedom.</p>
              </InfoTooltip>
            </div>

            <div className="bg-background/60 rounded-md p-4">
              <p className="text-sm" data-testid="text-trajectory-analysis">
                At age <span className="font-bold">{inputs.targetFreedomAge}</span>, you will have accumulated{" "}
                <span className="font-bold text-primary">{formatCurrencyFull(results.plannedCapitalStandard, currency)}</span>{" "}
                {results.plannedCapitalStandard < results.requiredCapital ? (
                  <>instead of the <span className="font-bold">{formatCurrencyFull(results.requiredCapital, currency)}</span> needed.</>
                ) : (
                  <>which exceeds the <span className="font-bold">{formatCurrencyFull(results.requiredCapital, currency)}</span> needed!</>
                )}
              </p>
              {results.freedomAgeStandard > inputs.targetFreedomAge && (
                <p className="text-sm mt-1 text-muted-foreground">
                  Gap: <span className="font-semibold">{formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}</span> &middot; Target reached at age{" "}
                  <span className="font-semibold">{results.freedomAgeStandard}</span>{" "}
                  ({results.freedomAgeStandard - inputs.targetFreedomAge} year{results.freedomAgeStandard - inputs.targetFreedomAge === 1 ? "" : "s"} later than planned)
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-1.5">
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Your Target Capital
            </p>
            <InfoTooltip>
              <p className="font-semibold mb-1">What is Target Capital?</p>
              <p>This is the amount of money you need so that the interest alone covers your monthly expenses -- without ever touching the capital itself. Why not just withdraw from the capital? Because you don't know how long you'll live, and running out of money is the one risk you want to eliminate. With this approach, your money works for you indefinitely.</p>
            </InfoTooltip>
          </div>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              To receive <span className="font-semibold">{formatCurrencyFull(inputs.desiredMonthlyIncome, currency)}</span>/month (inflation-adjusted), you need to build a capital of:
            </p>
            <p className="text-3xl md:text-4xl font-bold text-center my-4" data-testid="text-required-capital">
              {formatCurrencyFull(results.requiredCapital, currency)}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-6">
              Based on a 6% safe withdrawal rate per year (adjusted for 2% annual inflation)
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  Capital at {inputs.targetFreedomAge} (6%)
                  <InfoTooltip>
                    <p>This is your projected capital at age {inputs.targetFreedomAge} with a standard 6% annual return -- a conservative estimate typical of a diversified portfolio without active management.</p>
                  </InfoTooltip>
                </p>
                <p className="text-xl font-bold" data-testid="text-capital-standard">
                  {formatCurrencyFull(results.plannedCapitalStandard, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {results.plannedCapitalStandard >= results.requiredCapital ? "None!" : formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}
                </p>
              </div>
              <div className="bg-emerald-500/10 dark:bg-emerald-900/20 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  Capital at {inputs.targetFreedomAge} (11%)
                  <InfoTooltip>
                    <p>This is your projected capital with active management achieving 11% annual return. This is what happens when a professional optimizes your portfolio with alternative strategies, tax efficiency, and rebalancing.</p>
                  </InfoTooltip>
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-capital-boosted">
                  {formatCurrencyFull(results.plannedCapitalBoosted, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {results.plannedCapitalBoosted >= results.requiredCapital ? "None!" : formatCurrency(results.requiredCapital - results.plannedCapitalBoosted, currency)}
                </p>
              </div>
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
            <TrendingUp className="w-4 h-4 text-primary" />
            Return Comparison
          </p>
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-return-comparison">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Return</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Capital at {inputs.targetFreedomAge}</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Freedom Age</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">vs Target</th>
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
          transition={{ duration: 0.6, delay: 0.2 }}
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
                  <RechartsTooltip
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
          transition={{ duration: 0.6, delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Composition of Your Capital (at 6%)
          </p>
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital</p>
                      <p className="text-lg font-bold">{formatCurrency(results.capitalComposition.totalCapital, currency)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
                    Your Contributions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
                    Generated Gains
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-md bg-indigo-50 dark:bg-indigo-900/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    Your Contributions
                  </p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrencyFull(results.capitalComposition.totalContributions, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">{results.capitalComposition.contributionPercent}% of final capital</p>
                </div>
                <div className="rounded-md bg-violet-50 dark:bg-violet-900/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Generated Gains
                  </p>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrencyFull(results.capitalComposition.generatedGains, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">{results.capitalComposition.gainsPercent}% of final capital</p>
                </div>

                {results.capitalComposition.gainsPercent > 0 && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">The power of compound interest</p>
                      <p>
                        The gains generated represent <span className="font-bold text-foreground">{formatCurrencyFull(results.capitalComposition.generatedGains, currency)}</span>, 
                        or <span className="font-bold text-foreground">{results.capitalComposition.gainsPercent}%</span> of your final capital. 
                        This is the magic of compound interest working for you!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-md bg-muted/50 p-4 text-xs text-muted-foreground">
              This chart shows the composition of your final capital at the moment of your financial freedom. 
              Thanks to consistent saving and the effect of compound returns, you will have generated a capital of {formatCurrencyFull(results.capitalComposition.totalCapital, currency)}.
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
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
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">How Returns Influence Your Freedom</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Here is a <span className="font-semibold text-foreground">sensitivity analysis</span> that shows the impact of average annual returns on your trajectory:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-xs text-muted-foreground">Standard return: 6%</span>
                </div>
                <p className="text-xl font-bold">Freedom at {results.freedomAgeStandard}</p>
                <p className="text-xs text-muted-foreground">Capital: {formatCurrencyFull(results.plannedCapitalStandard, currency)}</p>
              </div>
              <div className="rounded-md bg-emerald-500/10 dark:bg-emerald-900/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Boosted return: 11%</span>
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Freedom at {results.freedomAgeBoosted}</p>
                <p className="text-xs text-muted-foreground">Capital: {formatCurrencyFull(results.plannedCapitalBoosted, currency)}</p>
              </div>
            </div>

            {yearsDifference > 0 && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Each 1% of additional return can make you gain <span className="font-bold text-foreground">several years</span> towards your objective
                </p>
                <div className="mt-3 rounded-md bg-background/80 p-3 text-xs space-y-1.5">
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Concrete example:
                  </p>
                  <p className="text-muted-foreground">At 6%, you reach your objective at <span className="font-bold text-foreground">{results.freedomAgeStandard}</span></p>
                  <p className="text-muted-foreground">At 11% (boosted return), you reach it at <span className="font-bold text-foreground">{results.freedomAgeBoosted}</span></p>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                    That's {yearsDifference} year{yearsDifference === 1 ? "" : "s"} gained with 5% additional return!
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium">Try it yourself -- drag the slider to explore:</p>
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
                  <span className="font-bold text-foreground">{sliderResults.freedomAge}</span>
                  {sliderResults.freedomAge <= inputs.targetFreedomAge && (
                    <span className="ml-1 text-emerald-500 font-medium"> -- before your target!</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Capital at {inputs.targetFreedomAge}: {formatCurrencyFull(sliderResults.plannedCapital, currency)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <NarrativeIcon className="w-4 h-4 text-primary" />
            Your Profile Badge
          </p>
          <Card className={`p-6 md:p-8 bg-gradient-to-br ${profileBadgeStyles[results.narrative.type].gradient}`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full ${profileBadgeStyles[results.narrative.type].bg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <NarrativeIcon className="w-12 h-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className={`font-serif text-2xl font-bold mb-1 ${narrativeColors[results.narrative.type]}`}>
                  {results.narrative.personality}
                </h3>
                <p className="text-sm text-muted-foreground italic mb-3">{results.narrative.subtitle}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${narrativeBgColors[results.narrative.type]}`}>
                  <Sparkles className="w-3 h-3" />
                  Freedom Score: {results.freedomScore}/100
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
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
          transition={{ duration: 0.6, delay: 0.5 }}
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
          transition={{ duration: 0.6, delay: 0.55 }}
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
    </div>
  );
}
