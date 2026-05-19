/**
 * Marché — public weekly market review (the Human Weekly format).
 *
 * Two views on the same route file:
 *   /marche              → catalog index (latest issue featured + archive grid)
 *   /marche/:date        → per-issue viewer (renders the static HTML in an iframe)
 *
 * The HTML files in client/public/research/marche/<date>-<lang>.html are
 * served as-is by Vercel's edge — we don't try to parse them, we embed
 * them in an iframe so the original editorial design (palette, typography,
 * GSAP animations) is preserved verbatim. SEO for individual issues comes
 * from the static HTML being directly addressable (and indexable) at the
 * Vercel public URL `/research/marche/<date>-<lang>.html`, which we link
 * to from the viewer header.
 */
import { useMemo, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Sun, Moon } from "lucide-react";

import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import {
  RealSmartLogo,
  GeliosLogo,
  JointVentureFooter,
} from "@/components/illustrations/JointVenture";
import { ISSUES, latestIssue, findIssue, type Issue, type Lang } from "@/research/catalog";

/** Resolve the lang preference for the embedded issue. We use the
 *  current i18n language; users can also toggle from the viewer header. */
function useViewerLang(): [Lang, (l: Lang) => void] {
  const { i18n } = useTranslation();
  const initial: Lang = (i18n.language ?? "fr").toLowerCase().startsWith("en") ? "en" : "fr";
  const [lang, setLang] = useState<Lang>(initial);
  return [lang, setLang];
}

/* ─────────────────────────── Catalog index ─────────────────────────── */

