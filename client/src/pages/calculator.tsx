import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Sun, Moon, Sparkles, Check } from "lucide-react";
import {
  StepAge,
  StepFreedomAge,
  StepIncome,
  StepSavings,
  StepSavingsRate,
} from "@/components/illustrations/StepIllustrations";
import { useTheme } from "@/lib/theme-provider";
import { SUPPORTED_CURRENCIES } from "@shared/schema";

type StepKey = "age" | "monthlyIncome" | "currentSavings" | "monthlySavingsRate" | "targetFreedomAge";

interface StepConfig {
  key: StepKey;
  question: string;
  subtitle: string;
  Illustration: (p: { className?: string }) => JSX.Element;
  placeholder: string;
  suffix?: string;
  isCurrency?: boolean;
  min?: number;
  max?: number;
}

const getSteps = (): StepConfig[] => [
  {
    key: "age",
    question: i18n.t("calculator.questions.age"),
    subtitle: i18n.t("calculator.questions.ageSubtitle"),
    Illustration: StepAge,
    placeholder: "35",
    suffix: i18n.t("calculator.yearsOld"),
    min: 18,
    max: 80,
  },
  {
    key: "targetFreedomAge",
    question: i18n.t("calculator.questions.targetFreedomAge"),
    subtitle: i18n.t("calculator.questions.targetFreedomAgeSubtitle"),
    Illustration: StepFreedomAge,
    placeholder: "55",
    suffix: i18n.t("calculator.yearsOld"),
    min: 25,
    max: 90,
  },
  {
    key: "monthlyIncome",
    question: i18n.t("calculator.questions.monthlyIncome"),
    subtitle: i18n.t("calculator.questions.monthlyIncomeSubtitle"),
    Illustration: StepIncome,
    placeholder: "5,000",
    isCurrency: true,
  },
  {
    key: "currentSavings",
    question: i18n.t("calculator.questions.currentSavings"),
    subtitle: i18n.t("calculator.questions.currentSavingsSubtitle"),
    Illustration: StepSavings,
    placeholder: "25,000",
    isCurrency: true,
  },
  {
    key: "monthlySavingsRate",
    question: i18n.t("calculator.questions.monthlySavingsRate"),
    subtitle: i18n.t("calculator.questions.monthlySavingsRateSubtitle"),
    Illustration: StepSavingsRate,
    placeholder: "500",
    isCurrency: true,
  },
];

type StepData = Record<StepKey, string>;

function getSavingsComment(savingsRate: number, monthlyIncome: number): { text: string; color: string } | null {
  if (!monthlyIncome || monthlyIncome <= 0 || isNaN(savingsRate)) return null;
  const percent = Math.round((savingsRate / monthlyIncome) * 100);

  if (percent > 70) {
    return { text: i18n.t("calculator.savingsComments.tooHigh", { percent }), color: "text-red-500 dark:text-red-400" };
  }
  if (percent > 50) {
    return { text: i18n.t("calculator.savingsComments.veryHigh", { percent }), color: "text-amber-500 dark:text-amber-400" };
  }
  if (percent >= 30) {
    return { text: i18n.t("calculator.savingsComments.elite", { percent }), color: "text-emerald-600 dark:text-emerald-400" };
  }
  if (percent >= 20) {
    return { text: i18n.t("calculator.savingsComments.excellent", { percent }), color: "text-emerald-600 dark:text-emerald-400" };
  }
  if (percent >= 10) {
    return { text: i18n.t("calculator.savingsComments.solid", { percent }), color: "text-sky-600 dark:text-sky-400" };
  }
  if (percent >= 5) {
    return { text: i18n.t("calculator.savingsComments.good", { percent }), color: "text-sky-600 dark:text-sky-400" };
  }
  if (percent > 0) {
    return { text: i18n.t("calculator.savingsComments.start", { percent }), color: "text-amber-500 dark:text-amber-400" };
  }
  return null;
}

