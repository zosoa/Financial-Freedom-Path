/**
 * ResultsPreview — stylised mockup of the results dashboard.
 * Used on the landing page in place of static PNG screenshots.
 * Pure HTML+SVG, no real data, no API calls.
 */
import MountainAscent from "./MountainAscent";
import { IconTarget, IconGrowth, IconCompound } from "../icons";
import { Sparkles } from "lucide-react";

type Props = { className?: string };

export default function ResultsPreview({ className }: Props) {
  return (
    <div className={className}>
      <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-2xl shadow-black/10">
        {/* Browser chrome */}
        <div className="bg-muted/40 px-4 py-3 flex items-center gap-2 border-b border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-muted-foreground bg-background px-3 py-1 rounded-full">
              finksmart.com/results
            </span>
          </div>
        </div>

        {/* Body — mimics the real Results page layout */}
        <div className="p-5 md:p-7 space-y-5 bg-gradient-to-b from-[hsl(36_64%_97%)] to-[hsl(36_64%_95%)] dark:from-[hsl(222_40%_12%)] dark:to-[hsl(222_40%_9%)]">
          {/* 1 — Hero strip (profile + score) */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-mint grid place-items-center shadow-lg shadow-emerald-500/30 shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint/15 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-3 h-3" />
                Trail Blazer
              </span>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-mint mt-2 leading-tight">
                Vous serez libre à 52 ans
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Soit 3 ans avant votre objectif
              </p>
            </div>
            <div className="text-center shrink-0">
              <div className="w-14 h-14 rounded-full bg-card border-2 border-mint grid place-items-center">
                <span className="font-serif text-lg font-bold text-mint">82</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Score</span>
            </div>
          </div>

          {/* Score context micro-row */}
          <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-mint/15 text-emerald-700 dark:text-emerald-300 font-semibold">
              8 ans avant la retraite (60 ans)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold">
              Top 12 %
            </span>
          </div>

          {/* 2 — Mountain ascent */}
          <div className="rounded-2xl bg-card border border-card-border p-3 md:p-4">
            <MountainAscent
              currentAge={35}
              freedomAge={52}
              targetAge={55}
              labels={{
                today: "aujourd'hui",
                freedom: "vous serez libre",
                target: "votre objectif",
                yearsSuffix: "ans",
              }}
              className="w-full"
            />
          </div>

          {/* 3 — Stats row */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <StatTile Icon={IconTarget} label="Capital cible" value="₨ 47 M" tone="amber" />
            <StatTile Icon={IconGrowth} label="Avance gagnée" value="+3 ans" tone="mint" />
            <StatTile Icon={IconCompound} label="Taux d'épargne" value="22%" tone="sky" />
          </div>

          {/* 4 — Compact chart preview */}
          <div className="rounded-2xl bg-card border border-card-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Évolution du capital</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-mint" />
                  Géré
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky" />
                  Standard
                </span>
              </div>
            </div>
            <svg viewBox="0 0 400 100" className="w-full">
              <defs>
                <linearGradient id="prev-mint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="prev-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* mint area (managed) */}
              <path
                d="M0 95 Q60 90 100 75 Q160 60 200 45 Q260 28 300 18 Q360 8 400 3 L400 100 L0 100 Z"
                fill="url(#prev-mint)"
              />
              <path
                d="M0 95 Q60 90 100 75 Q160 60 200 45 Q260 28 300 18 Q360 8 400 3"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
              {/* sky area (standard) */}
              <path
                d="M0 96 Q60 92 100 84 Q160 75 200 65 Q260 53 300 45 Q360 36 400 30 L400 100 L0 100 Z"
                fill="url(#prev-sky)"
              />
              <path
                d="M0 96 Q60 92 100 84 Q160 75 200 65 Q260 53 300 45 Q360 36 400 30"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="2"
              />
              {/* target ref line */}
              <line x1="280" y1="0" x2="280" y2="100" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="282" y="12" fontSize="8" fill="#D97706" fontWeight="600">55 ans</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: (p: { size?: number }) => JSX.Element;
  label: string;
  value: string;
  tone: "amber" | "mint" | "sky";
}) {
  const toneCls =
    tone === "amber"
      ? "bg-primary/8 border-primary/20"
      : tone === "mint"
      ? "bg-mint/8 border-mint/20"
      : "bg-sky/8 border-sky/20";
  return (
    <div className={`rounded-xl border p-2.5 md:p-3 flex items-center gap-2 ${toneCls}`}>
      <Icon size={28} />
      <div className="min-w-0">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold leading-none">{label}</p>
        <p className="font-serif text-sm md:text-base font-bold leading-tight mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
