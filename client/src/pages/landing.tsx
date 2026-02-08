import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight,
  Shield,
  Eye,
  Heart,
  TrendingUp,
  Users,
  Lock,
  Sun,
  Moon,
  Compass,
  Mountain,
  Target,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import {
  COUNTRY_CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
} from "@shared/schema";

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
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [desiredIncome, setDesiredIncome] = useState("");
  const [showCurrencyOverride, setShowCurrencyOverride] = useState(false);

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
            <Compass className="w-6 h-6 text-primary" data-testid="icon-logo" />
            <span className="font-serif text-lg font-semibold tracking-tight" data-testid="text-brand">
              The Freedom Path
            </span>
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
      </header>

      <section className="relative py-16 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-sm text-muted-foreground mb-6" data-testid="badge-credibility">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Built by former Private Bankers and UHNW Asset Managers</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-4xl mx-auto" data-testid="text-headline">
              Tired of financial tools that feel like a{" "}
              <span className="text-primary">math test</span>?
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" data-testid="text-subheadline">
              We spent our careers managing wealth for the ultra-rich. Now, we're giving you the exact same logic we used for them&mdash;simplified, jargon-free, and 100% free. No products to sell, just a clear path to your first goal.
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
                  <label className="text-sm text-muted-foreground mb-2 block">
                    If you could stop working, how much would you need per month?
                  </label>
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
                </div>

                <Button
                  className="w-full text-base"
                  size="lg"
                  onClick={handleStart}
                  disabled={!selectedCountry}
                  data-testid="button-start-journey"
                >
                  Show me if it's possible
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 text-center"
          >
            <p className="text-xs text-muted-foreground mb-3 tracking-wide uppercase">
              Our team brings experience from
            </p>
            <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap opacity-40" data-testid="credibility-logos">
              <span className="font-serif text-sm md:text-base font-medium">UBS</span>
              <span className="font-serif text-sm md:text-base font-medium">Credit Suisse</span>
              <span className="font-serif text-sm md:text-base font-medium">JP Morgan</span>
              <span className="font-serif text-sm md:text-base font-medium">Pictet</span>
              <span className="font-serif text-sm md:text-base font-medium">Lombard Odier</span>
            </div>
          </motion.div>
        </div>
      </section>

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
              <Card className="p-6 h-full">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Zero Product Bias</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We don't sell insurance, funds, or any financial products. We provide the diagnosis. Independent asset managers provide the cure&mdash;only if you ask.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="p-6 h-full">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Your Data, Your Rules</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No login required. Your financial journey should be private. We only ask for your contact information if you decide you want expert help interpreting your results.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="p-6 h-full">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Institutional-Grade Logic</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Powered by the FINSIM v5 engine with a 2% inflation buffer and 6% Safe Withdrawal Rate&mdash;the same methodology used for ultra-high-net-worth clients.
                </p>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-section-how">
                How it works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Three minutes to clarity. No jargon, no tricks, no selling.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mountain className="w-7 h-7 text-primary" />
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
                  <Target className="w-7 h-7 text-primary" />
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
                  <Heart className="w-7 h-7 text-primary" />
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

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <AnimatedSection>
            <Card className="p-8 md:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-1" data-testid="text-personal-message">A personal note from our team</h3>
                  <p className="text-xs text-muted-foreground tracking-wide uppercase">The Freedom Path Founders</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  After years in private banking, we saw that most people are left in the dark about their real financial future. The tools given to everyday savers are either broken, biased, or built to confuse.
                </p>
                <p>
                  We built The Freedom Path to change that. We don't want your money&mdash;we want to give you the clarity we usually only provide to our private clients.
                </p>
                <p className="font-medium text-foreground">
                  Everyone deserves a clear answer to a simple question: "When can I be free?"
                </p>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-bottom">
              Ready to see your Freedom Date?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              It takes 3 minutes. It's completely free. And it might just change how you think about your future.
            </p>
            <Button
              size="lg"
              className="text-base"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              data-testid="button-cta-bottom"
            >
              Start My Freedom Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-primary" />
            <span className="font-serif text-sm font-medium">The Freedom Path</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by FINSIM v5 &middot; Independent &middot; Free &middot; No products, just directions.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Not financial advice. For educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