export default function MarchePage() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  // Read /marche/:date from the URL — wouter handles both routes through
  // this same component to avoid render flicker between them.
  const path = typeof window !== "undefined" ? window.location.pathname : "/marche";
  const match = path.match(/^\/marche\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/?$/);
  const viewerDate = match?.[1];
  const viewerIssue = viewerDate ? findIssue(viewerDate) : undefined;

  // If a date is in the URL but doesn't resolve, bounce back to the index.
  useEffect(() => {
    if (viewerDate && !viewerIssue) navigate("/marche");
  }, [viewerDate, viewerIssue, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader theme={theme} toggleTheme={toggleTheme} />
      {viewerIssue ? (
        <IssueViewer issue={viewerIssue} />
      ) : (
        <Index />
      )}
      <SiteFooter />
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

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
            data-testid="nav-home"
          >
            Accueil
          </Link>
          <Link
            href="/marche"
            className="px-3 py-2 rounded-md text-primary font-semibold border-b-2 border-primary -mb-[1px]"
            data-testid="nav-marche"
            aria-current="page"
          >
            Marché
          </Link>
          <Link
            href="/learn"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            data-testid="nav-learn"
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

function Index() {
  const [lang, setLang] = useViewerLang();
  const { t } = useTranslation();
  const featured = latestIssue();
  const archive = ISSUES.slice(1).filter((i) => i.human); // index only shows Human Weekly issues

  return (
    <>
      {/* Hero — featured (latest) Human Weekly */}
      <section className="border-b border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <span className="fa-pill fa-pill-amber">
                ✦ {lang === "fr" ? "Marché cette semaine" : "Markets this week"}
              </span>
              <LangToggle lang={lang} onChange={setLang} />
            </div>
            {featured.human ? (
              <>
                <h1 className="fa-display text-3xl md:text-5xl leading-[1.05] mb-4">
                  {featured.human.headline[lang]}
                </h1>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mb-6 border-l-2 border-primary/40 pl-4">
                  {featured.human.dek[lang]}
                </p>
                <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                  <span>
                    {lang === "fr" ? "Édition" : "Edition"}{" "}
                    <span className="font-semibold text-foreground">
                      #{featured.edition ?? "—"}
                    </span>
                  </span>
                  <span>·</span>
                  <span>{featured.weekLabel[lang]}</span>
                </div>
                <div className="mt-7 flex gap-3 flex-wrap">
                  <Link
                    href={`/marche/${featured.date}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                    data-testid="cta-read-featured"
                  >
                    {lang === "fr" ? "Lire l'édition" : "Read this edition"} <ArrowRight className="w-4 h-4" />
                  </Link>
                  {featured.pulse && (
                    <Link
                      href={`/pulse/${featured.date}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                    >
                      ✦ {lang === "fr" ? "Version institutionnelle" : "Institutional version"}
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                {lang === "fr"
                  ? "Pas d'édition publiée cette semaine."
                  : "No edition published this week."}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Archive grid */}
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

      {/* Pulse cross-link */}
      <section className="border-t border-border bg-foreground text-background py-14">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold opacity-60 mb-3">
            ✦ FinkSmart Institutional Research Desk
          </p>
          <h2 className="fa-display text-2xl md:text-3xl mb-3">
            {lang === "fr"
              ? "Vous êtes intermédiaire financier ?"
              : "Are you a financial intermediary?"}
          </h2>
          <p className="opacity-80 text-sm md:text-base mb-6 max-w-xl mx-auto">
            {lang === "fr"
              ? "Le FinkSmart Pulse livre chaque semaine la version institutionnelle — analyse cross-asset, régime macro, scénarios pondérés. Pour conseillers, family offices, et journalistes."
              : "FinkSmart Pulse delivers the institutional version each week — cross-asset analysis, macro regime, weighted scenarios. For advisers, family offices, and journalists."}
          </p>
          <Link
            href="/pulse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background text-foreground font-semibold text-sm hover:bg-background/90 transition-colors"
          >
            {lang === "fr" ? "Découvrir le Pulse" : "Discover the Pulse"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ArchiveCard({ issue, lang }: { issue: Issue; lang: Lang }) {
  const meta = issue.human;
  if (!meta) return null;
  return (
    <Link
      href={`/marche/${issue.date}`}
      className="block fa-card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
      data-testid={`archive-${issue.date}`}
    >
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-2">
        {lang === "fr" ? "Édition" : "Edition"} {issue.edition ? `#${issue.edition}` : ""} ·{" "}
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

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card overflow-hidden text-xs font-semibold">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-3 py-1.5 transition-colors ${
            l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid={`lang-${l}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Issue viewer ─────────────────────────── */

function IssueViewer({ issue }: { issue: Issue }) {
  const [lang, setLang] = useViewerLang();
  const human = issue.human;
  const src = human?.files[lang] ?? human?.files.fr ?? human?.files.en;
  // Index of the current issue in the chronological archive — for prev/next nav.
  const idx = ISSUES.findIndex((i) => i.date === issue.date);
  const prev = ISSUES.slice(idx + 1).find((i) => i.human);
  const next = ISSUES.slice(0, idx).reverse().find((i) => i.human);

  return (
    <>
      {/* Viewer toolbar */}
      <section className="border-b border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/marche"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === "fr" ? "Tous les numéros" : "All editions"}
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} onChange={setLang} />
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                title={lang === "fr" ? "Ouvrir dans un nouvel onglet" : "Open in new tab"}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Embedded issue */}
      <section className="bg-background">
        {src ? (
          <iframe
            key={src}
            src={src}
            title={human?.headline[lang] ?? "Marché"}
            className="block w-full border-0"
            style={{ height: "calc(100vh - 110px)", minHeight: "800px" }}
            data-testid="issue-iframe"
          />
        ) : (
          <p className="text-center py-20 text-muted-foreground">
            {lang === "fr" ? "Édition indisponible." : "Edition unavailable."}
          </p>
        )}
      </section>

      {/* Prev / next + Pulse cross-link */}
      <section className="py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {prev && (
              <Link
                href={`/marche/${prev.date}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {prev.weekLabel[lang]}
              </Link>
            )}
            {next && (
              <Link
                href={`/marche/${next.date}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-muted/50 transition-colors"
              >
                {next.weekLabel[lang]} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          {issue.pulse && (
            <Link
              href={`/pulse/${issue.date}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
            >
              ✦ {lang === "fr" ? "Lire la version institutionnelle" : "Read the institutional version"}
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
