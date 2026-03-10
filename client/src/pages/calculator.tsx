import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import finksmartIcon from "@assets/finksmart-icon.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import iconRetirement from "@assets/icons/icon-retirement.png";
import iconWealth from "@assets/icons/icon-wealth.png";
import iconSavings from "@assets/icons/icon-savings.png";
import iconGrowth from "@assets/icons/icon-growth.png";
import iconGlobalView from "@assets/icons/icon-global-view.png";
import { useTheme } from "@/lib/theme-provider";
import { SUPPORTED_CURRENCIES } from "@shared/schema";

interface StepConfig {
  key: "age" | "monthlyIncome" | "currentSavings" | "monthlySavingsRate" | "targetFreedomAge";
  question: string;
  subtitle: string;
  iconSrc: string;
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
    iconSrc: iconGlobalView,
    placeholder: "35",
    suffix: i18n.t("calculator.yearsOld"),
    min: 18,
    max: 80,
  },
  {
    key: "targetFreedomAge",
    question: i18n.t("calculator.questions.targetFreedomAge"),
    subtitle: i18n.t("calculator.questions.targetFreedomAgeSubtitle"),
    iconSrc: iconRetirement,
    placeholder: "55",
    suffix: i18n.t("calculator.yearsOld"),
    min: 25,
    max: 90,
  },
  {
    key: "monthlyIncome",
    question: i18n.t("calculator.questions.monthlyIncome"),
    subtitle: i18n.t("calculator.questions.monthlyIncomeSubtitle"),
    iconSrc: iconWealth,
    placeholder: "5,000",
    isCurrency: true,
  },
  {
    key: "currentSavings",
    question: i18n.t("calculator.questions.currentSavings"),
    subtitle: i18n.t("calculator.questions.currentSavingsSubtitle"),
    iconSrc: iconSavings,
    placeholder: "25,000",
    isCurrency: true,
  },
  {
    key: "monthlySavingsRate",
    question: i18n.t("calculator.questions.monthlySavingsRate"),
    subtitle: i18n.t("calculator.questions.monthlySavingsRateSubtitle"),
    iconSrc: iconGrowth,
    placeholder: "500",
    isCurrency: true,
  },
];

type StepData = Record<StepConfig["key"], string>;

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
    return { text: i18n.t("calculator.savingsComments.elite", { percent }), color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (percent >= 20) {
    return { text: i18n.t("calculator.savingsComments.excellent", { percent }), color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (percent >= 10) {
    return { text: i18n.t("calculator.savingsComments.solid", { percent }), color: "text-blue-500 dark:text-blue-400" };
  }
  if (percent >= 5) {
    return { text: i18n.t("calculator.savingsComments.good", { percent }), color: "text-blue-500 dark:text-blue-400" };
  }
  if (percent > 0) {
    return { text: i18n.t("calculator.savingsComments.start", { percent }), color: "text-amber-500 dark:text-amber-400" };
  }
  return null;
}

function getSavingsHelpText(currentSavings: number, currencySymbol: string): { text: string; color: string } | null {
  if (isNaN(currentSavings)) return null;
  if (currentSavings <= 0) {
    return { text: i18n.t("calculator.savingsHelp.zeroStart"), color: "text-blue-500 dark:text-blue-400" };
  }
  if (currentSavings > 0 && currentSavings < 1000) {
    return { text: i18n.t("calculator.savingsHelp.firstStep"), color: "text-blue-500 dark:text-blue-400" };
  }
  if (currentSavings >= 1000 && currentSavings < 10000) {
    return { text: i18n.t("calculator.savingsHelp.foundation"), color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (currentSavings >= 10000 && currentSavings < 100000) {
    return { text: i18n.t("calculator.savingsHelp.impressive"), color: "text-emerald-500 dark:text-emerald-400" };
  }
  return { text: i18n.t("calculator.savingsHelp.outstanding"), color: "text-emerald-500 dark:text-emerald-400" };
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
    if (step.key === "currentSavings") {
      return true;
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
  }, [showTransition, data, country, currency, desiredMonthlyIncome, referralSource, navigate]);

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

  const stepIconSrc = step.iconSrc;

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
      return getSavingsHelpText(val, symbol);
    }
    return null;
  }, [step.key, currentValue, symbol]);

  if (showTransition) {
    const pathPoints = Array.from({ length: 5 }, (_, i) => ({
      x: 50 + Math.sin(i * 1.2) * 30,
      y: 15 + i * 18,
    }));
    const pathD = pathPoints.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pathPoints[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} Q ${prev.x} ${(prev.y + p.y) / 2} ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
    }, "");

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <motion.path
                d={pathD}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="200"
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                opacity={0.3}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="200"
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
              />
            </svg>
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              animate={{
                y: [0, 72, 0],
                x: [0, -15, 15, -10, 0],
              }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <img src={finksmartIcon} alt="" className="w-6 h-6" />
              </div>
            </motion.div>
            {pathPoints.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/30"
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0.5] }}
                transition={{ delay: i * 0.5, duration: 1 }}
              />
            ))}
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase mb-3">{t("calculator.brandTagline")}</p>
            <p className="text-sm text-muted-foreground mb-2">{t("calculator.mappingPath")}</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={transitionMessageIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-medium text-foreground"
              >
                {loadingMessages[transitionMessageIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="w-56 mx-auto">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>{t("calculator.analysing")}</span>
              <span>{Math.min(100, Math.round(((transitionMessageIdx + 1) / loadingMessages.length) * 100))}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={finksmartLogo} alt="FinkSmart - Pro-Investing Decoded" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} {t("calculator.of")} {totalSteps}
            </span>
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle-calc">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <img src={stepIconSrc} alt="" className="w-9 h-9" />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2" data-testid={`text-question-${step.key}`}>
                  {step.question}
                </h2>
                <p className="text-muted-foreground text-sm">{step.subtitle}</p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  {step.isCurrency && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">
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
                    className={`text-center text-2xl h-16 font-medium ${step.isCurrency ? "pl-10" : ""}`}
                    autoFocus
                    data-testid={`input-${step.key}`}
                  />
                  {step.suffix && currentValue && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {step.suffix}
                    </span>
                  )}
                </div>

                {step.key === "currentSavings" && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t("calculator.savingsComments.unsurePut0")}
                  </p>
                )}

                {step.key === "monthlySavingsRate" && data.monthlyIncome && currentValue && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {t("calculator.savingsComments.incomePercent", { percent: Math.round((parseFloat(currentValue) / parseFloat(data.monthlyIncome)) * 100) })}
                    </p>
                  </div>
                )}

                {savingsComment && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs text-center ${savingsComment.color}`}
                  >
                    {savingsComment.text}
                  </motion.p>
                )}

                {savingsHelpText && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs text-center ${savingsHelpText.color}`}
                  >
                    {savingsHelpText.text}
                  </motion.p>
                )}

                {step.key === "monthlySavingsRate" && data.monthlyIncome && parseFloat(currentValue) > parseFloat(data.monthlyIncome) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center text-red-500 dark:text-red-400"
                  >
                    {t("calculator.savingsComments.cantSaveMore")}
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleBack} data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("calculator.back")}
                </Button>
                {currentStep === totalSteps - 1 ? (
                  <button className="premium-cta flex-1" disabled={!isValid} onClick={handleNext} data-testid="button-next">
                    {t("calculator.seeMyResults")}
                    <Sparkles className="w-4 h-4" />
                  </button>
                ) : (
                  <Button className="flex-1" disabled={!isValid} onClick={handleNext} data-testid="button-next">
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
