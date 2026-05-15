import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sun, Moon, Sparkles, Check } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import {
  RISK_QUESTIONS,
  TOTAL_QUESTIONS,
  calculateScore,
  scoreToClimate,
  CLIMATES,
  type QuestionKey,
} from "@/lib/risk-scoring";
import {
  IconShield,
  IconPiggy,
  IconMagnifier,
  IconCompass,
  IconDiploma,
  IconLightbulb,
  IconSummit,
} from "@/components/icons";
import { calculateFreedom, formatCurrency } from "@/lib/calculations";
import { SUPPORTED_CURRENCIES } from "@shared/schema";

/** Per-question illustration (we reuse our icon set). */
const QUESTION_ICONS: Record<QuestionKey, (p: { size?: number }) => JSX.Element> = {
  incomeStability: IconShield,      // stability of income → shield
  emergencyCushion: IconPiggy,       // savings cushion → piggy
  lossReaction: IconMagnifier,       // loss scenario → looking at -30%
  pathPreference: IconCompass,       // 4 paths to choose → compass
  marketExperience: IconSummit,      // veteran climber → summit
  literacyTest: IconDiploma,         // financial literacy → diploma
  emotionalDriver: IconLightbulb,    // motivation → lightbulb
};

/* Loading messages for the final reveal transition */
const getLoadingMessages = (t: (k: string) => string) => [
  t("riskDna.loading.msg1"),
  t("riskDna.loading.msg2"),
  t("riskDna.loading.msg3"),
  t("riskDna.loading.msg4"),
  t("riskDna.loading.msg5"),
];

