import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowRight,
  Lock,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  Sparkles,
  Check,
} from "lucide-react";
import {
  IconCompass,
  IconDNA,
  IconTarget,
  IconShield,
  IconLightbulb,
  IconBars,
  IconDiploma,
  IconGrowth,
  IconMagnifier,
  IconCompound,
  IconPillars,
  IconSummit,
} from "@/components/icons";
import HeroSummit from "@/components/illustrations/HeroSummit";
import lifestyleImage from "@assets/Finksmart_Chill_success_woman_1770889957387.png";
import { useTheme } from "@/lib/theme-provider";
import {
  COUNTRY_CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
  COUNTRY_ISO_MAP,
  EUR_EXCHANGE_RATES,
} from "@shared/schema";
import ResultsPreview from "@/components/illustrations/ResultsPreview";
import { RealSmartLogo, GeliosLogo, JointVentureFooter } from "@/components/illustrations/JointVenture";
import teamPortrait from "@assets/Partners_Pictures_RealSmart_1776604047326.jpg";

const countries = Object.keys(COUNTRY_CURRENCY_MAP).sort();

function countryToFlag(countryName: string): string {
  const iso = COUNTRY_ISO_MAP[countryName];
  if (!iso) return "";
  return iso
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join("");
}

function getDefaultPlaceholder(currencyCode: string): string {
  const rate = EUR_EXCHANGE_RATES[currencyCode] || 1;
  const rawValue = 1000 * rate;
  const rounded = Math.round(rawValue / 1000) * 1000;
  const result = Math.max(1000, rounded);
  return formatWithSeparators(result.toString());
}

function formatWithSeparators(value: string): string {
  const num = value.replace(/[^\d]/g, "");
  if (!num) return "";
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parseFormattedNumber(value: string): string {
  return value.replace(/\s/g, "");
}

function useCountUp(target: number, duration: number = 1500, shouldStart: boolean = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    const startTime = performance.now();
    let rafId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [shouldStart, target, duration]);
  return value;
}

