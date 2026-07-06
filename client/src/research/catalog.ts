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
    date: "2026-06-26",
    weekLabel: {
      fr: "22–26 juin 2026",
      en: "June 22–26, 2026",
    },
    edition: 25,
    human: {
      files: {
        fr: "/research/marche/2026-06-26-fr.html",
        en: "/research/marche/2026-06-26-en.html",
      },
      headline: {
        fr: "L'addition arrive.",
        en: "The bill arrives.",
      },
      dek: {
        fr: "Il y a une semaine, le marché défiait la Fed et battait des records quand même. Cette semaine, la facture est tombée — une inflation au plus haut de 3 ans — et le pari tech surchargé a fini par céder. Pas un krach. Un rééquilibrage.",
        en: "A week ago, the market dared the Fed and bought records anyway. This week the invoice landed — a 3-year-high inflation print — and the crowded tech trade finally cracked. Not a crash. A reckoning.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-06-26-fr.html",
        en: "/research/pulse/2026-06-26-en.html",
      },
      headline: {
        fr: "Inflation Brûlante. Tech Glaciale.",
        en: "Inflation Runs Hot. Tech Runs Cold.",
      },
      dek: {
        fr: "L'indicateur d'inflation préféré de la Fed, le PCE de mai, a atteint un sommet de 3 ans à 4,1 % — tuant tout espoir de répit et validant les dots restrictifs. Il a frappé un marché de méga-capitalisations tendu : Apple −6,2 % sur des hausses de prix, le Nasdaq −4,6 %, l'or, le pétrole et la crypto en baisse. Le seul feu vert fut défensif : le Dow a gagné 0,6 %. La « mauvaise évaluation » signalée la semaine dernière est arrivée.",
        en: "The Fed's preferred inflation gauge, May PCE, hit a 3-year high of 4.1% — killing any hope of relief and validating the hawkish dots. It landed on a stretched megacap market: Apple −6.2% on price hikes, the Nasdaq −4.6%, gold, oil and crypto all lower. The one green light was defensive: the Dow rose 0.6%. The mispricing we flagged last week arrived.",
      },
    },
  },
  {
    date: "2026-06-19",
    weekLabel: {
      fr: "15–19 juin 2026",
      en: "June 15–19, 2026",
    },
    edition: 24,
    human: {
      files: {
        fr: "/research/marche/2026-06-19-fr.html",
        en: "/research/marche/2026-06-19-en.html",
      },
      headline: {
        fr: "Le marché défie la Fed.",
        en: "The market calls the Fed's bluff.",
      },
      dek: {
        fr: "Un nouveau président de la Fed, plus dur, a annoncé que des hausses de taux étaient de retour. Le marché a tressailli une après-midi — puis a propulsé les actions à des records quand même. Cette semaine, ce n'était pas de la peur. C'était du défi.",
        en: "A new, tougher Fed Chair said rate hikes are back on the table. The market flinched for one afternoon — then bought stocks to record highs anyway. This week wasn't fear. It was defiance.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-06-19-fr.html",
        en: "/research/pulse/2026-06-19-en.html",
      },
      headline: {
        fr: "Fed Restrictive, Records Quand Même.",
        en: "Hawkish Fed, New Highs Anyway.",
      },
      dek: {
        fr: "Pour la première réunion de Kevin Warsh à la présidence, la Fed a maintenu ses taux à 3,50–3,75 % — mais son « dot plot » a viré au restrictif : 9 des 18 responsables anticipent désormais une hausse en 2026. Les actions ont chuté sur l'annonce… puis bondi à de nouveaux records le lendemain. Le Brent s'effondrant de −8,6 % à 80 $, le marché a jugé qu'un pétrole moins cher comptait plus qu'une Fed plus dure. Le Nasdaq a gagné +2,4 % ; le VIX est tombé à 16,4.",
        en: "In Kevin Warsh's first meeting as Chair, the Fed held rates at 3.50–3.75% — but its dot plot flipped hawkish: 9 of 18 officials now pencil in a rate hike in 2026. Stocks fell on the news, then ripped to new highs the next day. With Brent crude collapsing −8.6% to $80, the market decided cheaper oil mattered more than a tougher Fed. The Nasdaq jumped +2.4%; the VIX fell to 16.4.",
      },
    },
  },
  {
    date: "2026-06-12",
    weekLabel: {
      fr: "8–12 juin 2026",
      en: "June 8–12, 2026",
    },
    edition: 23,
    human: {
      files: {
        fr: "/research/marche/2026-06-12-fr.html",
        en: "/research/marche/2026-06-12-en.html",
      },
      headline: {
        fr: "Un répit, à crédit.",
        en: "Relief, on loan.",
      },
      dek: {
        fr: "Il y a une semaine, tout cassait d'un coup. Cette semaine, la peur s'est évaporée tout aussi vite — sur un cessez-le-feu et une inflation moins inquiétante que redouté. Mais les marchés célèbrent un danger dont ils ignorent encore qu'il est passé.",
        en: "A week ago, everything broke at once. This week the fear drained out just as fast — on a ceasefire and a calmer-than-feared inflation report. But markets are celebrating a danger they don't yet know has passed.",
      },
    },
    pulse: {
      files: {
        fr: "/research/pulse/2026-06-12-fr.html",
        en: "/research/pulse/2026-06-12-en.html",
      },
      headline: {
        fr: "Le Pétrole Cède, les Actions Guérissent.",
        en: "Oil Cracks, Stocks Heal.",
      },
      dek: {
        fr: "La panique de la semaine dernière s'est inversée sur deux fronts. Un cessez-le-feu Iran–Israël — avec un accord pour rouvrir le détroit d'Ormuz — a fait chuter le Brent de ~6 % à 87 $. Et si l'inflation globale de mai a atteint un sommet de 3 ans à 4,2 %, c'était presque entièrement l'énergie ; le cœur est resté sage à +0,2 %. Les marchés ont regardé au-delà du titre : les rendements ont reflué, le S&P, le Dow et le Nasdaq ont chacun gagné ~0,7 %, et le VIX s'est effondré de 21,5 à 17,7.",
        en: "Last week's panic reversed on two fronts. An Iran–Israel ceasefire — with a deal to reopen the Strait of Hormuz — collapsed Brent crude ~6% to $87. And while May headline inflation hit a 3-year high of 4.2%, it was almost entirely energy; the core ran cool at +0.2%. Markets looked through the headline: yields eased, the S&P, Dow and Nasdaq each rose ~0.7%, and the VIX collapsed from 21.5 back to 17.7.",
      },
    },
  },
  {
    date: "2026-06-13",
    weekLabel: {
      fr: "Analyse SpaceX IPO",
      en: "SpaceX IPO Analysis",
    },
    human: {
      files: {
        fr: "/research/spacex/2026-06-13-fr.html",
        en: "/research/spacex/2026-06-13-en.html",
      },
      headline: {
        fr: "SpaceX entre en bourse - faut-il en acheter ?",
        en: "SpaceX Just Went Public - Should You Buy It?",
      },
      dek: {
        fr: "Une fusée SpaceX sur son pas de tir avec une étiquette de prix - le rêve est-il déjà dans le cours ?",
        en: "SpaceX rocket on a launch pad with a price tag - has the price already bought the trip to Mars?",
      },
    },
  },
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
