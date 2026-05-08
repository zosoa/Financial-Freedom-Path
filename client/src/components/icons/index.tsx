/**
 * FinkSmart custom SVG icon set — "Friendly Atlas" style.
 * Each icon is a small scene (line + soft fill) at 64×64 viewBox.
 * Use the `size` prop to set the rendered dimension; SVG scales cleanly.
 *
 * Replaces the 15 PNGs that lived in client/src/assets/icons/.
 */
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  /** Optional class for the outer <svg>. */
  className?: string;
};

const base = (size: number | string = 64): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
});

/** Boussole / GPS — replaces icon-roadmap.png */
export const IconCompass = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <circle cx="32" cy="32" r="22" fill="hsl(38 92% 90%)" stroke="hsl(38 92% 50%)" strokeWidth={2.4} />
    <path d="M40 22 L34 34 L22 40 L28 28 Z" fill="hsl(38 92% 50%)" />
    <circle cx="32" cy="32" r="2.2" fill="hsl(222 47% 11%)" />
    <line x1="32" y1="13" x2="32" y2="17" stroke="hsl(222 47% 11%)" strokeWidth={2} strokeLinecap="round" />
    <line x1="51" y1="32" x2="47" y2="32" stroke="hsl(222 47% 11%)" strokeWidth={2} strokeLinecap="round" />
    <line x1="32" y1="51" x2="32" y2="47" stroke="hsl(222 47% 11%)" strokeWidth={2} strokeLinecap="round" />
    <line x1="13" y1="32" x2="17" y2="32" stroke="hsl(222 47% 11%)" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

/** Cible avec flèche — replaces icon-goal.png */
export const IconTarget = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <circle cx="32" cy="32" r="20" fill="hsl(0 90% 95%)" stroke="hsl(0 75% 55%)" strokeWidth={2} />
    <circle cx="32" cy="32" r="13" fill="hsl(0 0% 100%)" stroke="hsl(0 75% 55%)" strokeWidth={2} />
    <circle cx="32" cy="32" r="6" fill="hsl(0 75% 55%)" />
    <path d="M32 32 L48 16" stroke="hsl(222 47% 11%)" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M48 16 L44 18 L46 12 Z" fill="hsl(222 47% 11%)" />
  </svg>
);

/** Graphe ascendant — replaces icon-growth.png + icon-analytics.png */
export const IconGrowth = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <rect x="10" y="10" width="44" height="44" rx="10" fill="hsl(160 70% 92%)" />
    <path
      d="M16 44 L26 32 L34 38 L48 20"
      stroke="hsl(160 84% 39%)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="48" cy="20" r="3.5" fill="hsl(160 84% 39%)" />
    <path d="M44 20 L48 16 L52 20" stroke="hsl(160 84% 39%)" strokeWidth={2.4} strokeLinecap="round" fill="none" />
  </svg>
);

/** Plante / intérêts composés — replaces icon-compound.png */
export const IconCompound = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <ellipse cx="32" cy="50" rx="18" ry="3" fill="hsl(222 47% 11%)" opacity={0.08} />
    <path d="M28 50 L28 30 Q28 24 32 24 Q36 24 36 30 L36 50" fill="hsl(20 60% 28%)" />
    <path d="M32 30 Q22 26 18 18 Q26 18 32 26" fill="hsl(160 84% 39%)" />
    <path d="M32 30 Q42 26 46 18 Q38 18 32 26" fill="hsl(160 70% 55%)" />
    <circle cx="32" cy="14" r="4" fill="hsl(38 92% 55%)" />
    <line x1="32" y1="20" x2="32" y2="22" stroke="hsl(38 92% 30%)" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

/** Sommet / liberté financière — replaces icon-retirement.png */
export const IconSummit = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <rect x="8" y="8" width="48" height="48" rx="10" fill="hsl(33 100% 85%)" />
    <path d="M14 46 L26 26 L34 36 L42 22 L52 46 Z" fill="hsl(20 91% 48%)" />
    <path d="M24 28 L26 26 L29 30 L26.5 31 Z" fill="hsl(36 100% 96%)" />
    <path d="M40 24 L42 22 L46 28 L43 29 Z" fill="hsl(36 100% 96%)" />
    <line x1="42" y1="22" x2="42" y2="14" stroke="hsl(222 47% 11%)" strokeWidth={2} strokeLinecap="round" />
    <path d="M42 14 L50 17 L42 20 Z" fill="hsl(160 84% 39%)" />
  </svg>
);

