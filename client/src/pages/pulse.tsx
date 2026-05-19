/**
 * FinkSmart Pulse — institutional version of the weekly market review.
 *
 * Soft gate (Phase 1):
 *   - The page header, dek, week label, and edition number are visible.
 *   - A signup banner sits between the dek and the iframe.
 *   - Until a `fink_pulse_subscribed` cookie is present, the iframe is
 *     overlaid with a dimmed scrim + signup CTA after a teaser height.
 *   - Subscribers see the full embedded HTML.
 *
 * Phase 2 will replace the local cookie with a server-issued JWT-style
 * token after email confirmation. For now the cookie is set client-side
 * once the user clicks "I've subscribed" (this is intentionally
 * lightweight — soft gates are about converting interested readers, not
 * security).
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Lock, Sun, Moon } from "lucide-react";

import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import {
  RealSmartLogo,
  GeliosLogo,
  JointVentureFooter,
} from "@/components/illustrations/JointVenture";
import { ISSUES, latestIssue, findIssue, type Issue, type Lang } from "@/research/catalog";

const COOKIE_NAME = "fink_pulse_subscribed";

function hasSubscriberCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

function setSubscriberCookie() {
  if (typeof document === "undefined") return;
  const days = 90;
  const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${days * 86400}; expires=${exp}; SameSite=Lax`;
}

function useViewerLang(): [Lang, (l: Lang) => void] {
  const { i18n } = useTranslation();
  const initial: Lang = (i18n.language ?? "fr").toLowerCase().startsWith("en") ? "en" : "fr";
  const [lang, setLang] = useState<Lang>(initial);
  return [lang, setLang];
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function PulsePage() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useViewerLang();
  const [subscribed, setSubscribed] = useState<boolean>(hasSubscriberCookie());

  // Read /pulse/:date from the URL.
  const path = typeof window !== "undefined" ? window.location.pathname : "/pulse";
  const match = path.match(/^\/pulse\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/?$/);
  const viewerDate = match?.[1];
  const viewerIssue = viewerDate ? findIssue(viewerDate) : undefined;

  // Bounce back to /pulse index if URL is invalid.
  useEffect(() => {
    if (viewerDate && !viewerIssue) navigate("/pulse");
  }, [viewerDate, viewerIssue, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader theme={theme} toggleTheme={toggleTheme} />
      {viewerIssue ? (
        <IssueViewer
          issue={viewerIssue}
          lang={lang}
          setLang={setLang}
          subscribed={subscribed}
          onSubscribed={() => {
            setSubscriberCookie();
            setSubscribed(true);
          }}
        />
      ) : (
        <Index lang={lang} setLang={setLang} subscribed={subscribed} />
      )}
      <SiteFooter />
    </div>
  );
}

/* ─────────────────────────── Header / Footer ─────────────────────────── */

function SiteHeader({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 md:bg-background/85 md:backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <img src={finksmartLogo} alt="FinkSmart" className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="hidden sm:inline-flex px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Accueil
          </Link>
          <Link
            href="/marche"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Marché
          </Link>
          <Link
            href="/pulse"
            className="px-3 py-2 rounded-md text-primary font-semibold border-b-2 border-primary -mb-[1px]"
            aria-current="page"
          >
            Pulse
          </Link>
          <Link
            href="/learn"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Apprendre
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <RealSmartLogo className="w-5 h-5" />
            <GeliosLogo className="w-6 h-4 ml-0.5" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="py-10 border-t border-border text-center">
      <div className="flex items-center justify-center mb-5">
        <img src={finksmartLogo} alt="FinkSmart" className="h-7 w-auto" />
      </div>
      <div className="mb-5">
        <JointVentureFooter />
      </div>
      <p className="text-[10px] text-muted-foreground">finksmart.com</p>
    </footer>
  );
}

/* ─────────────────────────── Index view ─────────────────────────── */

