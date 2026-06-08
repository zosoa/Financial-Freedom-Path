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
    date: "2026-06-05",
    weekLabel: {
      fr: "1–5 juin 2026",
      en: "June 1–5, 2026",
    },
    edition: 22,
    human: {
      files: {
        fr: "/research/marche/2026-06-05-fr.html",
        en: "/research/marche/2026-06-05-en.html",
      },
      headline: {
        fr: "Bonnes Nouvelles, Mauvaise Cassure. Quand les créations d'emplois font s'effondrer les actions.",
        en: "Good News, Bad Tape. When strong jobs sink stocks.",
      },
      dek: {
        fr: "Un rapport d'emploi deux fois plus fort que prévu a fait ce que les mauvaises nouvelles font habituellement — les stocks se sont effondrés. Les probabilités de hausse de taux par la Fed ont grimpé à 70 %. Le Nasdaq a enregistré son pire jour depuis avril 2025. Une semaine de reprise des taux, pas une peur de la croissance.",
        en: "A jobs report twice as strong as forecast did what bad news usually does — it sank stocks. Fed hike odds jumped to 70%. The Nasdaq had its worst day since April 2025. A week of rate repricing, not growth scare.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-06-05-fr.html",
        en: "/research/pulse/2026-06-05-en.html",
      },
      headline: {
        fr: "Bonnes Nouvelles, Mauvaise Cassure",
        en: "Good News, Bad Tape",
      },
      dek: {
        fr: "+172k emplois (2× le consensus) et des probabilités de hausse de la Fed à 70 % ont fait s'effondrer les actions. Le Nasdaq a chuté de 4,68 %, son pire jour depuis avril 2025. Les obligations et l'or ont tous deux chuté. La seule gagnante : le pétrole (+3 % sur les risques du Golfe).",
        en: "+172k jobs (2× consensus) and 70% Fed hike odds sank stocks. Nasdaq down 4.68%, worst day since April 2025. Bonds and gold both fell. Only winner: oil (+3% on Hormuz risk).",
      },
    },
  },
  {
    date: "2026-05-29",
    weekLabel: {
      fr: "25–29 mai 2026",
      en: "May 25–29, 2026",
    },
    edition: 21,
    human: {
      files: {
        fr: "/research/marche/2026-05-29-fr.html",
        en: "/research/marche/2026-05-29-en.html",
      },
      headline: {
        fr: "Neuf semaines. L'IA domine mai. La stagflation frappe.",
        en: "Nine straight. AI rules May. Stagflation is knocking.",
      },
      dek: {
        fr: "Neuf semaines de gains consécutifs — la plus longue série du S&P depuis 2023. Les résultats IA ont brisé des records : Dell +33 %, Snowflake +36 %, Micron +88 % en mai. Mais l'inflation PCE a atteint 3,8 % et le PIB a été révisé à la baisse. Le moteur tourne à plein régime sur les deux tableaux.",
        en: "Nine consecutive winning weeks — the S&P's longest streak since 2023. AI earnings broke records: Dell +33%, Snowflake +36%, Micron +88% for May. But PCE hit 3.8% and GDP was revised down. The engine is running hot on both counts.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-05-29-fr.html",
        en: "/research/pulse/2026-05-29-en.html",
      },
      headline: {
        fr: "La plus longue série gagnante de l'année",
        en: "The longest winning streak of the year",
      },
      dek: {
        fr: "Dell +33 %, Snowflake +36 %, Micron +88 % en mai — le meilleur mois du Nasdaq en 2026. Neuf semaines de gains consécutifs. Mais l'inflation PCE a atteint 3,8 % — un plus haut en trois ans — tandis que le PIB a été révisé à la baisse. Le moteur tourne à plein régime, sur les deux tableaux.",
        en: "Dell +33%, Snowflake +36%, Micron +88% for May — the Nasdaq's best month of 2026. Nine straight weeks of gains. But PCE inflation hit 3.8% — a three-year high — while GDP was revised down. The engine is running hot on both counts.",
      },
    },
  },
  {
    date: "2026-05-23",
    weekLabel: {
      fr: "19–23 mai 2026",
      en: "May 19–23, 2026",
    },
    edition: 20,
    human: {
      files: {
        fr: "/research/marche/2026-05-23-fr.html",
        en: "/research/marche/2026-05-23-en.html",
      },
      headline: {
        fr: "Huit semaines. La peur disparaît. Les obligations résistent.",
        en: "Eight straight. Fear is gone. The bond market disagrees.",
      },
      dek: {
        fr: "Les actions américaines viennent de signer leur huitième semaine consécutive de hausse. Le VIX est repassé sous 20. Mais le marché obligataire — historiquement le plus lucide — vient d'atteindre un plus haut annuel sur les coûts d'emprunt.",
        en: "US stocks logged their eighth consecutive positive week. VIX broke below 20. But the bond market — historically the smartest room in finance — just hit a one-year high on borrowing costs. Two signals. Two very different stories.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-05-23-fr.html",
        en: "/research/pulse/2026-05-23-en.html",
      },
      headline: {
        fr: "La plus longue série positive depuis décembre 2023",
        en: "The longest positive streak since December 2023",
      },
      dek: {
        fr: "Les actions américaines ont enchaîné leur 8e semaine consécutive de hausse et la peur est finalement tombée sous le seuil d'alerte. Le pétrole a chuté de 6 % suite à la prolongation du cessez-le-feu en Iran. Mais les coûts d'emprunt américains ont atteint un sommet d'un an — calme en surface, signal à surveiller en dessous.",
        en: "US stocks notched their 8th consecutive winning week and fear finally dropped below the danger line. Oil fell 6% as the Iran ceasefire was extended. But US borrowing costs hit a 1-year high — calm on the surface, a signal worth watching underneath.",
      },
    },
  },
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