export default function RiskDNA() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const { theme, toggleTheme } = useTheme();

  // Phase 1 inputs (passed via URL from /results "Decode my Risk DNA")
  const country = params.get("country") || "Mauritius";
  const currency = params.get("currency") || "MUR";
  const ageStr = params.get("age") || "30";
  const monthlyIncomeStr = params.get("monthlyIncome") || "5000";
  const desiredIncomeStr = params.get("desiredMonthlyIncome") || "3000";
  const currentSavingsStr = params.get("currentSavings") || "0";
  const monthlySavingsRateStr = params.get("monthlySavingsRate") || "500";
  const targetFreedomAgeStr = params.get("targetFreedomAge") || "55";
  const referralSource = params.get("ref") || "";

  const phase1Inputs = {
    age: parseInt(ageStr),
    monthlyIncome: parseFloat(monthlyIncomeStr),
    desiredMonthlyIncome: parseFloat(desiredIncomeStr),
    currentSavings: parseFloat(currentSavingsStr),
    monthlySavingsRate: parseFloat(monthlySavingsRateStr),
    targetFreedomAge: parseInt(targetFreedomAgeStr),
    annualReturn: 6,
    currency,
  };

  const symbol = SUPPORTED_CURRENCIES[currency]?.symbol || currency;

  /** Compute the freedom age the user would reach at each climate's expected return. */
  const ageAtReturn = (rate: number) => {
    return calculateFreedom({ ...phase1Inputs, annualReturn: rate }).freedomAge;
  };
  const ageSmooth = ageAtReturn(4);     // Q4-A: smooth & late
  const ageModest = ageAtReturn(6);     // Q4-B: ~6%
  const ageGrowth = ageAtReturn(8.5);   // Q4-C: tropical
  const ageAggressive = ageAtReturn(10); // Q4-D: volcan

  /** Concrete amount used in Q3 ("imagine 100K dropping to 70K"). */
  const concreteLossAmount = (() => {
    const baseAmount = Math.max(phase1Inputs.currentSavings, phase1Inputs.monthlyIncome * 24);
    const rounded = Math.max(50000, Math.round(baseAmount / 50000) * 50000);
    return rounded;
  })();
  const lossAfter = Math.round(concreteLossAmount * 0.7);

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({});
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessageIdx, setTransitionMessageIdx] = useState(0);

  const question = RISK_QUESTIONS[currentStep];
  const QuestionIcon = QUESTION_ICONS[question.key];
  const selectedChoice = answers[question.key];

  // Final transition handling (shows for ~3.5s then redirects)
  const loadingMessages = getLoadingMessages(t);

  useEffect(() => {
    if (!showTransition) return;
    const interval = setInterval(() => {
      setTransitionMessageIdx((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          // Compute climate, navigate to /results with climate appended
          const score = calculateScore(answers);
          const climate = scoreToClimate(score);
          const out = new URLSearchParams({
            country,
            currency,
            age: ageStr,
            monthlyIncome: monthlyIncomeStr,
            desiredMonthlyIncome: desiredIncomeStr,
            currentSavings: currentSavingsStr,
            monthlySavingsRate: monthlySavingsRateStr,
            targetFreedomAge: targetFreedomAgeStr,
            annualReturn: "7",
            climate,
            dnaScore: String(score),
            ...(referralSource ? { ref: referralSource } : {}),
          });
          navigate(`/results?${out.toString()}`);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [showTransition, answers, navigate, ageStr, monthlyIncomeStr, desiredIncomeStr, currentSavingsStr, monthlySavingsRateStr, targetFreedomAgeStr, country, currency, referralSource, loadingMessages.length]);

  const handlePick = (choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [question.key]: choiceId }));
  };

  const handleNext = () => {
    if (!selectedChoice) return;
    if (currentStep < TOTAL_QUESTIONS - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      setShowTransition(true);
      setTransitionMessageIdx(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    } else {
      const params = new URLSearchParams(searchString);
      navigate(`/results?${params.toString()}`);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  /* ───────── Build choice labels for the current question ───────── */
  const buildChoiceContent = (choiceId: string): { label: string; helper?: string } => {
    // Most labels come from i18n directly
    if (question.key === "lossReaction") {
      // Q3: choices are static labels; helper line shows the concrete amounts
      return {
        label: t(`riskDna.q.lossReaction.choices.${choiceId}`),
      };
    }
    if (question.key === "pathPreference") {
      // Q4: each choice surfaces a real computed age + downside
      // When freedom isn't reachable in our search range (returns 100),
      // we substitute a soft "very far" label so users still see the diff.
      const fmtAge = (a: number) => (a >= 95 ? t("riskDna.q.pathPreference.unreachable") : `${a}`);
      const map: Record<string, { age: string; isNoneDrawdown: boolean; drawdown: string }> = {
        smooth: { age: fmtAge(ageSmooth), isNoneDrawdown: true, drawdown: "" },
        modest: { age: fmtAge(ageModest), isNoneDrawdown: false, drawdown: "−10%" },
        growth: { age: fmtAge(ageGrowth), isNoneDrawdown: false, drawdown: "−25%" },
        aggressive: { age: fmtAge(ageAggressive), isNoneDrawdown: false, drawdown: "−45%" },
      };
      const data = map[choiceId];
      return {
        label: t(`riskDna.q.pathPreference.choices.${choiceId}`, { age: data.age }),
        helper: data.isNoneDrawdown
          ? t("riskDna.q.pathPreference.dd.none")
          : t("riskDna.q.pathPreference.dd.label", { dd: data.drawdown }),
      };
    }
    return { label: t(`riskDna.q.${question.key}.choices.${choiceId}`) };
  };

  /* ───────── Q3 dynamic question text ───────── */
  const questionText = (() => {
    if (question.key === "lossReaction") {
      return t("riskDna.q.lossReaction.question", {
        amount: formatCurrency(concreteLossAmount, currency),
        after: formatCurrency(lossAfter, currency),
        symbol,
      });
    }
    if (question.key === "pathPreference") {
      return t("riskDna.q.pathPreference.question", {
        targetAge: phase1Inputs.targetFreedomAge,
      });
    }
    return t(`riskDna.q.${question.key}.question`);
  })();

  const subtitleText = t(`riskDna.q.${question.key}.subtitle`, { defaultValue: "" });

  /* ─────────────────────────────────────────────────────────────────
   *                         TRANSITION SCREEN
   * ───────────────────────────────────────────────────────────────── */
  if (showTransition) {
    const progressPct = Math.min(100, Math.round(((transitionMessageIdx + 1) / loadingMessages.length) * 100));

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,hsl(38_92%_88%/0.5),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_30%,hsl(38_92%_30%/0.25),transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {/* DNA-pulse animation */}
          <div className="relative w-44 h-44 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/15"
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-3 rounded-full bg-amber-100 dark:bg-amber-900/30 grid place-items-center">
              <motion.svg
                viewBox="0 0 64 64"
                className="w-24 h-24"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <path d="M22 12 Q42 22 22 32 Q42 42 22 52" stroke="hsl(199 89% 48%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M42 12 Q22 22 42 32 Q22 42 42 52" stroke="hsl(262 83% 58%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <line x1="24" y1="18" x2="40" y2="18" stroke="hsl(215 16% 60%)" strokeWidth="1.5" />
                <line x1="24" y1="26" x2="40" y2="26" stroke="hsl(215 16% 60%)" strokeWidth="1.5" />
                <line x1="24" y1="38" x2="40" y2="38" stroke="hsl(215 16% 60%)" strokeWidth="1.5" />
                <line x1="24" y1="46" x2="40" y2="46" stroke="hsl(215 16% 60%)" strokeWidth="1.5" />
              </motion.svg>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase mb-3 font-semibold">
            {t("riskDna.brandTagline")}
          </p>
          <p className="text-sm text-muted-foreground mb-3">{t("riskDna.decoding")}</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={transitionMessageIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="font-serif text-2xl text-foreground mb-8"
            >
              {loadingMessages[transitionMessageIdx]}
            </motion.p>
          </AnimatePresence>

          <div className="w-full max-w-xs mx-auto">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5 font-medium">
              <span>{t("riskDna.analysing")}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky via-primary to-violet-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────
   *                          QUESTION SCREEN
   * ───────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 md:bg-background/85 md:backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center" aria-label="FinkSmart">
            <img src={finksmartLogo} alt="FinkSmart" className="h-9 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {currentStep + 1} {t("calculator.of")} {TOTAL_QUESTIONS}
            </span>
            <Button size="icon" variant="ghost" onClick={toggleTheme} className="rounded-full">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Trail-style progress */}
        <div className="max-w-3xl mx-auto px-5 pb-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div key={i} className="flex items-center flex-1 gap-1.5">
                  <div
                    className={[
                      "w-7 h-7 shrink-0 rounded-full grid place-items-center text-[11px] font-bold transition-all",
                      isDone && "bg-mint text-white shadow-[0_0_0_3px_hsl(160_84%_39%/0.18)]",
                      isActive && "bg-primary text-primary-foreground fa-step-active",
                      !isDone && !isActive && "bg-muted text-muted-foreground",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {i < TOTAL_QUESTIONS - 1 && (
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-mint"
                        initial={{ width: 0 }}
                        animate={{ width: isDone ? "100%" : "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header — icon + dimension chip + question */}
              <div className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-primary/10 grid place-items-center">
                  <QuestionIcon size={56} />
                </div>
                <span className="fa-pill fa-pill-amber">
                  {t(`riskDna.dimension.${question.dimension}`)}
                </span>
                <h2 className="fa-display text-2xl md:text-3xl mt-3 max-w-2xl mx-auto">
                  {questionText}
                </h2>
                {subtitleText && <p className="text-muted-foreground mt-2 text-sm">{subtitleText}</p>}
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {question.choices.map((c) => {
                  const content = buildChoiceContent(c.id);
                  const isSelected = selectedChoice === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handlePick(c.id)}
                      data-testid={`choice-${question.key}-${c.id}`}
                      className={[
                        "w-full text-left rounded-2xl border p-4 transition-all flex items-start gap-3",
                        isSelected
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-card border-border hover-elevate",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "shrink-0 w-6 h-6 rounded-full border-2 grid place-items-center mt-0.5",
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        ].join(" ")}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm md:text-base font-medium ${isSelected ? "text-foreground" : "text-foreground"}`}>
                          {content.label}
                        </p>
                        {content.helper && (
                          <p className="text-xs text-muted-foreground mt-1">{content.helper}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={handleBack}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("calculator.back")}
                </Button>
                {currentStep === TOTAL_QUESTIONS - 1 ? (
                  <button
                    className="premium-cta flex-[1.4]"
                    disabled={!selectedChoice}
                    onClick={handleNext}
                    data-testid="button-next"
                  >
                    {t("riskDna.decodeMyDna")}
                    <Sparkles className="w-4 h-4" />
                  </button>
                ) : (
                  <Button
                    className="flex-[1.4] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                    disabled={!selectedChoice}
                    onClick={handleNext}
                    data-testid="button-next"
                  >
                    {t("calculator.continue")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Avoid TS warning if CLIMATES is imported but never directly read here.
void CLIMATES;
