/**
 * LearnHint — small inline cross-link to a specific Apprendre module.
 *
 * Two flavours:
 *   <LearnHint slug="..." />               → pill: "Apprendre →"
 *   <LearnHint slug="..." compact />       → just an info icon (44×44 hit area)
 *   <LearnHint slug="..." label="..." />   → custom label
 *
 * Always navigates client-side via wouter. Kept dependency-free (just
 * lucide-react + existing Tailwind tokens) so it slots into any section
 * without bringing extra context.
 */
import { Link } from "wouter";
import { Info, ArrowRight } from "lucide-react";

export type LearnSlug =
  | "argent-et-toi-se-connaitre"
  | "freedom-age-module"
  | "pourquoi-marches-baissent"
  | "fiscalite-placements"
  | "questions-conseiller-financier"
  | "glacier-playbook"
  | "tempere-equilibre"
  | "tropical-playbook"
  | "volcan-opportuniste"
  | "age-liberte-financiere"
  | "cest-quoi-investir";

interface Props {
  slug: LearnSlug;
  /** Show as just an info icon (no text). */
  compact?: boolean;
  /** Override the default "Apprendre →" / "Learn more →" label. */
  label?: string;
  className?: string;
  testId?: string;
}

export default function LearnHint({ slug, compact, label, className = "", testId }: Props) {
  if (compact) {
    return (
      <Link
        href={`/learn/${slug}`}
        className={`inline-flex w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors items-center justify-center ${className}`}
        title={label ?? "En savoir plus"}
        aria-label={label ?? "En savoir plus"}
        data-testid={testId ?? `learn-hint-${slug}`}
      >
        <Info className="w-3.5 h-3.5" />
      </Link>
    );
  }
  return (
    <Link
      href={`/learn/${slug}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors ${className}`}
      data-testid={testId ?? `learn-hint-${slug}`}
    >
      <Info className="w-3 h-3" />
      {label ?? "Apprendre"}
      <ArrowRight className="w-3 h-3" />
    </Link>
  );
}
