import { useState, useRef } from "react";
import { useLocation } from "wouter";
import finksmartIcon from "@assets/finksmart-icon.png";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowRight,
  Users,
  Lock,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  Sparkles,
  Check,
} from "lucide-react";
import iconRoadmap from "@assets/icons/icon-roadmap.png";
import iconRiskDna from "@assets/icons/icon-risk-dna.png";
import iconGoal from "@assets/icons/icon-goal.png";
import iconDataPrivacy from "@assets/icons/icon-data-privacy.png";
import iconSmartLogic from "@assets/icons/icon-smart-logic.png";
import iconAnalytics from "@assets/icons/icon-analytics.png";
import iconEducation from "@assets/icons/icon-education.png";
import iconGrowth from "@assets/icons/icon-growth.png";
import iconAnalysis from "@assets/icons/icon-analysis.png";
import iconSavings from "@assets/icons/icon-savings.png";
import iconCompound from "@assets/icons/icon-compound.png";
import iconInstitution from "@assets/icons/icon-institution.png";
import lifestyleImage from "@assets/Finksmart_Chill_success_woman_1770889957387.png";
import { useTheme } from "@/lib/theme-provider";
import {
  COUNTRY_CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
} from "@shared/schema";
import screenshot1 from "@assets/image_1770666978155.png";
import screenshot2 from "@assets/image_1770666992828.png";
import screenshot3 from "@assets/image_1770667017861.png";
import teamIllustration from "@assets/teamwork-concept-group-of-people-climbing-a-mountain-company-e_1770670026582.jpg";

const countries = Object.keys(COUNTRY_CURRENCY_MAP).sort();

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