function Index({
  lang,
  setLang,
  subscribed,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  subscribed: boolean;
}) {
  const featured = latestIssue();
  const archive = ISSUES.slice(1).filter((i) => i.pulse);

  return (
    <>
      {/* Hero — institutional positioning */}
      <section className="bg-foreground text-background py-14 md:py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold opacity-60">
                ✦ FinkSmart Institutional Research Desk
              </p>
              <LangToggle lang={lang} onChange={setLang} dark />
            </div>
            <h1 className="fa-display text-3xl md:text-5xl leading-[1.05] mb-4">
              {lang === "fr" ? "Le Pulse Hebdomadaire" : "The Weekly Pulse"}
            </h1>
            <p className="opacity-85 text-base md:text-lg leading-relaxed max-w-2xl mb-7">
              {lang === "fr"
                ? "Analyse cross-asset, régime macro, scénarios pondérés. Chaque vendredi, pour conseillers, family offices, gérants d'actifs et journalistes."
                : "Cross-asset analysis, macro regime, weighted scenarios. Every Friday, for advisers, family offices, asset managers, and journalists."}
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl">
              <Pillar
                label={lang === "fr" ? "5 desks" : "5 desks"}
                text={
                  lang === "fr"
                    ? "Macro · Actions · Taux · FX/Commos · Crypto"
                    : "Macro · Equities · Rates · FX/Commodities · Crypto"
                }
              />
              <Pillar
                label={lang === "fr" ? "Risk Committee" : "Risk Committee"}
                text={
                  lang === "fr"
                    ? "Synthèse cross-asset & scénarios pondérés"
                    : "Cross-asset synthesis & weighted scenarios"
                }
              />
              <Pillar
                label={lang === "fr" ? "Gouvernance" : "Governance"}
                text={
                  lang === "fr"
                    ? "Constitution, protocole de validation, check-list pré-publication"
                    : "Research Constitution, validation protocol, pre-publication checklist"
                }
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest issue */}
      {featured.pulse && (
        <section className="py-14 border-b border-border">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-3">
              {lang === "fr" ? "Dernière édition" : "Latest edition"} · {featured.weekLabel[lang]}
            </p>
            <h2 className="fa-display text-2xl md:text-4xl leading-tight mb-4">
              {featured.pulse.headline[lang]}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mb-6 border-l-2 border-primary/40 pl-4">
              {featured.pulse.dek[lang]}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/pulse/${featured.date}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                {subscribed
                  ? lang === "fr"
                    ? "Lire l'édition"
                    : "Read this edition"
                  : lang === "fr"
                  ? "Aperçu + s'abonner"
                  : "Preview + subscribe"}{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {featured.human && (
                <Link
                  href={`/marche/${featured.date}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-semibold hover:bg-muted/50 transition-colors"
                >
                  {lang === "fr" ? "Version accessible" : "Accessible version"}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Archive */}
      {archive.length > 0 && (
        <section className="py-14">
          <div className="max-w-5xl mx-auto px-5">
            <h2 className="fa-display text-2xl mb-7">
              {lang === "fr" ? "Numéros précédents" : "Previous editions"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {archive.map((iss) => (
                <ArchiveCard key={iss.date} issue={iss} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Pillar({ label, text }: { label: string; text: string }) {
  return (
    <div className="border-l-2 border-primary/40 pl-3">
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-60 mb-1">
        {label}
      </p>
      <p className="text-xs opacity-80 leading-snug">{text}</p>
    </div>
  );
}

function ArchiveCard({ issue, lang }: { issue: Issue; lang: Lang }) {
  const meta = issue.pulse;
  if (!meta) return null;
  return (
    <Link
      href={`/pulse/${issue.date}`}
      className="block fa-card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-2">
        {issue.weekLabel[lang]}
      </p>
      <h3 className="font-serif text-lg font-bold leading-snug mb-2">
        {meta.headline[lang]}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {meta.dek[lang]}
      </p>
      <p className="text-xs font-semibold text-primary inline-flex items-center gap-1 mt-3">
        {lang === "fr" ? "Lire" : "Read"} <ArrowRight className="w-3 h-3" />
      </p>
    </Link>
  );
}

function LangToggle({
  lang,
  onChange,
  dark = false,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
  dark?: boolean;
}) {
  const base = dark
    ? "border-white/20 bg-white/5"
    : "border-border bg-card";
  const active = dark
    ? "bg-primary text-primary-foreground"
    : "bg-primary text-primary-foreground";
  const inactive = dark
    ? "text-white/60 hover:text-white"
    : "text-muted-foreground hover:text-foreground";
  return (
    <div className={`inline-flex rounded-full border overflow-hidden text-xs font-semibold ${base}`}>
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-3 py-1.5 transition-colors ${l === lang ? active : inactive}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Issue viewer (soft gate) ─────────────────────────── */

function IssueViewer({
  issue,
  lang,
  setLang,
  subscribed,
  onSubscribed,
}: {
  issue: Issue;
  lang: Lang;
  setLang: (l: Lang) => void;
  subscribed: boolean;
  onSubscribed: () => void;
}) {
  const meta = issue.pulse;
  const src = meta?.files[lang] ?? meta?.files.fr ?? meta?.files.en;
  const idx = ISSUES.findIndex((i) => i.date === issue.date);
  const prev = ISSUES.slice(idx + 1).find((i) => i.pulse);
  const next = ISSUES.slice(0, idx).reverse().find((i) => i.pulse);

  return (
    <>
      {/* Header band */}
      <section className="bg-foreground text-background border-b border-border">
        <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <Link
              href="/pulse"
              className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {lang === "fr" ? "Toutes les éditions" : "All editions"}
            </Link>
            <LangToggle lang={lang} onChange={setLang} dark />
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold opacity-60 mb-3">
            ✦ {lang === "fr" ? "Pulse hebdomadaire" : "Weekly Pulse"} · {issue.weekLabel[lang]}
          </p>
          <h1 className="fa-display text-3xl md:text-4xl leading-tight mb-4">
            {meta?.headline[lang]}
          </h1>
          <p className="opacity-85 text-base leading-relaxed max-w-3xl border-l-2 border-primary/50 pl-4">
            {meta?.dek[lang]}
          </p>
        </div>
      </section>

      {/* Soft gate signup banner (only when not yet subscribed) */}
      {!subscribed && <SignupBanner lang={lang} onSubscribed={onSubscribed} />}

      {/* Embedded Pulse — wrapped in scrim if not subscribed */}
      <section className="bg-background relative">
        {src ? (
          <div className="relative">
            <iframe
              key={src}
              src={src}
              title={meta?.headline[lang] ?? "Pulse"}
              className="block w-full border-0"
              style={{
                height: subscribed ? "calc(100vh - 80px)" : "640px",
                minHeight: "640px",
              }}
            />
            {!subscribed && <ScrimOverlay lang={lang} onSubscribed={onSubscribed} />}
          </div>
        ) : (
          <p className="text-center py-20 text-muted-foreground">
            {lang === "fr" ? "Édition indisponible." : "Edition unavailable."}
          </p>
        )}
      </section>

      {/* Open-in-tab + prev/next */}
      <section className="py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {prev && (
              <Link
                href={`/pulse/${prev.date}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-muted/50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {prev.weekLabel[lang]}
              </Link>
            )}
            {next && (
              <Link
                href={`/pulse/${next.date}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-muted/50"
              >
                {next.weekLabel[lang]} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          {subscribed && src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-muted/50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {lang === "fr" ? "Ouvrir dans un nouvel onglet" : "Open in new tab"}
            </a>
          )}
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── Signup UI ─────────────────────────── */

function SignupBanner({ lang, onSubscribed }: { lang: Lang; onSubscribed: () => void }) {
  return (
    <section className="bg-primary/8 border-b border-primary/20 py-6">
      <div className="max-w-3xl mx-auto px-5">
        <SignupForm lang={lang} onSubscribed={onSubscribed} variant="banner" />
      </div>
    </section>
  );
}

function ScrimOverlay({ lang, onSubscribed }: { lang: Lang; onSubscribed: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-72 pointer-events-none">
      {/* Fade-out gradient from transparent → background to hide the cut */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background" />
      <div className="absolute inset-x-0 bottom-0 pointer-events-auto">
        <div className="max-w-3xl mx-auto px-5 pb-10">
          <div className="fa-card p-6 md:p-7 text-center shadow-lg">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary mb-2">
              ✦ {lang === "fr" ? "Lecture institutionnelle" : "Institutional reading"}
            </p>
            <h3 className="fa-display text-xl md:text-2xl mb-2">
              {lang === "fr"
                ? "Continuez votre lecture"
                : "Continue reading"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {lang === "fr"
                ? "L'aperçu reste libre. Abonnez-vous (gratuit) pour le détail des desks, les scénarios pondérés et la matrice de risque."
                : "The preview stays free. Subscribe (free) for desk-by-desk detail, weighted scenarios, and the risk matrix."}
            </p>
            <SignupForm lang={lang} onSubscribed={onSubscribed} variant="modal" />
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLES = [
  { id: "adviser", fr: "Conseiller financier", en: "Financial adviser" },
  { id: "wealth_manager", fr: "Gérant d'actifs / wealth manager", en: "Asset / wealth manager" },
  { id: "family_office", fr: "Family office", en: "Family office" },
  { id: "journalist", fr: "Journaliste", en: "Journalist" },
  { id: "individual", fr: "Investisseur particulier averti", en: "Sophisticated individual investor" },
  { id: "other", fr: "Autre", en: "Other" },
] as const;

function SignupForm({
  lang,
  onSubscribed,
  variant,
}: {
  lang: Lang;
  onSubscribed: () => void;
  variant: "banner" | "modal";
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("adviser");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading =
    variant === "banner"
      ? lang === "fr"
        ? "Recevez le Pulse chaque vendredi"
        : "Get the Pulse every Friday"
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      // Phase 2 will replace this with a real /api/pulse-subscribe call
      // that persists the lead with leadStatus="pulse_subscriber" + role,
      // sends a confirmation email, and sets an HMAC-signed cookie. For
      // now we set a local cookie and unlock the iframe — the soft gate
      // is intentionally simple.
      onSubscribed();
      setSubmitted(true);
    } catch (err) {
      setError(
        lang === "fr"
          ? "Une erreur est survenue. Réessayez."
          : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-mint-foreground font-semibold">
        {lang === "fr"
          ? "✓ Lecture débloquée. Vous recevrez les prochains numéros par email dès leur publication."
          : "✓ Reading unlocked. You'll receive future editions by email when they ship."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {heading && (
        <p className="text-sm font-semibold text-foreground text-center md:text-left">
          {heading}
        </p>
      )}
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="email"
          required
          placeholder={lang === "fr" ? "Votre email professionnel" : "Your work email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          data-testid="pulse-email"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          data-testid="pulse-role"
        >
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r[lang]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting || !email.trim() || !consent}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="pulse-submit"
        >
          {submitting
            ? lang === "fr"
              ? "…"
              : "…"
            : lang === "fr"
            ? "S'abonner"
            : "Subscribe"}
        </button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
          data-testid="pulse-consent"
        />
        <span>
          {lang === "fr"
            ? "J'accepte de recevoir le Pulse hebdomadaire par email. Désinscription en 1 clic, données jamais revendues."
            : "I agree to receive the Weekly Pulse by email. One-click unsubscribe, data never sold."}
        </span>
      </label>
      {error && <p className="text-xs text-coral">{error}</p>}
    </form>
  );
}