function LiveImpactBar() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const guidedUsers = useCountUp(327, 1500, inView);
  const savingsGap = useCountUp(5680000, 1500, inView);
  const retiringEarly = useCountUp(28, 1500, inView);

  const formatGap = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val}`;
  };

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6" data-testid="live-impact-bar">
      <div className="fa-card p-5 text-center" data-testid="stat-guided-users">
        <div className="font-serif text-3xl md:text-4xl font-bold text-primary">+{guidedUsers}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold mt-1">
          {t("liveImpact.guidedUsers")}
        </div>
      </div>
      <div className="fa-card p-5 text-center" data-testid="stat-savings-gap">
        <div className="font-serif text-3xl md:text-4xl font-bold text-foreground">{formatGap(savingsGap)}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold mt-1">
          {t("liveImpact.savingsGaps")}
        </div>
      </div>
      <div className="fa-card p-5 text-center" data-testid="stat-retiring-early">
        <div className="font-serif text-3xl md:text-4xl font-bold text-mint">{retiringEarly}%</div>
        <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold mt-1">
          {t("liveImpact.earlyRetirement")}
        </div>
      </div>
    </div>
  );
}

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
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState("Mauritius");
  const [selectedCurrency, setSelectedCurrency] = useState("MUR");
  const [desiredIncome, setDesiredIncome] = useState("");
  const [showCurrencyOverride, setShowCurrencyOverride] = useState(true);

  const defaultPlaceholder = useMemo(() => getDefaultPlaceholder(selectedCurrency), [selectedCurrency]);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    const defaultCurrency = COUNTRY_CURRENCY_MAP[country] || "USD";
    setSelectedCurrency(defaultCurrency);
    setShowCurrencyOverride(true);
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setDesiredIncome(raw ? formatWithSeparators(raw) : "");
  };

  const handleStart = () => {
    const income =
      parseFloat(parseFormattedNumber(desiredIncome)) ||
      parseFloat(parseFormattedNumber(defaultPlaceholder)) ||
      3000;
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
      {/* ============== HEADER ============== */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center" data-testid="text-brand">
            <img src={finksmartLogo} alt="FinkSmart" className="h-10 w-auto" data-testid="icon-logo" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5" data-testid="text-jv-byline">
              <RealSmartLogo className="w-5 h-5" />
              <GeliosLogo className="w-6 h-4 ml-0.5" />
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.18em] font-semibold ml-1">
                {t("header.jvByline")}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ============== HERO ============== */}
      <section
        id="hero"
        className="relative pt-12 md:pt-16 pb-16 md:pb-24 overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(38_92%_88%/0.6),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,hsl(38_92%_30%/0.25),transparent_60%)]" />

        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-center">
            {/* Left — copy + form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="order-2 md:order-1"
            >
              <span className="fa-pill fa-pill-amber" data-testid="badge-trust">
                <IconCompass size={14} />
                {t("badge.trust")}
              </span>

              <h1
                className="fa-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.05]"
                data-testid="text-headline"
              >
                {t("hero.headline1")}{" "}
                <span className="text-primary">{t("hero.reality")}</span>{" "}
                {t("hero.or")}{" "}
                <span className="text-muted-foreground/70">{t("hero.fantasy")}</span>
                {t("hero.questionMark")}
              </h1>

              <div
                className="flex items-center gap-3 flex-wrap mt-5 text-sm text-muted-foreground"
                data-testid="text-emotional-hook"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t("hero.earlyRetirement")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                  {t("hero.luxuriousLifestyle")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky" />
                  {t("hero.zeroMoneyStress")}
                </span>
              </div>

              <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-xl leading-relaxed" data-testid="text-subheadline">
                {t("hero.subheadline", { interpolation: { escapeValue: false } })
                  .split("<bold>")
                  .map((part, i) => {
                    if (i === 0) return part;
                    const [bold, rest] = part.split("</bold>");
                    return (
                      <span key={i}>
                        <span className="font-semibold text-foreground">{bold}</span>
                        {rest}
                      </span>
                    );
                  })}
              </p>

              {/* Form card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="fa-surface-cream rounded-3xl p-6 md:p-7 mt-7 max-w-xl"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2 block">
                      {t("inputCard.whereDoYouLive")}
                    </label>
                    <Select value={selectedCountry} onValueChange={handleCountrySelect}>
                      <SelectTrigger data-testid="select-country" className="h-12 rounded-xl bg-card border-border">
                        <SelectValue placeholder={t("inputCard.selectCountry")}>
                          <span className="flex items-center gap-2">
                            <span className="text-lg leading-none">{countryToFlag(selectedCountry)}</span>
                            {selectedCountry}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            <span className="flex items-center gap-2">
                              <span className="text-lg leading-none">{countryToFlag(country)}</span>
                              {country}
                            </span>
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
                      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2 block">
                        {t("inputCard.currencyLabel", {
                          currency: SUPPORTED_CURRENCIES[selectedCurrency]?.name,
                        })}
                      </label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger data-testid="select-currency" className="h-12 rounded-xl bg-card border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                            <SelectItem key={code} value={code}>
                              {info.symbol} {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                        {t("inputCard.incomeQuestion")}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="cursor-help touch-manipulation"
                            data-testid="button-inflation-info"
                            aria-label="Inflation information"
                          >
                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="max-w-xs text-xs leading-relaxed p-3">
                          <p className="font-semibold mb-1">{t("inputCard.inflationTitle")}</p>
                          <p>{t("inputCard.inflationText", { symbol: currencySymbol })}</p>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 font-semibold text-base">
                        {currencySymbol}
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={defaultPlaceholder}
                        value={desiredIncome}
                        onChange={handleIncomeChange}
                        className="pl-11 text-lg h-12 rounded-xl bg-card border-border"
                        data-testid="input-desired-income"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{t("inputCard.inflationNote")}</p>
                  </div>

                  <button
                    className="premium-cta premium-cta-lg w-full"
                    onClick={handleStart}
                    disabled={!selectedCountry}
                    data-testid="button-start-journey"
                  >
                    {t("inputCard.cta")}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t("inputCard.privacyNote")}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — hero illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="order-1 md:order-2 relative"
            >
              <HeroSummit className="w-full max-w-[520px] mx-auto fa-float" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== INSTITUTIONAL TRUST ============== */}
      <section className="py-16 md:py-20 bg-card border-y border-card-border">
        <div className="max-w-5xl mx-auto px-5">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="fa-pill fa-pill-mint mb-4">
                <IconPillars size={14} />
                {t("institutional.teamLabel")}
              </span>
              <h2 className="fa-display text-3xl md:text-4xl mt-3" data-testid="text-section-institutional">
                {t("institutional.title")}
              </h2>
              <p className="text-lg italic text-muted-foreground mt-3">{t("institutional.subtitle")}</p>
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                {t("institutional.description")}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <LiveImpactBar />
          </AnimatedSection>

          <AnimatedSection>
            <div className="mt-12 max-w-3xl mx-auto grid sm:grid-cols-3 gap-4" data-testid="steps-overview">
              {[
                { label: t("institutional.step1Label"), text: t("institutional.step1Text") },
                { label: t("institutional.step2Label"), text: t("institutional.step2Text") },
                { label: t("institutional.step3Label"), text: t("institutional.step3Text") },
              ].map((step) => (
                <div key={step.label} className="flex items-start gap-3 fa-card p-4">
                  <div className="w-7 h-7 rounded-full bg-mint/15 grid place-items-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-mint" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{step.label}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="text-center mt-10">
              <button
                className="premium-cta premium-cta-lg"
                onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-start-now"
              >
                {t("institutional.startNow")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============== RESULTS PREVIEW ============== */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <AnimatedSection>
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <span className="fa-pill fa-pill-sky mb-4">
                <IconBars size={14} />
                Preview
              </span>
              <h2 className="fa-display text-3xl md:text-4xl mt-3" data-testid="text-section-preview">
                {t("preview.title")}
              </h2>
              <p className="text-muted-foreground mt-3">{t("preview.subtitle")}</p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative max-w-3xl mx-auto" data-testid="preview-device-frame">
              <ResultsPreview />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("preview.badge")}
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============== 3-STEP JOURNEY ============== */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-6xl mx-auto px-5">
          <AnimatedSection>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="fa-pill fa-pill-amber mb-4">
                <IconCompass size={14} />
                {t("journey.step1Badge")}
              </span>
              <h2 className="fa-display text-3xl md:text-4xl mt-3" data-testid="text-section-journey">
                {t("journey.title")}
              </h2>
              <p className="text-muted-foreground mt-3">{t("journey.subtitle")}</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-[45%_1fr] gap-8 md:gap-12">
            <div>
              <AnimatedSection>
                <div className="md:sticky md:top-24 relative rounded-3xl overflow-hidden shadow-xl shadow-black/10">
                  <img
                    src={lifestyleImage}
                    alt="Living your dream lifestyle"
                    className="w-full h-auto object-cover"
                    data-testid="img-journey-lifestyle"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/15 to-transparent pointer-events-none" />
                </div>
              </AnimatedSection>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute left-[28px] top-[60px] bottom-[60px] w-[2px] bg-gradient-to-b from-primary/60 via-primary/30 to-mint/30 z-0" />

              <div className="space-y-5">
                {/* Step 1 — active */}
                <AnimatedSection>
                  <div className="relative flex gap-5 items-start">
                    <div className="relative z-10 shrink-0 w-14 h-14 rounded-2xl bg-background shadow-lg ring-2 ring-primary/30 grid place-items-center">
                      <IconCompass size={36} />
                    </div>
                    <div className="flex-1 fa-card p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                          {t("journey.step1Label")}
                        </span>
                        <span className="fa-pill fa-pill-amber">
                          <Sparkles className="w-3 h-3" />
                          {t("journey.step1Badge")}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-1.5" data-testid="text-step1-title">
                        {t("journey.step1Title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {t("journey.step1Text")}
                      </p>
                      <p className="text-xs font-semibold text-primary">{t("journey.step1Cta")}</p>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Step 2 — DNA */}
                <AnimatedSection>
                  <div className="relative flex gap-5 items-start">
                    <div className="relative z-10 shrink-0 w-14 h-14 rounded-2xl bg-background shadow-md ring-2 ring-sky/30 grid place-items-center">
                      <IconDNA size={36} />
                    </div>
                    <div className="flex-1 fa-card p-5 opacity-90">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {t("journey.step2Label")}
                        </span>
                        <span className="fa-pill fa-pill-sky">
                          <Lock className="w-3 h-3" />
                          {t("journey.step2Badge")}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-1.5 text-muted-foreground" data-testid="text-step2-title">
                        {t("journey.step2Title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {t("journey.step2Text")}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("journey.step2Cta")}</p>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Step 3 — locked */}
                <AnimatedSection>
                  <div className="relative flex gap-5 items-start">
                    <div className="relative z-10 shrink-0 w-14 h-14 rounded-2xl bg-background shadow-md ring-1 ring-border grid place-items-center">
                      <IconTarget size={36} />
                    </div>
                    <div className="flex-1 fa-card p-5 opacity-90">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {t("journey.step3Label")}
                        </span>
                        <span className="fa-pill bg-muted text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          {t("journey.step3Badge")}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-1.5 text-muted-foreground" data-testid="text-step3-title">
                        {t("journey.step3Title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {t("journey.step3Text")}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("journey.step3Cta")}</p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== WHY DIFFERENT ============== */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <AnimatedSection>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="fa-display text-3xl md:text-4xl" data-testid="text-section-why">
                {t("whyDifferent.title")}
              </h2>
              <p className="text-muted-foreground mt-3">{t("whyDifferent.subtitle")}</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-5">
            <AnimatedSection>
              <div className="fa-card p-6 h-full">
                <IconMagnifier size={56} className="mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">{t("whyDifferent.bias.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("whyDifferent.bias.text")}</p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="fa-card p-6 h-full relative">
                <div className="relative w-fit mb-4">
                  <IconShield size={56} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-mint animate-signal-pulse" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{t("whyDifferent.data.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("whyDifferent.data.text1")} {t("whyDifferent.data.text2")} {t("whyDifferent.data.text3")}{" "}
                  <span className="font-semibold text-foreground">{t("whyDifferent.data.text4")}</span>{" "}
                  {t("whyDifferent.data.text5")}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="fa-card p-6 h-full relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative z-10">
                  <IconLightbulb size={56} className="mb-4" />
                  <h3 className="font-serif text-xl font-bold mb-2">{t("whyDifferent.logic.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("whyDifferent.logic.text")}</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-6xl mx-auto px-5">
          <AnimatedSection>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="fa-display text-3xl md:text-4xl" data-testid="text-section-how">
                {t("howItWorks.title")}
              </h2>
              <p className="text-muted-foreground mt-3">{t("howItWorks.subtitle")}</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { Icon: IconCompass, label: t("howItWorks.step1Label"), title: t("howItWorks.step1Title"), text: t("howItWorks.step1Text") },
              { Icon: IconBars, label: t("howItWorks.step2Label"), title: t("howItWorks.step2Title"), text: t("howItWorks.step2Text") },
              { Icon: IconDiploma, label: t("howItWorks.step3Label"), title: t("howItWorks.step3Title"), text: t("howItWorks.step3Text") },
            ].map(({ Icon, label, title, text }) => (
              <AnimatedSection key={label}>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 grid place-items-center">
                    <Icon size={72} />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2 tracking-widest uppercase">{label}</div>
                  <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============== COMING SOON ============== */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <AnimatedSection>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="fa-display text-3xl md:text-4xl" data-testid="text-section-coming-soon">
                {t("comingSoon.title")}
              </h2>
              <p className="text-muted-foreground mt-3">{t("comingSoon.subtitle")}</p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                Icon: IconDiploma,
                title: t("comingSoon.guides.title"),
                badge: t("comingSoon.guides.badge"),
                text: t("comingSoon.guides.text"),
              },
              {
                Icon: IconGrowth,
                title: t("comingSoon.insights.title"),
                badge: t("comingSoon.insights.badge"),
                text: t("comingSoon.insights.text"),
              },
              {
                Icon: IconLightbulb,
                title: t("comingSoon.tips.title"),
                badge: t("comingSoon.tips.badge"),
                text: t("comingSoon.tips.text"),
              },
            ].map(({ Icon, title, badge, text }) => (
              <AnimatedSection key={title}>
                <div className="fa-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon size={48} />
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {badge}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============== PERSONAL NOTE ============== */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-5xl mx-auto px-5">
          <AnimatedSection>
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 fa-card p-6 md:p-10 overflow-hidden">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center shrink-0">
                    <IconSummit size={36} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold" data-testid="text-personal-message">
                      {t("personalNote.title")}
                    </h3>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold mt-1">
                      {t("personalNote.subtitle")}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t("personalNote.text1")}</p>
                  <p>{t("personalNote.text2")}</p>
                  <p className="font-medium text-foreground">{t("personalNote.text3")}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <svg viewBox="0 0 200 50" className="w-32 h-8 text-foreground/40" aria-label="Team signature">
                    <path
                      d="M10 35 Q20 10 35 30 Q45 45 55 25 Q60 15 70 30 Q75 38 80 28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M90 35 Q100 15 110 30 Q115 38 125 20 Q130 12 140 28 Q145 35 155 25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-xs text-muted-foreground mt-1 italic">{t("personalNote.teamSignature")}</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-mint/10 shadow-md">
                  <img
                    src={teamPortrait}
                    alt="The FinkSmart founding team"
                    className="w-full h-auto object-contain"
                    data-testid="img-team-portrait"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============== BOTTOM CTA ============== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,hsl(38_92%_88%/0.6),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,hsl(38_92%_30%/0.2),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-5 text-center">
          <AnimatedSection>
            <div className="w-16 h-16 mx-auto mb-6 grid place-items-center">
              <IconCompound size={64} />
            </div>
            <h2 className="fa-display text-3xl md:text-4xl mb-4" data-testid="text-cta-bottom">
              {t("bottomCta.title")}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">{t("bottomCta.subtitle")}</p>
            <button
              className="premium-cta premium-cta-lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-testid="button-cta-bottom"
            >
              {t("bottomCta.button")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("bottomCta.privacy")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center mb-6">
            <img src={finksmartLogo} alt="FinkSmart" className="h-9 w-auto" />
          </div>
          <div className="mb-6">
            <JointVentureFooter tagline={t("jv.tagline")} />
          </div>
          <p className="text-xs text-muted-foreground">{t("footer.poweredBy")}</p>
          <p className="text-xs text-muted-foreground mt-1">finksmart.com</p>
          <div className="mt-6 pt-4 border-t border-border max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] text-foreground/70 font-semibold leading-relaxed">
              {t("disclaimer.short")}
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{t("footer.disclaimer")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
