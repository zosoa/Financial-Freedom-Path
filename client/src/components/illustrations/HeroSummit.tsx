/**
 * HeroSummit — Landing page hero illustration.
 * Soft-circle backplate, two mountain ranges, sunrise, hiker with compass,
 * coastal hint (palm tree) for the Mauritius/island flavor.
 */
type Props = { className?: string };

export default function HeroSummit({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 520"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE9B0" />
          <stop offset="100%" stopColor="#FEF6E4" />
        </linearGradient>
        <linearGradient id="hs-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="hs-mt-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="hs-mt-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="260" r="240" fill="url(#hs-sky)" />

      <circle cx="360" cy="180" r="64" fill="#FBBF24" opacity="0.18" />
      <circle cx="360" cy="180" r="48" fill="url(#hs-sun)" />

      <path
        d="M40 350 L130 230 L195 290 L270 200 L340 270 L420 220 L500 320 L500 420 L40 420 Z"
        fill="url(#hs-mt-far)"
      />

      <path
        d="M40 380 Q120 370 200 380 T360 380 T500 380 L500 420 L40 420 Z"
        fill="url(#hs-sea)"
        opacity="0.55"
      />

      <path d="M80 460 L210 230 L280 320 L360 230 L460 460 Z" fill="url(#hs-mt-near)" />

      <path d="M195 250 L210 230 L230 258 L222 262 L215 256 L208 262 Z" fill="#FFF7ED" opacity="0.95" />
      <path d="M345 250 L360 230 L380 258 L373 262 L366 256 L358 262 Z" fill="#FFF7ED" opacity="0.95" />

      <path
        d="M120 460 Q170 420 200 400 Q230 380 250 350 Q270 320 290 290 Q310 260 330 245"
        stroke="#FEF6E4"
        strokeWidth="6"
        fill="none"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />

      <line x1="330" y1="245" x2="330" y2="210" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <path d="M330 212 L355 220 L330 228 Z" fill="#10B981" />

      <g transform="translate(160 380)">
        <ellipse cx="0" cy="48" rx="22" ry="4" fill="#1E293B" opacity="0.15" />
        <rect x="-9" y="20" width="7" height="22" rx="3" fill="#1E40AF" />
        <rect x="2" y="20" width="7" height="22" rx="3" fill="#1E40AF" />
        <path d="M-14 -2 Q-14 -18 0 -18 Q14 -18 14 -2 L12 22 Q0 26 -12 22 Z" fill="#F59E0B" />
        <rect x="-20" y="-2" width="6" height="18" rx="3" fill="#F59E0B" transform="rotate(-15 -17 7)" />
        <rect x="14" y="-2" width="6" height="18" rx="3" fill="#F59E0B" transform="rotate(20 17 7)" />
        <circle cx="0" cy="-26" r="11" fill="#FCD9B5" />
        <path d="M-11 -28 Q-9 -38 0 -39 Q9 -38 11 -28 L11 -25 Q0 -28 -11 -25 Z" fill="#1E293B" />
        <path d="M-7 -10 Q-10 6 -7 18" stroke="#0F172A" strokeWidth="2" fill="none" />
        <circle cx="22" cy="6" r="7" fill="#fff" stroke="#1E293B" strokeWidth="1.5" />
        <path d="M24.5 3 L23 7 L19.5 8.5 L21 4.5 Z" fill="#F59E0B" />
      </g>

      <path d="M150 130 q5 -6 10 0 q5 -6 10 0" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M210 100 q4 -5 8 0 q4 -5 8 0" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      <g transform="translate(440 405)">
        <path d="M0 0 Q-2 -25 -1 -55" stroke="#7C2D12" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-1 -55 Q-15 -62 -25 -55" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M-1 -55 Q12 -62 22 -55" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M-1 -55 Q-8 -75 -18 -78" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M-1 -55 Q8 -75 18 -78" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