function getSavingsHelpText(currentSavings: number): { text: string; color: string } | null {
  if (isNaN(currentSavings)) return null;
  if (currentSavings <= 0) {
    return { text: i18n.t("calculator.savingsHelp.zeroStart"), color: "text-sky-600 dark:text-sky-400" };
  }
  if (currentSavings > 0 && currentSavings < 1000) {
    return { text: i18n.t("calculator.savingsHelp.firstStep"), color: "text-sky-600 dark:text-sky-400" };
  }
  if (currentSavings >= 1000 && currentSavings < 10000) {
    return { text: i18n.t("calculator.savingsHelp.foundation"), color: "text-emerald-600 dark:text-emerald-400" };
  }
  if (currentSavings >= 10000 && currentSavings < 100000) {
    return { text: i18n.t("calculator.savingsHelp.impressive"), color: "text-emerald-600 dark:text-emerald-400" };
  }
  return { text: i18n.t("calculator.savingsHelp.outstanding"), color: "text-emerald-600 dark:text-emerald-400" };
}

const getLoadingMessages = () => [
  i18n.t("calculator.loading.msg1"),
  i18n.t("calculator.loading.msg2"),
  i18n.t("calculator.loading.msg3"),
  i18n.t("calculator.loading.msg4"),
  i18n.t("calculator.loading.msg5"),
];

