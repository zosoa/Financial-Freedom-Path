/**
 * MountainAscent — Results page hero visualization.
 * Plots the user's journey: today (start), freedom-age (you), target-age (goal).
 */

type Props = {
  className?: string;
  /** User's current age (left dot label). */
  currentAge: number;
  /** Computed age at which the user reaches financial freedom. */
  freedomAge: number;
  /** User's chosen target freedom age (right reference). */
  targetAge: number;
  /** Localized labels for each marker. */
  labels?: {
    today?: string;       // e.g. "aujourd'hui"
    freedom?: string;     // e.g. "vous serez libre ici"
    target?: string;      // e.g. "votre objectif"
    yearsSuffix?: string; // e.g. "ans"
  };
};

const DEFAULT_LABELS: Required<NonNullable<Props["labels"]>> = {
  today: "aujourd'hui",
  freedom: "vous serez libre ici",
  target: "votre objectif",
  yearsSuffix: "ans",
};

/**
 * Maps an age to an X coordinate on the chart.
 * Anchors: currentAge → 40px, max(target, freedom)+5 → 760px.
 */
function buildScale(currentAge: number, freedomAge: number, targetAge: number) {
  const start = 40;
  const end = 760;
  const min = currentAge;
  const max = Math.max(targetAge, freedomAge) + 5;
  const range = Math.max(1, max - min);
  return (age: number) => start + ((age - min) / range) * (end - start);
}

export default function MountainAscent({
  className,
  currentAge,
  freedomAge,
  targetAge,
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const x = buildScale(currentAge, freedomAge, targetAge);
  const xToday = x(currentAge);
  const xFreedom = x(freedomAge);
  const xTarget = x(targetAge);

  // Compute Y of the journey line at each anchor (mountain rising).
  // The line is a smooth curve from (40,230) to (760,60).
  const yAt = (xv: number) => {
    const t = (xv - 40) / (760 - 40);
    // ease-in-out from 230 down to 60
    const ease = t * t * (3 - 2 * t);
    return 230 - ease * 170;
  };
  const yFreedom = yAt(xFreedom);
  const yTarget = yAt(xTarget);

  return (
    <svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="ma-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="ma-mt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* ground baseline */}
      <line x1="40" y1="240" x2="760" y2="240" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 6" />

      {/* mountain silhouette */}
      <path
        d="M40 240 L200 160 L320 200 L520 80 L660 140 L760 240 Z"
        fill="url(#ma-mt)"
        opacity="0.7"
      />

      {/* journey line */}
      <path
        d="M40 230 Q200 220 320 180 T540 100 T760 60"
        stroke="url(#ma-line)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Today dot (start) */}
      <circle cx={xToday} cy="230" r="8" fill="#10B981" stroke="#fff" strokeWidth="3" />
      <text x={xToday} y="265" fontSize="13" fontWeight="700" textAnchor="middle" fill="#10B981">
        {currentAge} {L.yearsSuffix}
      </text>
      <text x={xToday} y="282" fontSize="11" textAnchor="middle" fill="#64748B">
        {L.today}
      </text>

      {/* Target ref line (vertical dashed) */}
      <line
        x1={xTarget}
        y1={yTarget - 8}
        x2={xTarget}
        y2="240"
        stroke="#94A3B8"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <circle cx={xTarget} cy={yTarget} r="7" fill="#fff" stroke="#94A3B8" strokeWidth="2" />
      <text x={xTarget} y={yTarget - 16} fontSize="13" fontWeight="700" textAnchor="middle" fill="#475569">
        {targetAge} {L.yearsSuffix}
      </text>
      <text x={xTarget} y={yTarget - 30} fontSize="11" textAnchor="middle" fill="#64748B">
        {L.target}
      </text>

      {/* Freedom dot (you-are-here) */}
      <circle cx={xFreedom} cy={yFreedom} r="11" fill="#F59E0B" stroke="#fff" strokeWidth="3" />
      <text x={xFreedom} y={yFreedom - 18} fontSize="14" fontWeight="700" textAnchor="middle" fill="#D97706">
        {freedomAge} {L.yearsSuffix}
      </text>
      <text x={xFreedom} y={yFreedom - 32} fontSize="11" textAnchor="middle" fill="#64748B">
        {L.freedom}
      </text>

      {/* End flag */}
      <line x1="760" y1="60" x2="760" y2="35" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <path d="M760 35 L780 42 L760 49 Z" fill="#10B981" />
    </svg>
  );
}
