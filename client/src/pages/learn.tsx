/**
 * Apprendre — FinkSmart Academy.
 *
 * Reads the .md files in client/src/academy/{content,blog}/ at build time
 * (Vite's `?raw` import), extracts the bits of frontmatter we need, and
 * renders the module the user picks. Everything that's visual reuses the
 * existing tokens (amber primary, mint/sky/coral, Fraunces display, fa-*
 * utility classes). No new colors, no new fonts.
 *
 * Climate → palette mapping (no new tokens, just compositions of existing ones):
 *   glacier  → sky        (cool / blue)
 *   tempere  → mint       (balanced / green)
 *   tropical → primary    (amber, warm)
 *   volcan   → coral      (intense)
 *   all      → violet-500 (kept for "fondamentaux"; soft purple, available
 *                          via Tailwind out of the box without new tokens)
 */
import { useMemo, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiFacebook, SiLinkedin, SiX } from "react-icons/si";
import { Link2, Check, Sun, Moon, ArrowRight } from "lucide-react";

import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import {
  RealSmartLogo,
  GeliosLogo,
  JointVentureFooter,
} from "@/components/illustrations/JointVenture";

// Eagerly bundle every markdown file as raw text.
const moduleFiles = import.meta.glob("../academy/content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const blogFiles = import.meta.glob("../academy/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/* ─────────────────────────── Types & parsing ─────────────────────────── */

type Climate = "glacier" | "tempere" | "tropical" | "volcan" | "all";
type Kind = "module" | "article";

interface Article {
  slug: string;
  kind: Kind;
  climate: Climate;
  topic: string;
  minutes: number;
  title: string;
  body: string;
  ctaLabel: string;
  ctaAction: "diagnostic" | "matching" | "next_module" | "external";
}

/**
 * Strip the YAML frontmatter and a single leading `# title` so that the
 * page can render the title in its own typography. Returns the body to
 * feed to ReactMarkdown.
 */
function splitFrontmatter(raw: string): { fm: string; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n*([\s\S]*)$/);
  if (!m) return { fm: "", body: raw };
  // also drop a leading `# title` line if present (we render our own header)
  let body = m[2].replace(/^#\s+[^\n]+\n+/, "");
  return { fm: m[1], body };
}

/** Tiny YAML reader — only what we actually need from the frontmatter. */
function pickField(fm: string, key: string): string | undefined {
  // Flat `key: value`
  const flat = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(fm);
  if (flat) return flat[1].replace(/^["']|["']$/g, "").trim();
  return undefined;
}
function pickNested(fm: string, parent: string, child: string): string | undefined {
  // Matches a block like:  parent:\n   child: value\n
  const re = new RegExp(`^${parent}:\\s*\\n((?:[ \\t]+.*\\n?)+)`, "m");
  const block = re.exec(fm);
  if (!block) return undefined;
  return pickField(block[1], child);
}

function parseArticle(raw: string, kind: Kind): Article {
  const { fm, body } = splitFrontmatter(raw);
  const slug = pickField(fm, "slug") ?? "untitled";
  const climateRaw = (pickField(fm, "climate") ?? "all") as Climate;
  const climate: Climate = ["glacier", "tempere", "tropical", "volcan", "all"].includes(climateRaw)
    ? climateRaw
    : "all";
  const topic = pickField(fm, "topic") ?? (kind === "article" ? "Article" : "General");
  const minutes = Number(pickField(fm, "estimated_read_minutes") ?? 5);
  const title = pickNested(fm, "title", "fr") ?? slug;
  const ctaLabel = pickNested(fm, "label", "fr") ?? "Faire le diagnostic";
  const ctaActionRaw = (pickField(fm, "action") ?? "next_module").toLowerCase();
  const ctaAction: Article["ctaAction"] = ctaActionRaw.includes("match")
    ? "matching"
    : ctaActionRaw.includes("diag")
    ? "diagnostic"
    : ctaActionRaw.includes("ext")
    ? "external"
    : "next_module";

  return { slug, kind, climate, topic, minutes, title, body, ctaLabel, ctaAction };
}

/* ─────────────────────────── Catalog ─────────────────────────── */

const MODULES: Article[] = Object.entries(moduleFiles)
  .map(([, raw]) => parseArticle(raw, "module"))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const ARTICLES: Article[] = Object.entries(blogFiles)
  .map(([, raw]) => parseArticle(raw, "article"))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const ALL: Article[] = [...MODULES, ...ARTICLES];

const PROFILE_CLIMATES: Climate[] = ["glacier", "tempere", "tropical", "volcan"];
const FUNDAMENTALS = MODULES.filter((m) => m.climate === "all");
const BY_PROFILE = PROFILE_CLIMATES.flatMap((c) => MODULES.filter((m) => m.climate === c));

/* ─────────────────────────── Climate styling helpers ─────────────────────────── */

const climateLabel: Record<Climate, string> = {
  glacier: "❄️ Glacier",
  tempere: "🌿 Tempéré",
  tropical: "🌴 Tropical",
  volcan: "🌋 Volcan",
  all: "✦ Tous Climats",
};

/** Dot color for sidebar items. Uses inline style for the violet (all), which
 *  is the one shade not living as a token in the existing CSS. */
function climateDotStyle(c: Climate): React.CSSProperties {
  switch (c) {
    case "glacier":
      return { backgroundColor: "hsl(var(--sky))" };
    case "tempere":
      return { backgroundColor: "hsl(var(--mint))" };
    case "tropical":
      return { backgroundColor: "hsl(var(--primary))" };
    case "volcan":
      return { backgroundColor: "hsl(var(--coral))" };
    default:
      return { backgroundColor: "rgb(139 92 246)" }; // violet-500
  }
}

function climateTagClass(c: Climate): string {
  switch (c) {
    case "glacier":
      return "bg-sky/15 text-sky-foreground/90 dark:text-sky";
    case "tempere":
      return "bg-mint/15 text-mint-foreground/90 dark:text-mint";
    case "tropical":
      return "bg-primary/15 text-primary";
    case "volcan":
      return "bg-coral/15 text-coral-foreground/90 dark:text-coral";
    default:
      return "bg-violet-500/12 text-violet-700 dark:text-violet-300";
  }
}

function climateCardBg(c: Climate): string {
  switch (c) {
    case "glacier":
      return "bg-gradient-to-br from-sky/15 to-sky/5";
    case "tempere":
      return "bg-gradient-to-br from-mint/15 to-mint/5";
    case "tropical":
      return "bg-gradient-to-br from-primary/15 to-primary/5";
    case "volcan":
      return "bg-gradient-to-br from-coral/15 to-coral/5";
    default:
      return "bg-gradient-to-br from-violet-500/12 to-violet-500/5";
  }
}

const climateEmoji: Record<Climate, string> = {
  glacier: "❄️",
  tempere: "🌿",
  tropical: "🌴",
  volcan: "🌋",
  all: "✦",
};

/* ─────────────────────────── CTA copy per module type ─────────────────────────── */

function ctaCopy(article: Article): { label: string; action: Article["ctaAction"] } {
  // Profile playbooks → matching with a partner. Fundamentals + articles → diagnostic.
  if (PROFILE_CLIMATES.includes(article.climate)) {
    return { label: "Être mis en relation →", action: "matching" };
  }
  return { label: "Faire le diagnostic →", action: "diagnostic" };
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function LearnPage() {
  const { t: _t } = useTranslation();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Pull initial slug from URL if present, e.g. /learn/freedom-age-module
  const initialSlug = useMemo(() => {
    const path = window.location.pathname;
    const m = path.match(/^\/learn\/([^/]+)\/?$/);
    return m?.[1] ?? ALL[0]?.slug ?? "";
  }, []);

  const [activeSlug, setActiveSlug] = useState<string>(initialSlug);
  const active = useMemo(
    () => ALL.find((a) => a.slug === activeSlug) ?? ALL[0],
    [activeSlug]
  );

  // Keep the URL in sync without a full reload (wouter doesn't re-render
  // when we just call history.replaceState, but that's fine for our use).
  useEffect(() => {
    if (!active) return;
    const desired = `/learn/${active.slug}`;
    if (window.location.pathname !== desired) {
      window.history.replaceState({}, "", desired);
    }
    // scroll the article into view on slug change (not on first paint)
    document
      .querySelector("[data-learn-main]")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active]);

  const breadcrumbSection = active
    ? PROFILE_CLIMATES.includes(active.climate)
      ? "Par profil"
      : active.kind === "article"
      ? "Articles"
      : "Fondamentaux"
    : "";

  const cta = active ? ctaCopy(active) : { label: "", action: "diagnostic" as const };

  function handleCta() {
    if (!active) return;
    if (cta.action === "matching") {
      navigate("/results?intent=matching");
      return;
    }
    // Land on the landing-page hero so the user can set country/currency
    // first; skipping straight to /calculator would bypass that context.
    navigate("/");
    // Retry briefly until the Landing component mounts and #hero is in the DOM,
    // then smooth-scroll. ~50ms intervals up to ~1.2s ceiling.
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById("hero");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts++ < 25) {
        setTimeout(tryScroll, 50);
      }
    };
    setTimeout(tryScroll, 30);
  }

  // Recommend 4 modules other than the active one for "À lire ensuite"
  const recommended = useMemo(() => {
    if (!active) return ALL.slice(0, 4);
    const rest = ALL.filter((a) => a.slug !== active.slug);
    // Prefer same-climate first, then fundamentals, then articles
    const sameClimate = rest.filter((a) => a.climate === active.climate);
    const fundamentals = rest.filter((a) => a.climate === "all" && a.kind === "module");
    const articles = rest.filter((a) => a.kind === "article");
    const seen = new Set<string>();
    const out: Article[] = [];
    for (const list of [sameClimate, fundamentals, articles, rest]) {
      for (const m of list) {
        if (out.length >= 4) break;
        if (seen.has(m.slug)) continue;
        seen.add(m.slug);
        out.push(m);
      }
      if (out.length >= 4) break;
    }
    return out;
  }, [active]);

  /* ── Share helpers ────────────────────────────────────────────── */
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/learn/${active?.slug ?? ""}`
      : "";
  const shareTitle = active?.title ?? "FinkSmart Academy";
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  if (!active) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-muted-foreground">Aucun contenu pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header (same shape as landing.tsx) ─────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 md:bg-background/85 md:backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center" data-testid="text-brand">
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
              href="/learn"
              className="px-3 py-2 rounded-md text-primary font-semibold border-b-2 border-primary -mb-[1px]"
              data-testid="nav-learn"
              aria-current="page"
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
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Page layout (sidebar | reader | share) ────────────── */}
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-[220px_1fr_56px] gap-6 md:gap-8 pb-12">
        {/* SIDEBAR */}
        <aside className="hidden md:block sticky top-[64px] self-start max-h-[calc(100vh-72px)] overflow-y-auto py-8 pr-3 border-r border-border">
          <SidebarSection label="Fondamentaux">
            {FUNDAMENTALS.map((m) => (
              <SidebarLink
                key={m.slug}
                article={m}
                active={m.slug === active.slug}
                onSelect={setActiveSlug}
              />
            ))}
          </SidebarSection>

          <SidebarSection label="Par profil">
            {BY_PROFILE.map((m) => (
              <SidebarLink
                key={m.slug}
                article={m}
                active={m.slug === active.slug}
                onSelect={setActiveSlug}
              />
            ))}
          </SidebarSection>

          <SidebarSection label="Articles">
            {ARTICLES.map((a) => (
              <SidebarLink
                key={a.slug}
                article={a}
                active={a.slug === active.slug}
                onSelect={setActiveSlug}
              />
            ))}
          </SidebarSection>
        </aside>

        {/* MAIN READER */}
        <main className="py-8" data-learn-main>
          {/* Mobile picker — collapses sidebar into a select on small screens */}
          <div className="md:hidden mb-6">
            <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Module
            </label>
            <select
              value={active.slug}
              onChange={(e) => setActiveSlug(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <optgroup label="Fondamentaux">
                {FUNDAMENTALS.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.title}</option>
                ))}
              </optgroup>
              <optgroup label="Par profil">
                {BY_PROFILE.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.title}</option>
                ))}
              </optgroup>
              <optgroup label="Articles">
                {ARTICLES.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.title}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <motion.article
            key={active.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl"
          >
            <p className="text-xs text-muted-foreground mb-4">
              Apprendre <span className="mx-1">›</span>
              <span className="text-primary">{breadcrumbSection}</span>
            </p>

            <header className="pb-5 mb-6 border-b border-border">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`fa-pill ${climateTagClass(active.climate)}`}>
                  {climateLabel[active.climate]}
                </span>
                <span className="fa-pill bg-muted text-muted-foreground capitalize">
                  {active.topic.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="fa-display text-3xl md:text-4xl leading-tight">
                {active.title}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                ⏱ {active.minutes} min de lecture
              </p>
            </header>

            <div className="prose-academy">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {active.body}
              </ReactMarkdown>
            </div>

            {/* DIAGNOSTIC CTA BOX — uses the existing dark/inverse surface */}
            <div className="mt-10 rounded-2xl bg-foreground text-background p-7 md:p-9 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.45),transparent_60%)]"
              />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold opacity-60 mb-2">
                  ✦ {cta.action === "matching" ? "Rencontre un partenaire" : "Diagnostic interactif"}
                </p>
                <h3 className="fa-display text-2xl mb-2">
                  {cta.action === "matching"
                    ? "Rencontre un partenaire qui connaît déjà ton profil"
                    : "Découvre ton Freedom Age et ton profil"}
                </h3>
                <p className="text-sm opacity-80 mb-5 max-w-md">
                  {cta.action === "matching"
                    ? "Nos partenaires sont sélectionnés pour ton climat. Tu arrives avec ton diagnostic FinkSmart — pas de démarche à froid."
                    : "10 questions simples. 5 minutes. Ton profil climatique et ton âge de liberté financière — sans inscription."}
                </p>
                <Button
                  onClick={handleCta}
                  className="rounded-full bg-background text-foreground hover:bg-background/90 font-bold"
                  data-testid="cta-learn"
                >
                  {cta.label}
                </Button>
              </div>
            </div>
          </motion.article>
        </main>

        {/* SHARE COLUMN */}
        <aside className="hidden md:flex flex-col items-center pt-9 gap-2">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-1">
            Share
          </p>
          <ShareIcon
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            title="Facebook"
          >
            <SiFacebook className="w-3.5 h-3.5" />
          </ShareIcon>
          <ShareIcon
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            title="X / Twitter"
          >
            <SiX className="w-3.5 h-3.5" />
          </ShareIcon>
          <ShareIcon
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            title="LinkedIn"
          >
            <SiLinkedin className="w-3.5 h-3.5" />
          </ShareIcon>
          <button
            onClick={copyLink}
            title="Copier le lien"
            data-testid="copy-link"
            className="w-9 h-9 rounded-md border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors grid place-items-center"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-mint" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
        </aside>
      </div>

      {/* ── "À lire ensuite" ─────────────────────────────────── */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <h2 className="fa-display text-2xl mb-6">À lire ensuite</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map((m) => (
              <button
                key={m.slug}
                onClick={() => setActiveSlug(m.slug)}
                className="text-left rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
                data-testid={`reco-${m.slug}`}
              >
                <div className={`h-24 grid place-items-center text-3xl ${climateCardBg(m.climate)}`}>
                  {climateEmoji[m.climate]}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-1">
                    {m.kind === "article" ? "Article" : "Module"} · {m.topic}
                  </p>
                  <p className="font-bold text-sm leading-snug mb-2">{m.title}</p>
                  <p className="text-[12px] text-primary font-semibold inline-flex items-center gap-1">
                    Lire <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-10 border-t border-border text-center">
        <div className="flex items-center justify-center mb-5">
          <img src={finksmartLogo} alt="FinkSmart" className="h-7 w-auto" />
        </div>
        <div className="mb-5">
          <JointVentureFooter />
        </div>
        <p className="text-[10px] text-muted-foreground">finksmart.com</p>
      </footer>
    </div>
  );
}

/* ─────────────────────────── Subcomponents ─────────────────────────── */

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-muted-foreground px-3 pt-2.5 pb-1">
        {label}
      </p>
      {children}
    </div>
  );
}

function SidebarLink({
  article,
  active,
  onSelect,
}: {
  article: Article;
  active: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(article.slug)}
      data-testid={`sidebar-${article.slug}`}
      className={`block w-full text-left text-[13px] leading-snug py-1.5 pl-3 pr-3 border-l-2 transition-colors ${
        active
          ? "border-primary text-primary font-semibold bg-primary/5"
          : "border-transparent text-foreground/75 hover:text-foreground hover:bg-muted/40"
      }`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle -translate-y-px"
        style={climateDotStyle(article.climate)}
      />
      {article.title}
    </button>
  );
}

function ShareIcon({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-md border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors grid place-items-center"
    >
      {children}
    </a>
  );
}
