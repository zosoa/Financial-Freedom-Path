/**
 * Joint-venture identity for the FinkSmart footer / emails.
 * Renders the two partner logos (RealSmart Group + Gelios) as inline SVG so
 * they scale crisply and don't depend on external image assets at runtime.
 * The marks are based on the brand identities provided by ownership.
 */

type Props = { className?: string };

/** RealSmart Group — isometric multi-colour cube. */
export function RealSmartLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 120 130" className={className} aria-label="RealSmart Group" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagonal frame */}
      <path
        d="M60 6 L108 30 L108 100 L60 124 L12 100 L12 30 Z"
        fill="none"
        stroke="#1F8DF5"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Top face — yellow */}
      <path d="M60 32 L86 44 L60 56 L34 44 Z" fill="#FFCC00" />
      <path d="M60 22 L86 34 L86 44 L60 56 L34 44 L34 34 Z" fill="#FFCC00" opacity="0.55" />
      {/* Left face — green */}
      <path d="M22 42 L44 52 L44 96 L22 86 Z" fill="#3DB549" />
      <path d="M44 52 L44 96 L22 86 L22 42 Z M44 96 L44 74 L24 64 L22 86 Z" fill="none" />
      <path d="M22 42 L44 52 L44 74 L22 64 Z" fill="#46C155" />
      {/* Front face — blue + orange split */}
      <path d="M44 52 L60 60 L60 100 L44 96 Z" fill="#1F8DF5" />
      <path d="M60 60 L60 100 L44 96 L44 74 L60 80 Z" fill="#1F8DF5" opacity="0.85" />
      <path d="M60 60 L76 52 L76 96 L60 100 Z" fill="#FB923C" />
      <path d="M60 80 L76 72 L76 96 L60 100 Z" fill="#F97316" />
      {/* Right face — orange */}
      <path d="M76 52 L98 42 L98 86 L76 96 Z" fill="#F97316" />
      <path d="M76 74 L98 64 L98 86 L76 96 Z" fill="#EA580C" opacity="0.9" />
    </svg>
  );
}

/** Gelios — stylised "e" with energy bars motif. */
export function GeliosLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-label="Gelios" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gelios-e" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="gelios-bars" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* The "e" */}
      <path
        d="M62 30 a44 44 0 1 0 30 76 l-10 -12 a28 28 0 1 1 -2 -56 a28 28 0 0 1 28 22 H62 v14 h62 a44 44 0 0 0 -62 -44 Z"
        fill="url(#gelios-e)"
      />
      {/* Energy bars arrow */}
      <g transform="translate(120 30)">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = i * 11;
          const height = 70 - i * 8;
          const y = (80 - height) / 2;
          return <rect key={i} x={x} y={y} width="7" height={height} rx="1.5" fill="url(#gelios-bars)" />;
        })}
        {/* Arrowhead */}
        <path d="M66 6 L80 40 L66 74 Z" fill="url(#gelios-bars)" />
      </g>
    </svg>
  );
}

/** Footer block — the JV identity, used on Landing + Results + the SPA's report page. */
export function JointVentureFooter({ tagline }: { tagline?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-semibold">
        Une joint-venture entre
      </p>
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <RealSmartLogo className="w-10 h-10" />
          <span className="text-sm font-semibold text-foreground">RealSmart Group</span>
          <span className="text-[10px] text-muted-foreground">· EU</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-border" />
        <div className="flex items-center gap-2">
          <GeliosLogo className="w-12 h-8" />
          <span className="text-sm font-semibold text-foreground">Gelios</span>
          <span className="text-[10px] text-muted-foreground">· Maurice</span>
        </div>
      </div>
      {tagline && (
        <p className="text-[11px] text-muted-foreground/80 max-w-md italic">{tagline}</p>
      )}
    </div>
  );
}
