import { motion } from "framer-motion";

interface MountainPathVisualProps {
  freedomScore: number;
  freedomAge: number;
  currentAge: number;
  narrativeType: "critical" | "moderate" | "on_track" | "basically_there";
}

export function MountainPathVisual({
  freedomScore,
  freedomAge,
  currentAge,
  narrativeType,
}: MountainPathVisualProps) {
  const progress = Math.min(100, Math.max(0, freedomScore));
  const horizonClarity = progress / 100;

  const skyColors = {
    critical: { from: "#4a3a5c", to: "#8b6b9e" },
    moderate: { from: "#5c5a3a", to: "#c4a84d" },
    on_track: { from: "#3a5c4a", to: "#7ec8a0" },
    basically_there: { from: "#3a4a5c", to: "#7ab8d4" },
  };

  const sunPosition = 20 + progress * 0.6;
  const sunOpacity = 0.3 + horizonClarity * 0.7;

  const pathPoints = [];
  const totalPoints = 20;
  for (let i = 0; i <= totalPoints; i++) {
    const x = (i / totalPoints) * 100;
    const baseY = 75 - (i / totalPoints) * 40;
    const wave = Math.sin(i * 0.8) * 3;
    pathPoints.push(`${x},${baseY + wave}`);
  }

  const walkerPosition = progress;
  const walkerX = (walkerPosition / 100) * 100;
  const walkerIndex = Math.round((walkerPosition / 100) * totalPoints);
  const walkerBaseY = 75 - (walkerIndex / totalPoints) * 40;
  const walkerWave = Math.sin(walkerIndex * 0.8) * 3;
  const walkerY = walkerBaseY + walkerWave - 4;

  const clouds = [
    { cx: 15, cy: 18, opacity: Math.max(0, 1 - horizonClarity * 1.5) },
    { cx: 35, cy: 12, opacity: Math.max(0, 0.8 - horizonClarity * 1.3) },
    { cx: 55, cy: 20, opacity: Math.max(0, 0.6 - horizonClarity * 1.0) },
    { cx: 75, cy: 15, opacity: Math.max(0, 0.4 - horizonClarity * 0.8) },
    { cx: 90, cy: 22, opacity: Math.max(0, 0.3 - horizonClarity * 0.6) },
  ];

  return (
    <div className="rounded-md overflow-hidden" data-testid="visual-mountain-path">
      <svg
        viewBox="0 0 100 80"
        className="w-full"
        style={{ background: `linear-gradient(180deg, ${skyColors[narrativeType].from}, ${skyColors[narrativeType].to} 60%, hsl(30 20% 75%) 100%)` }}
      >
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity={sunOpacity} />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(30, 20%, 60%)" />
            <stop offset="100%" stopColor="hsl(30, 30%, 50%)" />
          </linearGradient>
        </defs>

        <motion.circle
          cx={sunPosition}
          cy="15"
          r="8"
          fill="url(#sunGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.circle
          cx={sunPosition}
          cy="15"
          r="3"
          fill="#ffd700"
          opacity={sunOpacity}
          initial={{ opacity: 0 }}
          animate={{ opacity: sunOpacity }}
          transition={{ duration: 1.5 }}
        />

        {clouds.map((cloud, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: cloud.opacity }}
            transition={{ duration: 1 }}
          >
            <ellipse cx={cloud.cx} cy={cloud.cy} rx="6" ry="2" fill="rgba(200,200,210,0.5)" />
            <ellipse cx={cloud.cx - 3} cy={cloud.cy + 0.5} rx="4" ry="1.5" fill="rgba(200,200,210,0.4)" />
            <ellipse cx={cloud.cx + 3} cy={cloud.cy + 0.5} rx="4" ry="1.5" fill="rgba(200,200,210,0.4)" />
          </motion.g>
        ))}

        <polygon points="70,35 85,75 55,75" fill="hsl(25, 15%, 45%)" opacity="0.4" />
        <polygon points="80,30 100,75 60,75" fill="hsl(25, 15%, 40%)" opacity="0.5" />
        <polygon points="25,45 40,75 10,75" fill="hsl(25, 15%, 50%)" opacity="0.3" />

        <polygon points="85,28 100,70 70,70" fill="hsl(25, 12%, 55%)" opacity="0.6" />
        <polygon points="88,28 92,28 90,22" fill="white" opacity={0.3 + horizonClarity * 0.5} />

        <polyline
          points={pathPoints.join(" ")}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.7"
        />

        <motion.g
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <circle
            cx={walkerX}
            cy={walkerY}
            r="2"
            fill="hsl(24, 80%, 50%)"
            stroke="white"
            strokeWidth="0.5"
          />
          <line
            x1={walkerX}
            y1={walkerY + 2}
            x2={walkerX}
            y2={walkerY + 5}
            stroke="hsl(24, 80%, 50%)"
            strokeWidth="0.5"
          />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <circle cx="95" cy="33" r="1.5" fill="hsl(24, 80%, 50%)" opacity="0.8" />
          <line x1="95" y1="31" x2="95" y2="29" stroke="hsl(24, 80%, 50%)" strokeWidth="0.3" opacity="0.8" />
          <polygon points="94,29 95,27 96,29" fill="hsl(24, 80%, 50%)" opacity="0.8" />
        </motion.g>

        <rect x="0" y="70" width="100" height="10" fill="hsl(30, 20%, 75%)" opacity="0.3" />

        <text x="5" y="78" fontSize="2.5" fill="white" opacity="0.7" fontFamily="sans-serif">
          Age {currentAge}
        </text>
        <text x="85" y="78" fontSize="2.5" fill="white" opacity="0.7" fontFamily="sans-serif" textAnchor="end">
          Age {freedomAge}
        </text>
      </svg>
    </div>
  );
}
