import { useState, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import finksmartIcon from "@assets/finksmart-icon.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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
  Share2,
  Sun,
  Moon,
  Heart,
  Sparkles,
  TrendingUp,
  Target,
  Rocket,
  TreePine,
  Footprints,
  Info,
  PieChart,
  Lightbulb,
  Zap,
  Coins,
  Lock,
  Shield,
  ChevronRight,
  DollarSign,
  Gauge,
  Clock,
  ArrowUpRight,
  Download,
  MessageSquare,
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

  const profileBadgeStyles: Record<string, { bg: string; gradient: string }> = {
    critical: { bg: "bg-gradient-to-br from-orange-500 to-rose-600", gradient: "from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30" },
    moderate: { bg: "bg-gradient-to-br from-amber-500 to-orange-500", gradient: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" },
    on_track: { bg: "bg-gradient-to-br from-emerald-500 to-teal-500", gradient: "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30" },
    basically_there: { bg: "bg-gradient-to-br from-violet-500 to-blue-500", gradient: "from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30" },
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

  const yearsDifference = results.yearsGained;

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
            <img src={finksmartIcon} alt="Finksmart" className="w-6 h-6" />
            <span className="font-serif text-sm font-semibold">Freedom Path</span>
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
                <p>Your Freedom Score (0-100) measures how close you are to your financial independence goal at your target age. A score of 100 means you'll have enough capital to cover your desired income without ever touching the principal.</p>
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

        {/* 2. Target Capital */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Your Target Capital
            </p>
            <InfoTooltip>
              <p className="font-semibold mb-1">Why this amount?</p>
              <p className="mb-2">This is the total pot of money you need so that the interest it earns covers your monthly expenses&mdash;without ever touching the capital itself.</p>
              <p className="mb-2">Why not just spend the capital directly? Because you don't know how long you'll live. If you draw down the capital, you could outlive your money.</p>
              <p>By targeting this amount, your money works for you indefinitely&mdash;like a salary that never stops, paid by your own savings.</p>
            </InfoTooltip>
          </div>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              To receive <span className="font-semibold">{formatCurrencyFull(inputs.desiredMonthlyIncome, currency)}</span>/month (inflation-adjusted), you need:
            </p>
            <p className="text-3xl md:text-4xl font-bold text-center my-4" data-testid="text-required-capital">
              {formatCurrencyFull(results.requiredCapital, currency)}
            </p>
            <div className="text-xs text-muted-foreground text-center mb-6 flex items-center justify-center gap-1">
              <span>Based on a 6% safe withdrawal rate per year (adjusted for 2% annual inflation)</span>
              <InfoTooltip>
                <p className="font-semibold mb-1">What is the Safe Withdrawal Rate?</p>
                <p className="mb-2">Think of it this way: instead of spending down your savings, you build a pot big enough that you only live off the interest it generates&mdash;without ever touching the money itself.</p>
                <p className="mb-2">Why not just withdraw your spending from the capital? You could, but here's the problem: <span className="font-medium">you don't know how long you're going to live.</span> If you spend your capital, you risk running out of money.</p>
                <p>At a 6% return with 2% going to inflation, you can safely withdraw 4% each year and your money lasts forever. We use 6% as the headline rate because it includes the inflation cushion.</p>
              </InfoTooltip>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  Capital at {inputs.targetFreedomAge} (6%)
                  <InfoTooltip><p>Your projected capital at age {inputs.targetFreedomAge} with a standard 6% annual return -- a conservative diversified portfolio estimate.</p></InfoTooltip>
                </p>
                <p className="text-xl font-bold" data-testid="text-capital-standard">{formatCurrencyFull(results.plannedCapitalStandard, currency)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {results.plannedCapitalStandard >= results.requiredCapital ? "None!" : formatCurrency(results.requiredCapital - results.plannedCapitalStandard, currency)}
                </p>
              </div>
              <div className="bg-emerald-500/10 dark:bg-emerald-900/20 rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  Capital at {inputs.targetFreedomAge} (Managed 11%)
                  <InfoTooltip><p>Your projected capital with professional active management achieving 11% annual return through optimized strategies, tax efficiency, and rebalancing.</p></InfoTooltip>
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-capital-managed">{formatCurrencyFull(results.plannedCapitalManaged, currency)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {results.plannedCapitalManaged >= results.requiredCapital ? "None!" : formatCurrency(results.requiredCapital - results.plannedCapitalManaged, currency)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 3. Return Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="space-y-2">
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

        {/* 4. Capital Evolution Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Capital Evolution
          </p>
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
                  Managed (11%)
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
                    labelFormatter={(label) => `Age ${label}`}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                  />
                  <ReferenceLine x={inputs.targetFreedomAge} stroke="hsl(var(--primary))" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Target: ${inputs.targetFreedomAge}`, position: "top", fontSize: 10 }} />
                  <Area type="monotone" dataKey="requiredCapital" stroke="#f87171" strokeWidth={2} strokeDasharray="6 3" fill="none" name="Required Capital" />
                  <Area type="monotone" dataKey="managedWealth" stroke="#10b981" strokeWidth={2} fill="url(#gradManaged)" name="Managed (11%)" />
                  <Area type="monotone" dataKey="standardWealth" stroke="#60a5fa" strokeWidth={2} fill="url(#gradStandard)" name="Standard (6%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* 5. Capital Composition Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="space-y-2">
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
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={2} stroke="hsl(var(--background))">
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
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />Contributions</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />Gains</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-md bg-indigo-50 dark:bg-indigo-900/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Coins className="w-3 h-3" />Your Contributions</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrencyFull(results.capitalComposition.totalContributions, currency)}</p>
                  <p className="text-xs text-muted-foreground">{results.capitalComposition.contributionPercent}% of final capital</p>
                </div>
                <div className="rounded-md bg-violet-50 dark:bg-violet-900/20 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3" />Generated Gains</p>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{formatCurrencyFull(results.capitalComposition.generatedGains, currency)}</p>
                  <p className="text-xs text-muted-foreground">{results.capitalComposition.gainsPercent}% of final capital</p>
                </div>
                {results.capitalComposition.gainsPercent > 0 && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">The power of compound interest</p>
                      <p>{results.capitalComposition.gainsPercent}% of your capital was generated automatically. This is compound interest working for you.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 6. Key Stats Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
              <p className="text-lg font-bold" data-testid="text-monthly-savings">{formatCurrencyFull(inputs.monthlySavingsRate, currency)}</p>
            </Card>
            <Card className="p-4 text-center bg-emerald-500/5">
              <p className="text-xs text-muted-foreground mb-1">Managed Capital</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(results.plannedCapitalManaged, currency)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Standard Capital</p>
              <p className="text-lg font-bold">{formatCurrency(results.plannedCapitalStandard, currency)}</p>
            </Card>
            <Card className="p-4 text-center bg-primary/5">
              <p className="text-xs text-muted-foreground mb-1">Years Gained</p>
              <p className="text-lg font-bold text-primary" data-testid="text-years-gained">
                {yearsDifference > 0 ? `+${yearsDifference}` : yearsDifference} yrs
              </p>
              <p className="text-[10px] text-muted-foreground">with managed returns</p>
            </Card>
          </div>
        </motion.div>

        {/* 7. Solution Module */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.33 }}>
          <Card className="p-6 md:p-8">
            {results.solutionModule.hasGap ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-lg">How to Close the Gap</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  You have a gap of <span className="font-bold text-foreground">{formatCurrency(results.gapAmount, currency)}</span>. Here are three ways to bridge it:
                </p>

                <div className="flex gap-2 mb-6 flex-wrap">
                  {(["savings", "lumpsum", "efficiency"] as const).map((key) => (
                    <Button
                      key={key}
                      variant={activeSolution === key ? "default" : "outline"}
                      onClick={() => setActiveSolution(key)}
                      data-testid={`button-solution-${key}`}
                    >
                      {key === "savings" && <><DollarSign className="w-4 h-4 mr-1.5" />Save More</>}
                      {key === "lumpsum" && <><ArrowUpRight className="w-4 h-4 mr-1.5" />Lump Sum</>}
                      {key === "efficiency" && <><TrendingUp className="w-4 h-4 mr-1.5" />Smarter Returns</>}
                    </Button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeSolution} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {activeSolution === "savings" && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5" data-testid="solution-savings">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" />The Savings Lever</h4>
                        <p className="text-sm text-muted-foreground mb-3">To close this gap, you need to increase your monthly savings by:</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formatCurrencyFull(results.solutionModule.savingsLeverAmount, currency)}<span className="text-base font-normal text-muted-foreground">/month</span></p>
                        <p className="text-xs text-muted-foreground">That's an increase of {formatCurrencyFull(results.solutionModule.savingsLeverAmount, currency)} on top of your current {formatCurrencyFull(inputs.monthlySavingsRate, currency)} monthly savings.</p>
                      </div>
                    )}
                    {activeSolution === "lumpsum" && (
                      <div className="rounded-md bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-5" data-testid="solution-lumpsum">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-violet-500" />The Lump Sum Catch-up</h4>
                        <p className="text-sm text-muted-foreground mb-3">A one-time injection today would put you back on track for your target age:</p>
                        <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">{formatCurrencyFull(results.solutionModule.lumpSumAmount, currency)}<span className="text-base font-normal text-muted-foreground"> today</span></p>
                        <p className="text-xs text-muted-foreground">This could come from inheritance, property sale, bonus, or any other windfall.</p>
                      </div>
                    )}
                    {activeSolution === "efficiency" && (
                      <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5" data-testid="solution-efficiency">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />The Smart Manager</h4>
                        <p className="text-sm text-muted-foreground mb-3">By optimizing your strategy for a better return, you close the gap without saving another cent:</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{results.solutionModule.efficiencyLeverReturn}%<span className="text-base font-normal text-muted-foreground"> annual return needed</span></p>
                        <p className="text-xs text-muted-foreground">That's {(results.solutionModule.efficiencyLeverReturn - 6).toFixed(1)}% above the standard return. See the sensitivity analysis below to explore this.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">You Have a Surplus!</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  You have a surplus of <span className="font-bold text-foreground">{formatCurrencyFull(results.solutionModule.surplusAmount, currency)}</span>. Here's what this means for you:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Retire Earlier</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Age {results.solutionModule.earlyFreedomAge}</p>
                    <p className="text-xs text-muted-foreground mt-1">That's {inputs.targetFreedomAge - results.solutionModule.earlyFreedomAge} year{inputs.targetFreedomAge - results.solutionModule.earlyFreedomAge === 1 ? "" : "s"} earlier than planned!</p>
                  </div>
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />Or, Increase Your Budget</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrencyFull(results.solutionModule.increasedMonthlyBudget, currency)}/mo</p>
                    <p className="text-xs text-muted-foreground mt-1">Maintain your target age but enjoy a higher monthly income.</p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* 8. Sensitivity / Education Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">How Returns Influence Your Freedom</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              A <span className="font-semibold text-foreground">sensitivity analysis</span> showing the impact of average annual returns:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded-full bg-blue-400" /><span className="text-xs text-muted-foreground">Standard: 6%</span></div>
                <p className="text-xl font-bold">Freedom at {results.freedomAgeStandard}</p>
                <p className="text-xs text-muted-foreground">Capital: {formatCurrencyFull(results.plannedCapitalStandard, currency)}</p>
              </div>
              <div className="rounded-md bg-emerald-500/10 dark:bg-emerald-900/20 p-4">
                <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">Managed: 11%</span></div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Freedom at {results.freedomAgeManaged}</p>
                <p className="text-xs text-muted-foreground">Capital: {formatCurrencyFull(results.plannedCapitalManaged, currency)}</p>
              </div>
            </div>
            {yearsDifference > 0 && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 mb-6">
                <div className="mt-1 rounded-md bg-background/80 p-3 text-xs space-y-1.5">
                  <p className="font-medium text-foreground flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500" />Concrete example:</p>
                  <p className="text-muted-foreground">At 6%, you reach freedom at <span className="font-bold text-foreground">{results.freedomAgeStandard}</span></p>
                  <p className="text-muted-foreground">At 11% (managed), you reach it at <span className="font-bold text-foreground">{results.freedomAgeManaged}</span></p>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">That's {yearsDifference} year{yearsDifference === 1 ? "" : "s"} gained with professional management!</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium">Try it yourself -- drag the slider to explore:</p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">4%</span>
                <div className="flex-1"><Slider value={[annualReturn]} onValueChange={([val]) => setAnnualReturn(val)} min={4} max={12} step={0.5} data-testid="slider-annual-return" /></div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">12%</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary" data-testid="text-slider-return">{annualReturn}%</span>
                <p className="text-xs text-muted-foreground mt-1">Annual return assumption</p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  At {annualReturn}%, your Freedom Age is <span className="font-bold text-foreground">{sliderResults.freedomAge}</span>
                  {sliderResults.freedomAge <= inputs.targetFreedomAge && <span className="ml-1 text-emerald-500 font-medium"> -- before your target!</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Capital at {inputs.targetFreedomAge}: {formatCurrencyFull(sliderResults.plannedCapital, currency)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 9. Profile Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="space-y-2">
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
                <h3 className={`font-serif text-2xl font-bold mb-1 ${narrativeColors[results.narrative.type]}`}>{results.narrative.personality}</h3>
                <p className="text-sm text-muted-foreground italic mb-3">{results.narrative.subtitle}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${narrativeBgColors[results.narrative.type]}`}>
                  <Sparkles className="w-3 h-3" />
                  Freedom Score: {results.freedomScore}/100
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 10. Share Your Score - Icon Only */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}>
          <Card className="p-6 text-center">
            <h3 className="font-serif text-xl font-bold mb-2">Share Your Score</h3>
            <p className="text-sm text-muted-foreground mb-4">Challenge your friends and compare your journeys</p>
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
              Download My Freedom Card
            </Button>
          </Card>
        </motion.div>

        {/* 11. Phase 2: Locked Risk Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {/* Blurred Preview */}
              <div className="p-6 md:p-8 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Risk Tolerance</p>
                    <p className="text-xl font-bold text-emerald-600">Growth Hunter</p>
                    <div className="w-full h-2 bg-emerald-200 rounded-full mt-2"><div className="w-3/4 h-full bg-emerald-500 rounded-full" /></div>
                  </div>
                  <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Portfolio Match</p>
                    <p className="text-xl font-bold text-blue-600">87%</p>
                    <div className="w-full h-2 bg-blue-200 rounded-full mt-2"><div className="w-[87%] h-full bg-blue-500 rounded-full" /></div>
                  </div>
                  <div className="rounded-md bg-violet-100 dark:bg-violet-900/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Crash Resilience</p>
                    <p className="text-xl font-bold text-violet-600">Strong</p>
                    <div className="w-full h-2 bg-violet-200 rounded-full mt-2"><div className="w-4/5 h-full bg-violet-500 rounded-full" /></div>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <div className="h-32 bg-muted/80 rounded flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Your personalized investment strategy...</span>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2" data-testid="text-phase2-title">
                  Phase 2: Stress-Test Your Strategy
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  The math is done. Now, let's build the shield. Knowing your gap is step one. Protecting it is step two.
                </p>
                <div className="space-y-3 text-left max-w-sm mb-6">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Bulletproof Your Plan</p>
                      <p className="text-xs text-muted-foreground">Discover if your "dream" crashes during a market downturn.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Gauge className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Your Risk DNA</p>
                      <p className="text-xs text-muted-foreground">Learn exactly how much "heat" your portfolio can take before you lose sleep.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <ChevronRight className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">The Investment Bridge</p>
                      <p className="text-xs text-muted-foreground">Transition from a "math problem" to a real-world investment strategy.</p>
                    </div>
                  </div>
                </div>
                <Button size="lg" onClick={() => setShowLeadModal(true)} data-testid="button-unlock-phase2">
                  <Lock className="w-4 h-4 mr-2" />
                  Send My Roadmap & Unlock Risk Analysis
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 12. Precision Pitch + Second Opinion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Make It 100% Precise</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                This is the big picture. To make this 100% precise, we can factor in your specific life events -- weddings, inheritance, property sales -- and real spending habits. Your life isn't a straight line; your plan shouldn't be either.
              </p>
              <Button variant="outline" onClick={() => setShowLeadModal(true)} data-testid="button-precision-cta">
                Get My Personalized Blueprint
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold">Already Have Investments?</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                We'll stress-test your current portfolio for free to see if your actual returns match your Freedom Goal. Get a professional second opinion at no cost.
              </p>
              <Button variant="outline" onClick={() => setShowLeadModal(true)} data-testid="button-second-opinion">
                Get My Free Portfolio Check
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </div>
        </motion.div>

        {/* 13. Bottom navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/")} data-testid="button-start-over">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </motion.div>

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Freedom Path: Pro-Investing Decoded &middot; FINSIM v5 &middot; 2% inflation buffer &middot; 6% Safe Withdrawal Rate &middot; Not financial advice
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
