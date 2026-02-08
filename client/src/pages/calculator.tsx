import { useState, useMemo } from "react";
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
  {
    key: "targetFreedomAge",
    question: "At what age do you dream of being financially free?",
    subtitle: "When would you love to stop working because you have to? Pick the age that excites you.",
    icon: Sunset,
    placeholder: "55",
    suffix: "years old",
    min: 25,
    max: 90,
  },
];

type StepData = Record<StepConfig["key"], string>;

export default function Calculator() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const country = params.get("country") || "United States";
  const currency = params.get("currency") || "USD";
  const desiredMonthlyIncome = params.get("desiredIncome") || "3000";
  const referralSource = params.get("ref") || "";
  const { theme, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
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
    return true;
  }, [currentValue, step, data.age]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((p) => p + 1);
    } else {
      const queryParams = new URLSearchParams({
        country,
        currency,
        age: data.age,
        monthlyIncome: data.monthlyIncome,
        desiredMonthlyIncome,
        currentSavings: data.currentSavings,
        monthlySavingsRate: data.monthlySavingsRate,
        targetFreedomAge: data.targetFreedomAge,
        annualReturn: "7",
        ...(referralSource ? { ref: referralSource } : {}),
      });
      navigate(`/results?${queryParams.toString()}`);
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