export default function Landing() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState("Mauritius");
  const [selectedCurrency, setSelectedCurrency] = useState("MUR");
  const [desiredIncome, setDesiredIncome] = useState("");
  const [showCurrencyOverride, setShowCurrencyOverride] = useState(true);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    const defaultCurrency = COUNTRY_CURRENCY_MAP[country] || "USD";
    setSelectedCurrency(defaultCurrency);
    setShowCurrencyOverride(true);
  };

  const handleStart = () => {
    const income = parseFloat(desiredIncome) || 3000;
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref") || "";
    const params = new URLSearchParams({
      country: selectedCountry,
      currency: selectedCurrency,
      desiredIncome: income.toString(),
      ...(ref ? { ref } : {}),
    });
    navigate(`/calculator?${params.toString()}`);
  };

  const currencySymbol = SUPPORTED_CURRENCIES[selectedCurrency]?.symbol || "$";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <img src={finksmartIcon} alt="FinkSmart" className="w-7 h-7" data-testid="icon-logo" />
            <div className="flex flex-col leading-none" data-testid="text-brand">
              <span className="font-serif text-lg font-semibold tracking-tight">FinkSmart</span>
              <span className="text-[10px] text-muted-foreground tracking-wider">Pro-Investing Decoded</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5" data-testid="text-sponsor">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sponsored by</span>
              <span className="text-xs font-bold tracking-wide text-foreground">BLACKWAVE CAPITAL</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-12 md:py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/[0.04] mb-6" data-testid="badge-trust">
              <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground">Expert-Engineered Financial Model</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 max-w-4xl mx-auto" data-testid="text-headline">
              Will your future be a{" "}
              <span className="text-primary">reality</span> or a{" "}
              <span className="text-muted-foreground/60">fantasy</span>?
            </h1>

            <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap mb-5 text-sm md:text-base text-muted-foreground" data-testid="text-emotional-hook">
              <span>Early Retirement</span>
              <span className="text-primary/40">&bull;</span>
              <span>Luxurious Lifestyle</span>
              <span className="text-primary/40">&bull;</span>
              <span>Global Citizen</span>
              <span className="text-primary/40">&bull;</span>
              <span>Zero-Money Stress</span>
              <span className="text-primary/40">&bull;</span>
              <span>Work by Choice</span>
              <span className="text-primary/40">&bull;</span>
              <span>Financial Freedom</span>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed" data-testid="text-subheadline">
              Stop guessing. Do your <span className="font-semibold text-foreground">2-min Reality Check</span> (100% free, no login) and see if your current plan adds up.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="max-w-xl mx-auto p-6 md:p-8">
              <div className="space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Where do you live?
                  </label>
                  <Select value={selectedCountry} onValueChange={handleCountrySelect}>
                    <SelectTrigger data-testid="select-country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showCurrencyOverride && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-sm text-muted-foreground mb-2 block">
                      We'll calculate in {SUPPORTED_CURRENCIES[selectedCurrency]?.name}. Prefer a different currency?
                    </label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                          <SelectItem key={code} value={code}>
                            {info.symbol} {info.name} ({code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm text-muted-foreground">
                      If you could stop working, how much would you need per month?
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="cursor-help touch-manipulation" data-testid="button-inflation-info" aria-label="Inflation information">
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="max-w-xs text-xs leading-relaxed p-3">
                        <p className="font-semibold mb-1">We include inflation in the calculation</p>
                        <p>Inflation means things get a bit more expensive every year. For example, a coffee that costs {currencySymbol}3 today might cost {currencySymbol}3.65 in 10 years. We automatically account for this so your future income keeps the same purchasing power as today.</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      {currencySymbol}
                    </span>
                    <Input
                      type="number"
                      placeholder="3,000"
                      value={desiredIncome}
                      onChange={(e) => setDesiredIncome(e.target.value)}
                      className="pl-10 text-lg"
                      data-testid="input-desired-income"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Inflation will be included in the calculation automatically
                  </p>
                </div>

                <button
                  className="premium-cta premium-cta-lg w-full"
                  onClick={handleStart}
                  disabled={!selectedCountry}
                  data-testid="button-start-journey"
                >
                  Show me if it's possible
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>No login required. Your data stays private.</span>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </section>

      {/* Institutional Bridge - Trust & Authority */}
      <section className="py-16 md:py-20 bg-[#1a1a1f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1f] via-[#1f1f26] to-[#1a1a1f] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 text-white" data-testid="text-section-institutional">
                Where do the pros actually save?
              </h2>
              <p className="text-lg md:text-xl italic text-white/50 mb-8">
                Stock Markets? Crypto? Real Estate? Funds?
              </p>
              <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
                We spent our careers managing wealth for the ultra-rich&mdash;now we're giving you the exact same logic. No secrets, simplified and 100% free.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="mb-10">
              <p className="text-xs text-white/40 uppercase tracking-[0.2em] text-center mb-6 font-medium">
                Our team cut their teeth at
              </p>
              <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap" data-testid="institutional-names">
                {["BNP Paribas", "Deutsche Bank", "Citi", "Julius Baer", "AfrAsia Bank"].map((name, i, arr) => (
                  <span key={name} className="flex items-center gap-4 md:gap-8">
                    <span className="text-sm md:text-base font-semibold text-white/45 tracking-wider whitespace-nowrap" data-testid={`firm-${name.toLowerCase().replace(/\s+/g, '-')}`}>{name}</span>
                    {i < arr.length - 1 && <span className="text-white/20 hidden md:inline">|</span>}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="mb-12 max-w-2xl mx-auto space-y-5" data-testid="steps-overview">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm md:text-base text-white/75 leading-relaxed">
                  <span className="font-semibold text-white/90">Step 1: Your Savings Objective.</span>{" "}
                  Find the exact date you hit freedom.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm md:text-base text-white/75 leading-relaxed">
                  <span className="font-semibold text-white/90">Step 2: Your Investment Heat.</span>{" "}
                  Measure exactly how much market 'swing' you can handle.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm md:text-base text-white/75 leading-relaxed">
                  <span className="font-semibold text-white/90">Step 3: Your Personalized Savings Plan.</span>{" "}
                  Discover which door to open for action.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="text-center">
              <button
                className="premium-cta premium-cta-lg"
                onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-start-now"
              >
                Start Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Results Preview / Social Proof */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-section-preview">
                See what you'll discover
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                In just 2 minutes, you'll get a personalised financial dashboard that shows exactly where you stand and what's possible.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative max-w-3xl mx-auto">
              <div className="relative rounded-lg overflow-hidden border-4 border-foreground/10 shadow-2xl bg-card" data-testid="preview-device-frame">
                <div className="bg-foreground/5 px-4 py-2 flex items-center gap-2 border-b border-foreground/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-0.5 rounded-full">freedompath.app/results</span>
                  </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  <img
                    src={screenshot1}
                    alt="Freedom Score, Target Capital and Return Comparison"
                    className="w-full h-auto"
                    data-testid="img-results-preview-1"
                  />
                  <img
                    src={screenshot2}
                    alt="Capital Evolution Chart and Composition Breakdown"
                    className="w-full h-auto"
                    data-testid="img-results-preview-2"
                  />
                  <img
                    src={screenshot3}
                    alt="Gap Strategies and Sensitivity Analysis"
                    className="w-full h-auto"
                    data-testid="img-results-preview-3"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  Your personalised results in 2 minutes
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 3-Step Journey - 2-Column Split Layout */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-section-journey">
                Your Journey to Financial Freedom
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Three steps from "Where am I?" to "Here's my plan." We guide you through each one.
              </p>
            </div>
          </AnimatedSection>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Left Column - Lifestyle Image (45%) */}
            <div className="md:w-[45%] flex-shrink-0">
              <div className="md:sticky md:top-24">
                <AnimatedSection>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={lifestyleImage}
                      alt="Living your dream lifestyle with financial freedom"
                      className="w-full h-auto object-cover rounded-2xl"
                      data-testid="img-journey-lifestyle"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 pointer-events-none rounded-2xl" />
                  </div>
                </AnimatedSection>
              </div>
            </div>

            {/* Right Column - Journey Cards (55%) */}
            <div className="md:w-[55%] relative">
              {/* Connecting Orange Line */}
              <div className="hidden md:block absolute left-[28px] top-[60px] bottom-[60px] w-[2px] bg-gradient-to-b from-primary/60 via-primary/30 to-primary/10 z-0" />

              <div className="space-y-6">
                {/* Step 1 - Freedom GPS */}
                <AnimatedSection>
                  <div className="relative flex gap-5 items-start group">
                    <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-background shadow-md flex items-center justify-center border border-primary/20">
                      <img src={iconRoadmap} alt="" className="w-8 h-8" />
                    </div>
                    <div className="flex-1 bg-background rounded-xl p-5 shadow-sm border border-border/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Step 1</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                          <Sparkles className="w-2.5 h-2.5" /> Available Now
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1.5" data-testid="text-step1-title">Your FinkSmart Freedom GPS</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        Where do you stand today vs where you want to be? Our calculator reveals your exact position on the path to financial freedom in 2 minutes.
                      </p>
                      <p className="text-xs font-medium text-primary">
                        Answer 5 simple questions &rarr; Get your Freedom Score
                      </p>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Step 2 - Risk DNA */}
                <AnimatedSection>
                  <div className="relative flex gap-5 items-start group">
                    <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-background shadow-md flex items-center justify-center border border-blue-400/20">
                      <img src={iconRiskDna} alt="" className="w-8 h-8" />
                    </div>
                    <div className="flex-1 bg-background rounded-xl p-5 shadow-sm border border-border/40 opacity-90">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Step 2</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20 text-[10px] font-semibold">
                          <Lock className="w-2.5 h-2.5" /> Coming Soon
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1.5 text-muted-foreground" data-testid="text-step2-title">Your Risk DNA</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        Not all investors are the same. Discover what kind of investor you really are, so your plan fits your personality and comfort level.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        How much "heat" can your money take? Find out.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Step 3 - Action Plan */}
                <AnimatedSection>
                  <div className="relative flex gap-5 items-start group">
                    <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-background shadow-md flex items-center justify-center border border-border/40">
                      <img src={iconGoal} alt="" className="w-8 h-8" />
                    </div>
                    <div className="flex-1 bg-background rounded-xl p-5 shadow-sm border border-border/40 opacity-90">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Step 3</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
                          <Lock className="w-2.5 h-2.5" /> Coming Soon
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1.5 text-muted-foreground" data-testid="text-step3-title">Your Action Plan</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        From numbers to action. A concrete, step-by-step roadmap to actually get you to financial freedom&mdash;not theory, real moves you can make.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your personalised investment strategy, built for you.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why is this different */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-section-why">
                Why is this different?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Most financial tools are built by banks to sell you products. We built this to give you the truth.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatedSection>
              <Card className="p-6 h-full relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center mb-4 shadow-inner">
                  <img src={iconAnalysis} alt="" className="w-9 h-9 drop-shadow-sm" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Zero Product Bias</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We don't sell insurance, funds, or any financial products. We provide the diagnosis. Independent asset managers provide the cure&mdash;only if you ask.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="p-6 h-full relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent flex items-center justify-center mb-4 shadow-inner relative">
                  <img src={iconDataPrivacy} alt="" className="w-9 h-9 drop-shadow-sm" />
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-signal-pulse" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Your Data, Your Rules</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No login required.{" "}
                  <span className="inline-flex items-center gap-1">
                    Your numbers are never stored without your permission
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-signal-pulse" />
                  </span>
                  {" "}We only share your information with selected institutional partners when <span className="font-medium text-foreground">you actively choose</span> to connect with them.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="p-6 h-full relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent flex items-center justify-center mb-4 shadow-inner">
                    <img src={iconSmartLogic} alt="" className="w-9 h-9 drop-shadow-sm" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Institutional-Grade Logic</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Powered by the FINSIM v5 engine with a 2% inflation buffer and 6% Safe Withdrawal Rate&mdash;the same methodology used for ultra-high-net-worth clients.
                  </p>
                </div>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-section-how">
                How it works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Two minutes to clarity. No jargon, no tricks, no selling.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <img src={iconRoadmap} alt="" className="w-9 h-9" />
                </div>
                <div className="text-xs font-medium text-primary mb-2 tracking-wide uppercase">Step 1</div>
                <h3 className="font-semibold text-lg mb-2">Answer Simple Questions</h3>
                <p className="text-sm text-muted-foreground">
                  We ask one question at a time, in plain language. Your age, income, savings&mdash;that's it.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <img src={iconAnalytics} alt="" className="w-9 h-9" />
                </div>
                <div className="text-xs font-medium text-primary mb-2 tracking-wide uppercase">Step 2</div>
                <h3 className="font-semibold text-lg mb-2">See Your Freedom Date</h3>
                <p className="text-sm text-muted-foreground">
                  Our engine calculates exactly when you could stop working, adjusted for inflation and real-world returns.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <img src={iconEducation} alt="" className="w-9 h-9" />
                </div>
                <div className="text-xs font-medium text-primary mb-2 tracking-wide uppercase">Step 3</div>
                <h3 className="font-semibold text-lg mb-2">Get Clarity, Not Sales</h3>
                <p className="text-sm text-muted-foreground">
                  Share your score, explore scenarios, or talk to an independent expert for free. Your choice, always.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Coming Soon Teaser */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-section-coming-soon">
                More tools, more power&mdash;coming soon
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We're building the most complete financial freedom toolkit, one feature at a time.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedSection>
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <img src={iconEducation} alt="" className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">No-Jargon Guides</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plain-language guides that explain investing concepts the way a friend would over coffee. No finance degree needed.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center">
                    <img src={iconGrowth} alt="" className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Market Insights</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unique perspectives from professionals who've managed billions. Not news&mdash;real insights that matter to your wallet.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <img src={iconSmartLogic} alt="" className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart Tips & Strategies</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Practical, actionable tips to optimise your savings, reduce taxes, and make your money work harder&mdash;without the complexity.
                </p>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Personal note */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <div className="relative rounded-lg overflow-hidden" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
            }}>
              <Card className="p-0 border-primary/10 bg-card/80 backdrop-blur-sm">
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-3 p-8 md:p-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-1" data-testid="text-personal-message">A personal note from our team</h3>
                        <p className="text-xs text-muted-foreground tracking-wide uppercase">The FinkSmart Freedom Path Founders</p>
                      </div>
                    </div>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        After years in private banking, we saw that most people are left in the dark about their real financial future. The tools given to everyday savers are either broken, biased, or built to confuse.
                      </p>
                      <p>
                        We built The FinkSmart Freedom Path to change that. We don't want your money&mdash;we want to give you the clarity we usually only provide to our private clients.
                      </p>
                      <p className="font-medium text-foreground">
                        Everyone deserves a clear answer to a simple question: "When can I be free?"
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <svg viewBox="0 0 200 50" className="w-32 h-8 text-foreground/40" aria-label="Team signature">
                        <path d="M10 35 Q20 10 35 30 Q45 45 55 25 Q60 15 70 30 Q75 38 80 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M90 35 Q100 15 110 30 Q115 38 125 20 Q130 12 140 28 Q145 35 155 25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <p className="text-xs text-muted-foreground mt-1 italic">The FinkSmart Team</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center justify-center p-6 md:p-4">
                    <img
                      src={teamIllustration}
                      alt="Team climbing together toward financial freedom"
                      className="w-full max-w-xs md:max-w-none h-auto rounded-lg"
                      data-testid="img-team-illustration"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-bottom">
              Ready to see your Freedom Date?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              It takes 2 minutes. It's completely free. And it might just change how you think about your future.
            </p>
            <button
              className="premium-cta premium-cta-lg"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              data-testid="button-cta-bottom"
            >
              Start My Freedom Journey
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Your data is never shared unless you actively choose to connect with a partner.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={finksmartIcon} alt="FinkSmart" className="w-5 h-5" />
            <span className="font-serif text-sm font-medium">FinkSmart | Pro-Investing Decoded. All rights reserved.</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sponsored by</span>
            <span className="text-xs font-bold tracking-wide text-foreground" data-testid="text-sponsor-footer">BLACKWAVE CAPITAL</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by FINSIM v5 &middot; Independent &middot; Free &middot; No products, just directions.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            finksmart.com
          </p>
          <div className="mt-4 pt-3 border-t border-border/40 max-w-xl mx-auto">
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              <span className="font-semibold">Disclaimer:</span> This tool is for educational and informational purposes only and does not constitute financial, investment, tax, or legal advice. Past performance does not guarantee future results. All projections are hypothetical and based on simplified assumptions (2% inflation, 6% SWR). Actual results will vary. Consult a qualified financial advisor before making investment decisions. By using this tool, you acknowledge that Finksmart and its sponsors assume no liability for any financial outcomes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