export default function Calculator() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const country = params.get("country") || "Mauritius";
  const currency = params.get("currency") || "MUR";
  const desiredMonthlyIncome = params.get("desiredIncome") || "3000";
  const referralSource = params.get("ref") || "";
  const { theme, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessageIdx, setTransitionMessageIdx] = useState(0);
  const [data, setData] = useState<StepData>({
    age: "",
    monthlyIncome: "",
    currentSavings: "",
    monthlySavingsRate: "",
    targetFreedomAge: "",
  });

  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const symbol = currencyInfo?.symbol || "$";

  const STEPS = getSteps();
  const loadingMessages = getLoadingMessages();
  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];

  const currentValue = data[step.key];

  const isValid = useMemo(() => {
    const val = parseFloat(currentValue);
    if (isNaN(val) || val < 0) return false;
    if (step.min && val < step.min) return false;
    if (step.max && val > step.max) return false;
    if (step.key === "targetFreedomAge" && data.age) {
      const age = parseInt(data.age);
      if (val <= age) return false;
    }
    if (step.key === "monthlySavingsRate" && data.monthlyIncome) {
      const income = parseFloat(data.monthlyIncome);
      if (val > income) return false;
    }
    return true;
  }, [currentValue, step, data.age, data.monthlyIncome]);

  useEffect(() => {
    if (!showTransition) return;
    const interval = setInterval(() => {
      setTransitionMessageIdx((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          const queryParams = new URLSearchParams({
            country,
            currency,
            age: data.age,
            monthlyIncome: data.monthlyIncome,
            desiredMonthlyIncome,
            currentSavings: data.currentSavings || "0",
            monthlySavingsRate: data.monthlySavingsRate,
            targetFreedomAge: data.targetFreedomAge,
            annualReturn: "7",
            ...(referralSource ? { ref: referralSource } : {}),
          });
          navigate(`/results?${queryParams.toString()}`);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [showTransition, data, country, currency, desiredMonthlyIncome, referralSource, navigate, loadingMessages.length]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((p) => p + 1);
    } else {
      setShowTransition(true);
      setTransitionMessageIdx(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((p) => p - 1);
    } else {
      navigate("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid) handleNext();
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  const Illustration = step.Illustration;

  const savingsComment = useMemo(() => {
    if (step.key === "monthlySavingsRate") {
      const val = parseFloat(currentValue);
      const income = parseFloat(data.monthlyIncome);
      return getSavingsComment(val, income);
    }
    return null;
  }, [step.key, currentValue, data.monthlyIncome]);

  const savingsHelpText = useMemo(() => {
    if (step.key === "currentSavings") {
      const val = parseFloat(currentValue);
      return getSavingsHelpText(val);
    }
    return null;
  }, [step.key, currentValue]);

  /* ---------- Transition screen ---------- */
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
          {/* Animated compass */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/15"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-3 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <motion.svg
                viewBox="0 0 64 64"
                className="w-24 h-24"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="32" cy="32" r="22" fill="none" stroke="hsl(38 92% 50%)" strokeWidth="2.4" />
                <path d="M40 22 L34 34 L22 40 L28 28 Z" fill="hsl(38 92% 50%)" />
                <circle cx="32" cy="32" r="2.5" fill="hsl(222 47% 11%)" />
              </motion.svg>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase mb-3 font-semibold">
            {t("calculator.brandTagline")}
          </p>
          <p className="text-sm text-muted-foreground mb-3">{t("calculator.mappingPath")}</p>
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
              <span>{t("calculator.analysing")}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-mint via-primary to-coral"
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

  /* ---------- Step screen ---------- */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 md:bg-background/85 md:backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center" aria-label="FinkSmart">
            <img src={finksmartLogo} alt="FinkSmart" className="h-9 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {currentStep + 1} {t("calculator.of")} {totalSteps}
            </span>
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle-calc" className="rounded-full">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Trail-style progress */}
        <div className="max-w-3xl mx-auto px-5 pb-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => {
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
                  {i < totalSteps - 1 && (
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
              key={step.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-center"
            >
              {/* Illustration */}
              <div className="order-2 md:order-1 flex justify-center">
                <Illustration className="w-full max-w-[300px] fa-float" />
              </div>

              {/* Question + input */}
              <div className="order-1 md:order-2 space-y-5">
                <div>
                  <span className="fa-pill fa-pill-amber">
                    {t("calculator.step")} {currentStep + 1}/{totalSteps}
                  </span>
                  <h2
                    className="fa-display text-3xl md:text-4xl mt-3 text-foreground"
                    data-testid={`text-question-${step.key}`}
                  >
                    {step.question}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-base">{step.subtitle}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="relative">
                    {step.isCurrency && (
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xl">
                        {symbol}
                      </span>
                    )}
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={step.placeholder}
                      value={currentValue}
                      onChange={(e) => setData((d) => ({ ...d, [step.key]: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className={`text-center text-3xl h-16 font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${
                        step.isCurrency ? "pl-12" : ""
                      } ${currentValue ? "text-primary" : ""}`}
                      autoFocus
                      data-testid={`input-${step.key}`}
                    />
                    {step.suffix && currentValue && (
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        {step.suffix}
                      </span>
                    )}
                  </div>

                  {step.key === "currentSavings" && !savingsHelpText && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      {t("calculator.savingsComments.unsurePut0")}
                    </p>
                  )}

                  {step.key === "monthlySavingsRate" && data.monthlyIncome && currentValue && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      {t("calculator.savingsComments.incomePercent", {
                        percent: Math.round((parseFloat(currentValue) / parseFloat(data.monthlyIncome)) * 100),
                      })}
                    </p>
                  )}

                  {savingsComment && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-medium text-center mt-3 ${savingsComment.color}`}
                    >
                      {savingsComment.text}
                    </motion.p>
                  )}

                  {savingsHelpText && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-medium text-center mt-3 ${savingsHelpText.color}`}
                    >
                      {savingsHelpText.text}
                    </motion.p>
                  )}

                  {step.key === "monthlySavingsRate" &&
                    data.monthlyIncome &&
                    parseFloat(currentValue) > parseFloat(data.monthlyIncome) && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-center text-red-500 dark:text-red-400 mt-3"
                      >
                        {t("calculator.savingsComments.cantSaveMore")}
                      </motion.p>
                    )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-border"
                    onClick={handleBack}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("calculator.back")}
                  </Button>
                  {currentStep === totalSteps - 1 ? (
                    <button
                      className="premium-cta flex-[1.4]"
                      disabled={!isValid}
                      onClick={handleNext}
                      data-testid="button-next"
                    >
                      {t("calculator.seeMyResults")}
                      <Sparkles className="w-4 h-4" />
                    </button>
                  ) : (
                    <Button
                      className="flex-[1.4] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                      disabled={!isValid}
                      onClick={handleNext}
                      data-testid="button-next"
                    >
                      {t("calculator.continue")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