/** Bouclier / privacy — replaces icon-data-privacy.png */
export const IconShield = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path
      d="M32 8 L52 16 V32 Q52 48 32 56 Q12 48 12 32 V16 Z"
      fill="hsl(199 89% 92%)"
      stroke="hsl(199 89% 48%)"
      strokeWidth={2.2}
    />
    <path
      d="M22 32 L29 39 L42 24"
      stroke="hsl(199 89% 48%)"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Ampoule / smart logic — replaces icon-smart-logic.png */
export const IconLightbulb = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path
      d="M32 10 Q48 10 48 26 Q48 36 40 42 L40 46 L24 46 L24 42 Q16 36 16 26 Q16 10 32 10 Z"
      fill="hsl(38 92% 90%)"
      stroke="hsl(38 92% 50%)"
      strokeWidth={2}
    />
    <rect x="24" y="48" width="16" height="4" rx="2" fill="hsl(222 47% 11%)" />
    <rect x="26" y="54" width="12" height="3" rx="1.5" fill="hsl(222 47% 11%)" />
    <path d="M28 26 Q32 22 36 26 Q36 32 32 36 Q28 32 28 26" fill="hsl(38 92% 55%)" />
  </svg>
);

/** Barres / analytics — alias of IconGrowth but bar style */
export const IconBars = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <rect x="8" y="8" width="48" height="48" rx="10" fill="hsl(199 89% 92%)" />
    <rect x="16" y="36" width="8" height="14" rx="2" fill="hsl(199 89% 48%)" />
    <rect x="28" y="28" width="8" height="22" rx="2" fill="hsl(199 89% 48%)" />
    <rect x="40" y="20" width="8" height="30" rx="2" fill="hsl(199 89% 48%)" />
    <circle cx="44" cy="20" r="3" fill="hsl(160 84% 39%)" />
  </svg>
);

/** Globe — replaces icon-global-view.png */
export const IconGlobe = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <circle cx="32" cy="32" r="22" fill="hsl(160 70% 92%)" stroke="hsl(160 84% 39%)" strokeWidth={2.2} />
    <ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="hsl(160 84% 39%)" strokeWidth={1.5} />
    <path d="M32 10 Q22 32 32 54" stroke="hsl(160 84% 39%)" strokeWidth={1.5} fill="none" />
    <path d="M32 10 Q42 32 32 54" stroke="hsl(160 84% 39%)" strokeWidth={1.5} fill="none" />
    <circle cx="38" cy="20" r="2.4" fill="hsl(38 92% 50%)" />
    <circle cx="22" cy="40" r="2.4" fill="hsl(38 92% 50%)" />
  </svg>
);

/** Tirelire — replaces icon-savings.png */
export const IconPiggy = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <ellipse cx="32" cy="38" rx="20" ry="14" fill="hsl(335 75% 88%)" stroke="hsl(335 70% 50%)" strokeWidth={2} />
    <circle cx="40" cy="34" r="2" fill="hsl(222 47% 11%)" />
    <rect x="14" y="32" width="6" height="4" rx="1.5" fill="hsl(222 47% 11%)" />
    <path d="M44 26 Q46 22 50 22 L50 28" fill="hsl(335 70% 50%)" />
    <rect x="20" y="50" width="4" height="6" fill="hsl(335 70% 50%)" />
    <rect x="40" y="50" width="4" height="6" fill="hsl(335 70% 50%)" />
    <circle cx="32" cy="20" r="6" fill="hsl(38 92% 55%)" />
    <text x="32" y="23" fontSize={8} fontWeight={700} textAnchor="middle" fill="hsl(38 95% 22%)" fontFamily="system-ui">
      $
    </text>
  </svg>
);

/** Diplôme — replaces icon-education.png */
export const IconDiploma = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path
      d="M32 14 L56 24 L32 34 L8 24 Z"
      fill="hsl(262 83% 90%)"
      stroke="hsl(262 83% 58%)"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <path d="M20 30 L20 42 Q32 50 44 42 L44 30" fill="none" stroke="hsl(262 83% 58%)" strokeWidth={2} />
    <line x1="56" y1="24" x2="56" y2="36" stroke="hsl(262 83% 58%)" strokeWidth={2} strokeLinecap="round" />
    <path d="M55 36 L57 36 L56 42 Z" fill="hsl(38 92% 50%)" />
  </svg>
);

