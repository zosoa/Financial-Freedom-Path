import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Banknote,
  PiggyBank,
  Wallet,
  Sun,
  Moon,
  Compass,
  Sunset,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { SUPPORTED_CURRENCIES } from "@shared/schema";

interface StepConfig {
  key: "age" | "monthlyIncome" | "currentSavings" | "monthlySavingsRate" | "targetFreedomAge";
  question: string;
  subtitle: string;
  icon: typeof User;
  placeholder: string;
  suffix?: string;
  isCurrency?: boolean;
  min?: number;
  max?: number;
}

const STEPS: StepConfig[] = [
  {
    key: "age",
    question: "How old are you?",
    subtitle: "This helps us calculate the time you have to grow your wealth.",
    icon: User,
    placeholder: "35",
    suffix: "years old",
    min: 18,
    max: 80,
  },
  {
    key: "targetFreedomAge",
    question: "At what age do you dream of being financially free?",
    subtitle: "When would you love to stop working or when does working become a choice but no longer a necessity? Pick the age that excites you.",
    icon: Sunset,
    placeholder: "55",
    suffix: "years old",
    min: 25,
    max: 90,
  },
  {
    key: "monthlyIncome",
    question: "What is your current monthly net income?",
    subtitle: "After taxes. Be honest -- this is just for you.",
    icon: Banknote,
    placeholder: "5,000",
    isCurrency: true,
  },
  {
    key: "currentSavings",
    question: "How much do you have saved or invested today?",
    subtitle: "Bank accounts, investments, retirement funds -- everything counts.",
    icon: PiggyBank,
    placeholder: "25,000",
    isCurrency: true,
  },
  {
    key: "monthlySavingsRate",
    question: "How much can you save or invest every month?",
    subtitle: "Even a small amount grows dramatically over time. Be realistic.",
    icon: Wallet,
    placeholder: "500",
    isCurrency: true,
  },
];

type StepData = Record<StepConfig["key"], string>;

function getSavingsComment(savingsRate: number, monthlyIncome: number): { text: string; color: string } | null {
  if (!monthlyIncome || monthlyIncome <= 0 || isNaN(savingsRate)) return null;
  const percent = (savingsRate / monthlyIncome) * 100;

  if (percent > 70) {
    return { text: `That's ${Math.round(percent)}% of your income. Are you sure you'll have enough left for the basics? Be realistic so this plan actually works for you.`, color: "text-red-500 dark:text-red-400" };
  }
  if (percent > 50) {
    return { text: `That's ${Math.round(percent)}% of your income. Are you sure you'll have enough left to pay your bills? Impressive discipline, but be honest with yourself.`, color: "text-amber-500 dark:text-amber-400" };
  }
  if (percent >= 30) {
    return { text: `${Math.round(percent)}% of your income -- that's elite-level discipline! You're playing the long game like a pro.`, color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (percent >= 20) {
    return { text: `${Math.round(percent)}% -- excellent! Financial experts recommend 20%+. You're right in the sweet spot.`, color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (percent >= 10) {
    return { text: `${Math.round(percent)}% is a solid start! Try to work towards 20% over time -- even 1% more each year adds up massively.`, color: "text-blue-500 dark:text-blue-400" };
  }
  if (percent >= 5) {
    return { text: `${Math.round(percent)}% -- a good beginning! The minimum recommended is 5%. Every bit you can add will accelerate your journey.`, color: "text-blue-500 dark:text-blue-400" };
  }
  if (percent > 0) {
    return { text: `${Math.round(percent)}% is a start, but try to aim for at least 5% of your income. Small increases make a huge difference over time.`, color: "text-amber-500 dark:text-amber-400" };
  }
  return null;
}

function getSavingsHelpText(currentSavings: number, currencySymbol: string): { text: string; color: string } | null {
  if (isNaN(currentSavings)) return null;
  if (currentSavings <= 0) {
    return { text: "Starting from zero is perfectly fine! The important thing is that you're starting now. Time is your greatest ally.", color: "text-blue-500 dark:text-blue-400" };
  }
  if (currentSavings > 0 && currentSavings < 1000) {
    return { text: "Every journey starts with a first step. You've already begun -- that puts you ahead of most people.", color: "text-blue-500 dark:text-blue-400" };
  }
  if (currentSavings >= 1000 && currentSavings < 10000) {
    return { text: "You've got a foundation to build on! This head start will make a real difference thanks to compound growth.", color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (currentSavings >= 10000 && currentSavings < 100000) {
    return { text: "Impressive nest egg! You're well ahead of the curve. Compound interest is already working hard for you.", color: "text-emerald-500 dark:text-emerald-400" };
  }
  return { text: "Outstanding! With this foundation, your money is already working hard for you. Let's see how far it can take you.", color: "text-emerald-500 dark:text-emerald-400" };
}

const LOADING_MESSAGES = [
  "Crunching your numbers...",
  "Adjusting for inflation...",
  "Simulating compound growth...",
  "Calculating your Freedom Age...",
  "Preparing your results...",
];

export default function Calculator() {
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
        if (prev >= LOADING_MESSAGES.length - 1) {
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

  const Icon = step.icon;

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
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.p
              key={transitionMessageIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-medium text-muted-foreground"
            >
              {LOADING_MESSAGES[transitionMessageIdx]}
            </motion.p>
          </AnimatePresence>

          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm font-semibold">The Freedom Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {totalSteps}
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
                  <Icon className="w-7 h-7 text-primary" />
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
                    If you're not sure, just put 0 -- you can always come back later
                  </p>
                )}

                {step.key === "monthlySavingsRate" && data.monthlyIncome && currentValue && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      That's {Math.round((parseFloat(currentValue) / parseFloat(data.monthlyIncome)) * 100)}% of your income
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
                    You can't save more than you earn. Please adjust your amount.
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleBack} data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" disabled={!isValid} onClick={handleNext} data-testid="button-next">
                  {currentStep === totalSteps - 1 ? "See My Results" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
