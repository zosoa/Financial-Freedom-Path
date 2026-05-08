/**
 * Calculator step illustrations — one mini scene per step.
 * Each illustration is square (320×320 viewBox) with a soft amber halo.
 */

type Props = { className?: string };

const Halo = () => (
  <defs>
    <radialGradient id="step-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FEF3C7" />
      <stop offset="100%" stopColor="#FEF6E4" stopOpacity="0" />
    </radialGradient>
  </defs>
);

const Backplate = () => <circle cx="160" cy="160" r="150" fill="url(#step-halo)" />;

/** Step 1 — Age (calendar with sparkles). */
export function StepAge({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <Halo />
      <Backplate />
      <g transform="translate(160 160)">
        <rect x="-70" y="-60" width="140" height="120" rx="14" fill="#fff" stroke="#1E293B" strokeWidth="3" />
        <rect x="-70" y="-60" width="140" height="36" rx="14" fill="#F59E0B" />
        <rect x="-70" y="-32" width="140" height="6" fill="#1E293B" opacity="0.05" />
        <line x1="-40" y1="-72" x2="-40" y2="-44" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
        <line x1="40" y1="-72" x2="40" y2="-44" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
        {/* Date dots */}
        {[-40, -10, 20, 50].map((x) =>
          [-10, 16, 42].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#CBD5E1" />
          ))
        )}
        {/* Highlighted date */}
        <circle cx="20" cy="16" r="11" fill="#F59E0B" />
        <text x="20" y="20" fontSize="11" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="system-ui">
          ●
        </text>
      </g>
      <circle cx="80" cy="80" r="3" fill="#FBBF24" />
      <circle cx="240" cy="100" r="2.5" fill="#FBBF24" />
      <circle cx="260" cy="240" r="3" fill="#FBBF24" />
    </svg>
  );
}

/** Step 2 — Target freedom age (hourglass). */
export function StepFreedomAge({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <Halo />
      <Backplate />
      <g transform="translate(160 160)">
        <path
          d="M-50 -70 L50 -70 L50 -55 L10 -10 L50 35 L50 70 L-50 70 L-50 35 L-10 -10 L-50 -55 Z"
          fill="#fff"
          stroke="#1E293B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M-44 -64 L44 -64 L44 -57 L4 -10 L-4 -10 L-44 -57 Z" fill="#FBBF24" />
        <path d="M-44 64 L44 64 L44 50 L20 22 L-20 22 L-44 50 Z" fill="#FB923C" opacity="0.55" />
        <line x1="0" y1="-10" x2="0" y2="22" stroke="#F59E0B" strokeWidth="2.5" />
        <circle cx="0" cy="20" r="2.5" fill="#F59E0B" />
      </g>
      <circle cx="80" cy="80" r="3" fill="#FBBF24" />
      <circle cx="240" cy="100" r="2.5" fill="#FBBF24" />
      <circle cx="260" cy="240" r="3" fill="#FBBF24" />
    </svg>
  );
}

/** Step 3 — Monthly income (banknote with coins). */
export function StepIncome({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <Halo />
      <Backplate />
      <g transform="translate(160 160)">
        {/* Banknote */}
        <rect x="-72" y="-44" width="144" height="78" rx="10" fill="#D1FAE5" stroke="#10B981" strokeWidth="3" transform="rotate(-6)" />
        <circle cx="0" cy="-5" r="22" fill="none" stroke="#10B981" strokeWidth="2.5" transform="rotate(-6)" />
        <text x="0" y="2" fontSize="22" fontWeight="800" textAnchor="middle" fill="#10B981" fontFamily="system-ui" transform="rotate(-6)">
          $
        </text>
        {/* Coins */}
        <circle cx="-65" cy="55" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <text x="-65" y="60" fontSize="14" fontWeight="800" textAnchor="middle" fill="#92400E" fontFamily="system-ui">$</text>
        <circle cx="-30" cy="65" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <text x="-30" y="70" fontSize="14" fontWeight="800" textAnchor="middle" fill="#92400E" fontFamily="system-ui">$</text>
        <circle cx="5" cy="60" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <text x="5" y="65" fontSize="14" fontWeight="800" textAnchor="middle" fill="#92400E" fontFamily="system-ui">$</text>
      </g>
    </svg>
  );
}

/** Step 4 — Current savings (piggy bank). */
export function StepSavings({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <Halo />
      <Backplate />
      <g transform="translate(160 170)">
        {/* Piggy body */}
        <ellipse cx="0" cy="0" rx="76" ry="50" fill="#FBCFE8" stroke="#DB2777" strokeWidth="3" />
        {/* Ear */}
        <path d="M28 -42 Q34 -54 50 -50 L50 -36 Z" fill="#DB2777" />
        {/* Eye */}
        <circle cx="35" cy="-8" r="3.5" fill="#1E293B" />
        {/* Snout */}
        <ellipse cx="64" cy="6" rx="10" ry="14" fill="#F472B6" stroke="#DB2777" strokeWidth="2" />
        <circle cx="64" cy="0" r="2" fill="#1E293B" />
        <circle cx="64" cy="12" r="2" fill="#1E293B" />
        {/* Slot */}
        <rect x="-22" y="-22" width="22" height="6" rx="2" fill="#1E293B" />
        {/* Legs */}
        <rect x="-44" y="42" width="14" height="20" rx="3" fill="#DB2777" />
        <rect x="22" y="42" width="14" height="20" rx="3" fill="#DB2777" />
        {/* Tail */}
        <path d="M-72 -4 q-12 -2 -10 10 q2 10 10 6" stroke="#DB2777" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Falling coin */}
      <circle cx="150" cy="80" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
      <text x="150" y="85" fontSize="14" fontWeight="800" textAnchor="middle" fill="#92400E" fontFamily="system-ui">
        $
      </text>
      <line x1="150" y1="100" x2="150" y2="120" stroke="#FBBF24" strokeWidth="2" strokeDasharray="2 3" strokeLinecap="round" />
    </svg>
  );
}

/** Step 5 — Monthly savings rate (rocket). */
export function StepSavingsRate({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <Halo />
      <Backplate />
      <g transform="translate(160 160)">
        {/* Rocket body */}
        <path d="M0 -80 Q-22 -50 -22 -10 L-22 30 L22 30 L22 -10 Q22 -50 0 -80 Z" fill="#fff" stroke="#1E293B" strokeWidth="3" strokeLinejoin="round" />
        {/* Window */}
        <circle cx="0" cy="-25" r="10" fill="#0EA5E9" stroke="#1E293B" strokeWidth="2" />
        <path d="M-5 -28 q5 -4 10 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* Body stripe */}
        <rect x="-22" y="-2" width="44" height="6" fill="#F59E0B" />
        {/* Fins */}
        <path d="M-22 0 L-40 30 L-22 30 Z" fill="#EF4444" />
        <path d="M22 0 L40 30 L22 30 Z" fill="#EF4444" />
        {/* Flame */}
        <path d="M-14 32 Q-10 50 0 70 Q10 50 14 32 Z" fill="#FB923C" />
        <path d="M-8 32 Q-5 44 0 56 Q5 44 8 32 Z" fill="#FBBF24" />
      </g>
      {/* Stars */}
      <circle cx="80" cy="80" r="3" fill="#FBBF24" />
      <circle cx="240" cy="120" r="2.5" fill="#FBBF24" />
      <circle cx="260" cy="220" r="3" fill="#FBBF24" />
      <path d="M70 200 l3 3 l-3 3 l-3 -3 z" fill="#F59E0B" />
    </svg>
  );
}
