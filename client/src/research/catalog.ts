/**
 * Research desk catalog — single source of truth for what's published.
 *
 * Adding a new issue:
 * 1. Drop the HTML files into `client/public/research/marche/<date>-<lang>.html`
 *    and/or `client/public/research/pulse/<date>-<lang>.html`.
 * 2. Append a new entry to `ISSUES` below.
 * 3. Keep `ISSUES` sorted with the most recent issue first.
 *
 * One file per (format, lang). Headline + dek are pulled from the
 * authored HTML and copied here so the SPA catalog index can render
 * without parsing each issue at runtime.
 */

export type Lang = "fr" | "en";

export interface IssueFormat {
  /** Public path (Vercel serves `client/public/*` from `/`). */
  files: Partial<Record<Lang, string>>;
  headline: Record<Lang, string>;
  dek: Record<Lang, string>;
}

export interface Issue {
  /** YYYY-MM-DD anchor (typically the Friday close of the covered week). */
  date: string;
  /** Display label, e.g. "12–16 mai 2026" / "May 12–16, 2026". */
  weekLabel: Record<Lang, string>;
  /** Sequential edition number for the human-weekly series. */
  edition?: number;
  /** Editorial / accessible version. May be absent for older issues. */
  human?: IssueFormat;
  /** Institutional version. May be absent for very early issues. */
  pulse?: IssueFormat;
}

/** Newest first. */
export const ISSUES: Issue[] = [
  {
    date: "2026-05-16",
    weekLabel: {
      fr: "12–16 mai 2026",
      en: "May 12–16, 2026",
    },
    edition: 19,
    human: {
      files: {
        fr: "/research/marche/2026-05-16-fr.html",
        en: "/research/marche/2026-05-16-en.html",
      },
      headline: {
        fr: "Le Nouveau Patron Hérite d'un Chaos. Les Marchés Haussent les Épaules.",
        en: "The New Sheriff Inherits a Mess. Markets Shrug.",
      },
      dek: {
        fr: "L'Amérique vient de se doter d'un nouveau président de la Réserve fédérale. L'inflation tourne à 3,8 %. Le pétrole coûte 42 % de plus qu'il y a un an. Et pourtant — de façon presque improbable — le S&P 500 a prolongé sa série de gains.",
        en: "America just got a new Federal Reserve Chair. Inflation is running hot at 3.8%. Oil is 42% more expensive than a year ago. And somehow — improbably — the S&P 500 extended its winning streak.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-05-16-fr.html",
        en: "/research/pulse/2026-05-16-en.html",
      },
      headline: {
        fr: "La semaine qui a redessiné la carte de la Fed",
        en: "The week that redrew the Fed's map",
      },
      dek: {
        fr: "Le CPI d'avril est ressorti à 3,8% — plus chaud que prévu — tandis que Kevin Warsh prenait les rênes de la Réserve fédérale à Jerome Powell. Le sommet Trump-Xi à Pékin a livré seulement 200 avions Boeing et des platitudes.",
        en: "April CPI came in at 3.8% — hotter than feared — as Kevin Warsh took the Federal Reserve's helm from Jerome Powell. The Trump-Xi summit in Beijing delivered just 200 Boeing jets and platitudes.",
      },
    },
  },
  {
    date: "2026-04-03",
    weekLabel: {
      fr: "30 mars – 3 avril 2026",
      en: "March 30 – April 3, 2026",
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-04-03-fr.html",
        en: "/research/pulse/2026-04-03-en.html",
      },
      headline: {
        fr: "Meilleure semaine en cinq mois",
        en: "Best week in five months",
      },
      dek: {
        fr: "Les actions mondiales ont rebondi, le pétrole s'est calmé et la peur a nettement reculé. Une pause dans les tensions au Moyen-Orient a changé l'ambiance. Le prochain rendez-vous clé : le 6 avril.",
        en: "Global stocks bounced back, oil calmed down, and fear dropped noticeably. A pause in Middle East tensions changed the mood. The next big moment: April 6.",
      },
    },
  },
];

/** Latest issue helper. */
export function latestIssue(): Issue {
  return ISSUES[0];
}

export function findIssue(date: string): Issue | undefined {
  return ISSUES.find((i) => i.date === date);
}
