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
  Mountain,
  Wind,
  Heart,
  Sparkles,
  TrendingUp,
  Target,
  Download,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { calculateFreedom, formatCurrency, formatCurrencyFull, type CalculationInputs } from "@/lib/calculations";
import { SUPPORTED_CURRENCIES } from "@shared/schema";
import { LeadCaptureModal } from "@/components/lead-capture-modal";
import { FreedomScoreCard } from "@/components/freedom-score-card";
import { MountainPathVisual } from "@/components/mountain-path-visual";
import { apiRequest } from "@/lib/queryClient";

export default function Results() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const shareCardRef = useRef<HTMLDivElement>(null);

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
    expectedLumpSum: parseFloat(params.get("expectedLumpSum") || "0"),
    lumpSumAge: parseInt(params.get("lumpSumAge") || params.get("age") || "30"),
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
        expectedLumpSum: inputs.expectedLumpSum,
        lumpSumAge: inputs.lumpSumAge,
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

  const narrativeColors = {
    critical: "text-red-500 dark:text-red-400",
    moderate: "text-amber-500 dark:text-amber-400",
    on_track: "text-emerald-500 dark:text-emerald-400",
    basically_there: "text-emerald-500 dark:text-emerald-400",
  };

  const narrativeIcons = {
    critical: Heart,
    moderate: TrendingUp,
    on_track: Target,
    basically_there: Sparkles,
  };

  const NarrativeIcon = narrativeIcons[results.narrative.type];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
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

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-3xl font-bold text-primary" data-testid="text-freedom-score">
                {results.freedomScore}
              </span>
            </motion.div>
            <h2 className="text-sm font-medium text-muted-foreground tracking-wide uppercase mb-1">
              Your Freedom Score
            </h2>
            <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-freedom-age">
              Freedom at age{" "}
              <span className="text-primary">{results.freedomAge}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {results.yearsToFreedom} years from now &middot; {country}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <MountainPathVisual
            freedomScore={results.freedomScore}
            freedomAge={results.freedomAge}
            currentAge={inputs.age}
            narrativeType={results.narrative.type}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className={`mt-0.5 ${narrativeColors[results.narrative.type]}`}>
                <NarrativeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-serif text-xl font-bold ${narrativeColors[results.narrative.type]}`} data-testid="text-narrative-headline">
                  {results.narrative.headline}
                </h3>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed ml-8" data-testid="text-narrative-message">
              {results.narrative.message}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">Required Capital</p>
              <p className="text-xl font-bold" data-testid="text-required-capital">
                {formatCurrency(results.requiredCapital, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {formatCurrencyFull(results.inflationAdjustedMonthlyIncome, currency)}/mo at retirement (inflation-adjusted)
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">Planned Capital</p>
              <p className="text-xl font-bold" data-testid="text-planned-capital">
                {formatCurrency(results.plannedCapital, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your savings + returns at {annualReturn}% annual growth
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">The Gap</p>
              <p className="text-xl font-bold" data-testid="text-gap">
                {results.gapPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {results.gapAmount > 0
                  ? `${formatCurrency(results.gapAmount, currency)} still needed`
                  : "You're fully covered!"}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">Monthly Income at Retirement</p>
              <p className="text-xl font-bold" data-testid="text-inflation-adjusted">
                {formatCurrencyFull(results.inflationAdjustedMonthlyIncome, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Today's {formatCurrencyFull(inputs.desiredMonthlyIncome, currency)} adjusted for 2% inflation
              </p>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Market Wind Sensitivity</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Drag the slider to see how different market conditions change your Freedom Age. Even 1% makes a big difference over time.
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
                <p className="text-xs text-muted-foreground mt-1">
                  Annual return assumption
                </p>
              </div>
              <div className="bg-muted/50 rounded-md p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  At {annualReturn}% annual returns, your Freedom Age is{" "}
                  <span className="font-bold text-foreground">{results.freedomAge}</span>
                  {results.freedomAge <= inputs.age + 5 && (
                    <span className="ml-1 text-emerald-500">&mdash; incredibly close!</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-6 md:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2" data-testid="text-cta-expert">
              Not sure what these numbers mean?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect with an independent expert who will walk you through your results&mdash;for free. No products, no pressure, just clarity from UHNW-trained professionals.
            </p>
            <Button
              size="lg"
              className="text-base"
              onClick={() => setShowLeadModal(true)}
              data-testid="button-talk-expert"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Explain my results for free
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            variant="outline"
            onClick={() => setShowShareCard(true)}
            data-testid="button-share-score"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share My Freedom Score
          </Button>
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
          gapPercent={results.gapPercent}
          country={country}
          currency={currency}
          narrativeType={results.narrative.type}
          narrativeHeadline={results.narrative.headline}
        />
      )}
    </div>
  );
}