/** Colonnes / institution — replaces icon-institution.png */
export const IconPillars = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path
      d="M10 22 L32 12 L54 22 L54 26 L10 26 Z"
      fill="hsl(220 14% 90%)"
      stroke="hsl(215 25% 35%)"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <rect x="14" y="28" width="6" height="20" fill="hsl(220 14% 80%)" />
    <rect x="29" y="28" width="6" height="20" fill="hsl(220 14% 80%)" />
    <rect x="44" y="28" width="6" height="20" fill="hsl(220 14% 80%)" />
    <rect x="8" y="50" width="48" height="4" rx="1" fill="hsl(215 25% 35%)" />
  </svg>
);

/** Diamant — replaces icon-wealth.png */
export const IconDiamond = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path
      d="M14 24 L24 14 L40 14 L50 24 L32 52 Z"
      fill="hsl(187 92% 84%)"
      stroke="hsl(187 92% 38%)"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <path d="M14 24 L50 24" stroke="hsl(187 92% 38%)" strokeWidth={1.5} />
    <path d="M24 14 L32 24 L40 14" stroke="hsl(187 92% 38%)" strokeWidth={1.5} fill="none" />
    <path d="M24 14 L32 52" stroke="hsl(187 92% 25%)" strokeWidth={1} fill="none" opacity={0.4} />
    <path d="M40 14 L32 52" stroke="hsl(187 92% 25%)" strokeWidth={1} fill="none" opacity={0.4} />
  </svg>
);

/** ADN — replaces icon-risk-dna.png */
export const IconDNA = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path
      d="M22 12 Q42 22 22 32 Q42 42 22 52"
      stroke="hsl(199 89% 48%)"
      strokeWidth={2.4}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M42 12 Q22 22 42 32 Q22 42 42 52"
      stroke="hsl(262 83% 58%)"
      strokeWidth={2.4}
      fill="none"
      strokeLinecap="round"
    />
    <line x1="24" y1="18" x2="40" y2="18" stroke="hsl(215 16% 60%)" strokeWidth={1.5} />
    <line x1="24" y1="26" x2="40" y2="26" stroke="hsl(215 16% 60%)" strokeWidth={1.5} />
    <line x1="24" y1="38" x2="40" y2="38" stroke="hsl(215 16% 60%)" strokeWidth={1.5} />
    <line x1="24" y1="46" x2="40" y2="46" stroke="hsl(215 16% 60%)" strokeWidth={1.5} />
  </svg>
);

/** Loupe / analyse — replaces icon-analysis.png */
export const IconMagnifier = ({ size = 64, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <circle cx="26" cy="26" r="14" fill="hsl(38 92% 90%)" stroke="hsl(38 92% 50%)" strokeWidth={2.4} />
    <circle cx="26" cy="26" r="8" fill="hsl(0 0% 100%)" stroke="hsl(38 92% 50%)" strokeWidth={1.5} />
    <line x1="36" y1="36" x2="50" y2="50" stroke="hsl(222 47% 11%)" strokeWidth={3.5} strokeLinecap="round" />
    <path d="M22 22 L24 24" stroke="hsl(38 92% 50%)" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

/** Map of legacy PNG names → new icon component, for migration sweeps. */
export const ICON_MAP = {
  "icon-roadmap.png": IconCompass,
  "icon-goal.png": IconTarget,
  "icon-growth.png": IconGrowth,
  "icon-compound.png": IconCompound,
  "icon-retirement.png": IconSummit,
  "icon-data-privacy.png": IconShield,
  "icon-smart-logic.png": IconLightbulb,
  "icon-analytics.png": IconBars,
  "icon-global-view.png": IconGlobe,
  "icon-savings.png": IconPiggy,
  "icon-education.png": IconDiploma,
  "icon-institution.png": IconPillars,
  "icon-wealth.png": IconDiamond,
  "icon-risk-dna.png": IconDNA,
  "icon-analysis.png": IconMagnifier,
} as const;
