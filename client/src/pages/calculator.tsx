import { useState, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  User,
  Banknote,
  PiggyBank,
  TrendingUp,
  Gift,
  Calendar,
  Sunset,
} from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@shared/schema";

interface StepData {
  age: string;
  monthlyIncome: string;
  desiredMonthlyIncome: string;
  currentSavings: string;
  monthlySavingsRate: string;
  expectedLumpSum: string;
  lumpSumAge: string;
}

const STEPS = [
  {
    key: "age" as const,
    question: "How old are you?",
    subtitle: "This helps us calculate the time you have to grow your wealth.",
    icon: User,
    placeholder: "35",
    suffix: "years old",
    min: 18,
    max: 80,
  },
  {
    key: "monthlyIncome" as const,
    question: "What is your current monthly net income?",
    subtitle: "After taxes. Be honest \u2014 this is just for you.",
    icon: Banknote,
    placeholder: "5,000",
    isCurrency: true,
  },
  {
    key: "desiredMonthlyIncome" as const,
    question: "How much would you need each month to live comfortably without working?",
    subtitle: "Think about your ideal lifestyle \u2014 rent, food, travel, everything.",
    icon: Sunset,
    placeholder: "3,000",
    isCurrency: true,
  },
  {
    key: "currentSavings" as const,
    question: "How much have you saved so far?",
    subtitle: "All your savings and investments combined. Include everything.",
    icon: PiggyBank,
    placeholder: "50,000",
    isCurrency: true,
  },
  {
    key: "monthlySavingsRate" as const,
    question: "How much can you save each month?",
    subtitle: "Even a small amount matters. We'll show you why.",
    icon: TrendingUp,
    placeholder: "500",
    isCurrency: true,
  },
  {
    key: "expectedLumpSum" as const,
    question: "Do you expect any future lump sum?",
    subtitle: "Bonus, inheritance, property sale, pension payout... Enter 0 if none.",
    icon: Gift,
    placeholder: "0",
    isCurrency: true,
    optional: true,
  },
  {
    key: "lumpSumAge" as const,
    question: "At what age do you expect this lump sum?",
    subtitle: "Approximately when would you receive it?",
    icon: Calendar,
    placeholder: "50",
    suffix: "years old",
    min: 18,
    max: 80,
    conditional: true,
  },
];

export default function Calculator() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const country = params.get("country") || "United States";
  const currency = params.get("currency") || "USD";
  const initialDesired = params.get("desiredIncome") || "3000";
  const referralSource = params.get("ref") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<StepData>({
    age: "",
    monthlyIncome: "",
    desiredMonthlyIncome: initialDesired,
    currentSavings: "",
    monthlySavingsRate: "",
    expectedLumpSum: "",
    lumpSumAge: "",
  });

  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const symbol = currencyInfo?.symbol || "$";

  const visibleSteps = STEPS.filter((step) => {
    if (step.conditional && step.key === "lumpSumAge") {
      return parseFloat(data.expectedLumpSum) > 0;
    }
    return true;
  });

  const totalSteps = visibleSteps.length;
  const step = visibleSteps[currentStep];
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const currentValue = data[step.key];

  const isValid = useCallback(() => {
    const val = parseFloat(currentValue);
    if (step.optional && (currentValue === "" || currentValue === "0")) return true;
    if (isNaN(val) || val < 0) return false;
    if (step.min && val < step.min) return false;
    if (step.max && val > step.max) return false;
    return true;
  }, [currentValue, step]);

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
        desiredMonthlyIncome: data.desiredMonthlyIncome,
        currentSavings: data.currentSavings,
        monthlySavingsRate: data.monthlySavingsRate,
        expectedLumpSum: data.expectedLumpSum || "0",
        lumpSumAge: data.lumpSumAge || data.age,
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
    if (e.key === "Enter" && isValid()) {
      handleNext();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm font-semibold">The Freedom Path</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>
        <Progress value={progressPercent} className="h-1 rounded-none" />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <StepIcon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2" data-testid={`text-question-${step.key}`}>
                  {step.question}
                </h2>
                <p className="text-sm text-muted-foreground">{step.subtitle}</p>
              </div>

              <div className="space-y-6">
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
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, [step.key]: e.target.value }))
                    }
                    onKeyDown={handleKeyDown}
                    className={`text-center text-2xl font-semibold h-16 ${step.isCurrency ? "pl-12" : ""}`}
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
                  <Button
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={handleBack}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    className="flex-1 text-base"
                    size="lg"
                    onClick={handleNext}
                    disabled={!isValid() && !step.optional}
                    data-testid="button-next"
                  >
                    {currentStep === totalSteps - 1 ? "See My Results" : "Continue"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {step.optional && (
                  <button
                    className="w-full text-sm text-muted-foreground underline-offset-4 underline"
                    onClick={() => {
                      setData((prev) => ({ ...prev, [step.key]: "0" }));
                      handleNext();
                    }}
                    data-testid="button-skip"
                  >
                    Skip, I don't expect any lump sum
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-4 border-t">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Calculating in {currencyInfo?.name} ({currency}) for {country}
          </p>
        </div>
      </footer>
    </div>
  );
}
