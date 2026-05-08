/**
 * Four climate illustrations for the Risk DNA result page.
 * 320×320 viewBox, soft halo, Friendly Atlas style.
 */
import type { Climate } from "@/lib/risk-scoring";

type Props = { className?: string };

const Halo = ({ id }: { id: string }) => (
  <defs>
    <radialGradient id={id} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FEF3C7" />
      <stop offset="100%" stopColor="#FEF6E4" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* ─────────────────────────── 🧊 GLACIER ─────────────────────────── */
export function ClimateGlacier({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <Halo id="g-halo" />
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
        <linearGradient id="g-ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="g-aurora" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
          <stop offset="50%" stopColor="#10B981" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="160" r="150" fill="url(#g-sky)" />
      {/* Aurora */}
      <path d="M30 80 Q120 50 200 90 T300 70" stroke="url(#g-aurora)" strokeWidth="22" fill="none" opacity="0.7" />
      <path d="M40 105 Q130 70 210 110 T300 95" stroke="url(#g-aurora)" strokeWidth="14" fill="none" opacity="0.5" />
      {/* Distant glaciers */}
      <path d="M0 220 L60 165 L120 200 L180 150 L240 195 L320 170 L320 320 L0 320 Z" fill="#E0F2FE" />
      {/* Foreground iceberg */}
      <path d="M80 250 L120 175 L165 195 L195 165 L235 200 L260 250 Z" fill="url(#g-ice)" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" />
      {/* Iceberg highlights */}
      <path d="M120 175 L130 205 L165 195 Z" fill="#fff" opacity="0.6" />
      <path d="M195 165 L210 200 L235 200 Z" fill="#fff" opacity="0.4" />
      {/* Polar bear silhouette */}
      <g transform="translate(155 215)">
        <ellipse cx="0" cy="22" rx="22" ry="4" fill="#1E293B" opacity="0.18" />
        <path d="M-18 12 Q-22 -4 -10 -8 L-2 -10 Q4 -14 12 -10 L20 -8 Q26 -4 22 12 Q22 18 12 18 L-12 18 Q-22 18 -18 12 Z" fill="#fff" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="-10" cy="-3" r="1.4" fill="#1E293B" />
        <ellipse cx="-15" cy="-9" rx="3" ry="3.5" fill="#fff" stroke="#94A3B8" strokeWidth="1" />
      </g>
      {/* Snowflakes */}
      {[
        [60, 60], [240, 50], [80, 130], [260, 140], [40, 200], [280, 220],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <line x1="-4" y1="0" x2="4" y2="0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-3" y1="-3" x2="3" y2="3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-3" y1="3" x2="3" y2="-3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────── 🌳 TEMPÉRÉ ─────────────────────────── */
export function ClimateTempere({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <Halo id="t-halo" />
      <defs>
        <linearGradient id="t-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF6E4" />
          <stop offset="100%" stopColor="#ECFCCB" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="160" r="150" fill="url(#t-sky)" />
      {/* Ground */}
      <path d="M0 240 Q160 220 320 240 L320 320 L0 320 Z" fill="#84CC16" opacity="0.4" />
      {/* Tree trunk */}
      <rect x="148" y="200" width="24" height="50" rx="4" fill="#7C2D12" />
      {/* Tree foliage — 4 quadrants representing 4 seasons */}
      {/* Spring: pink */}
      <path d="M160 100 Q120 100 100 140 Q120 180 160 180 Z" fill="#FBCFE8" stroke="#BE185D" strokeWidth="1.5" />
      <circle cx="115" cy="120" r="3.5" fill="#EC4899" />
      <circle cx="125" cy="155" r="3" fill="#EC4899" />
      <circle cx="105" cy="160" r="3" fill="#EC4899" />
      {/* Summer: deep green */}
      <path d="M160 100 Q200 100 220 140 Q200 180 160 180 Z" fill="#84CC16" stroke="#3F6212" strokeWidth="1.5" />
      <circle cx="200" cy="125" r="2.5" fill="#FBBF24" />
      <circle cx="210" cy="155" r="2.5" fill="#FBBF24" />
      {/* Autumn: orange */}
      <path d="M100 140 Q90 180 100 200 Q140 220 160 200 Q160 180 160 180 Q120 180 100 140 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
      <circle cx="120" cy="195" r="3" fill="#EA580C" />
      <circle cx="135" cy="210" r="3" fill="#EA580C" />
      {/* Winter: ice blue with snow */}
      <path d="M220 140 Q230 180 220 200 Q180 220 160 200 Q160 180 160 180 Q200 180 220 140 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
      <circle cx="200" cy="195" r="2" fill="#fff" />
      <circle cx="180" cy="210" r="2" fill="#fff" />
      <circle cx="215" cy="180" r="2" fill="#fff" />
      {/* Sun */}
      <circle cx="60" cy="80" r="22" fill="#FBBF24" opacity="0.9" />
      <circle cx="60" cy="80" r="32" fill="#FBBF24" opacity="0.18" />
      {/* Bird */}
      <path d="M250 80 q5 -6 10 0 q5 -6 10 0" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────── 🌴 TROPICAL ─────────────────────────── */
export function ClimateTropical({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <Halo id="tr-halo" />
      <defs>
        <linearGradient id="tr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="60%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#A5F3FC" />
        </linearGradient>
        <linearGradient id="tr-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="160" r="150" fill="url(#tr-sky)" />
      {/* Sun */}
      <circle cx="220" cy="110" r="36" fill="#FBBF24" opacity="0.95" />
      <circle cx="220" cy="110" r="50" fill="#FBBF24" opacity="0.2" />
      {/* Sea */}
      <path d="M0 230 Q80 215 160 225 T320 220 L320 320 L0 320 Z" fill="url(#tr-sea)" />
      <path d="M40 235 Q60 230 80 235" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M180 245 Q210 240 240 248" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
      {/* Sand */}
      <path d="M0 240 Q160 220 320 240 L320 260 L0 260 Z" fill="#FEF3C7" />
      {/* Palm tree */}
      <g transform="translate(80 240)">
        <path d="M0 0 Q-4 -50 -2 -110" stroke="#7C2D12" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M-2 -110 Q-30 -125 -55 -115" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M-2 -110 Q25 -125 50 -115" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M-2 -110 Q-15 -145 -32 -150" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M-2 -110 Q15 -145 28 -150" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M-2 -110 Q0 -135 -5 -160" stroke="#10B981" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Coconuts */}
        <circle cx="-4" cy="-105" r="4" fill="#7C2D12" />
        <circle cx="3" cy="-103" r="3.5" fill="#7C2D12" />
      </g>
      {/* Bird */}
      <path d="M150 70 q5 -6 10 0 q5 -6 10 0" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M210 60 q4 -5 8 0 q4 -5 8 0" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Hibiscus flower */}
      <g transform="translate(255 235)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-8" rx="6" ry="10" fill="#EC4899" transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="4" fill="#FBBF24" />
      </g>
    </svg>
  );
}

/* ─────────────────────────── 🌋 VOLCAN ─────────────────────────── */
export function ClimateVolcan({ className }: Props) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <Halo id="v-halo" />
      <defs>
        <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C2D12" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="v-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
        <linearGradient id="v-lava" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="160" r="150" fill="url(#v-sky)" />
      {/* Sun-blood disc */}
      <circle cx="240" cy="80" r="24" fill="#FCD34D" opacity="0.85" />
      <circle cx="240" cy="80" r="36" fill="#FCD34D" opacity="0.25" />
      {/* Volcano body */}
      <path d="M50 280 L120 130 L150 130 L180 130 L210 130 L280 280 Z" fill="url(#v-mountain)" />
      {/* Crater rim */}
      <ellipse cx="165" cy="130" rx="48" ry="8" fill="#1F2937" />
      <ellipse cx="165" cy="128" rx="40" ry="5" fill="#0F172A" />
      {/* Lava eruption */}
      <path d="M150 130 Q155 90 165 60 Q175 40 170 25" stroke="#FBBF24" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M165 130 Q170 80 180 55 Q188 35 195 20" stroke="#F97316" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M180 130 Q190 100 200 80 Q205 65 215 55" stroke="#DC2626" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* Lava droplets */}
      <circle cx="170" cy="40" r="4" fill="#FBBF24" />
      <circle cx="195" cy="55" r="3.5" fill="#F97316" />
      <circle cx="155" cy="75" r="3" fill="#FBBF24" />
      <circle cx="210" cy="85" r="3" fill="#DC2626" />
      {/* Lava flowing down */}
      <path d="M155 130 L140 200 Q138 230 130 260" stroke="url(#v-lava)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M178 130 L195 220 Q198 245 205 268" stroke="url(#v-lava)" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Smoke */}
      <ellipse cx="160" cy="20" rx="18" ry="6" fill="#1F2937" opacity="0.45" />
      <ellipse cx="180" cy="10" rx="14" ry="4" fill="#1F2937" opacity="0.35" />
      <ellipse cx="135" cy="15" rx="12" ry="4" fill="#1F2937" opacity="0.3" />
      {/* Embers */}
      <circle cx="60" cy="200" r="2" fill="#FBBF24" />
      <circle cx="270" cy="180" r="2" fill="#F97316" />
      <circle cx="80" cy="240" r="1.5" fill="#FBBF24" />
    </svg>
  );
}

/** Resolve climate id → component (handy for dynamic rendering). */
export const CLIMATE_ILLUSTRATIONS: Record<Climate, (p: Props) => JSX.Element> = {
  glacier: ClimateGlacier,
  tempere: ClimateTempere,
  tropical: ClimateTropical,
  volcan: ClimateVolcan,
};
