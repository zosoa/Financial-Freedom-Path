import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Copy, Check, Rocket, TrendingUp, TreePine, Footprints } from "lucide-react";
import finksmartLogo from "@assets/FinkSmart_logo_final.png";
import { toPng } from "html-to-image";

interface FreedomScoreCardProps {
  open: boolean;
  onClose: () => void;
  freedomScore: number;
  freedomAge: number;
  targetAge: number;
  gapPercent: number;
  country: string;
  currency: string;
  narrativeType: "critical" | "moderate" | "on_track" | "basically_there";
  personality: string;
  subtitle: string;
  monthlySavings: number;
}

export function FreedomScoreCard({
  open,
  onClose,
  freedomScore,
  freedomAge,
  targetAge,
  gapPercent,
  country,
  currency,
  narrativeType,
  personality,
  subtitle,
  monthlySavings,
}: FreedomScoreCardProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const gradients: Record<string, string> = {
    critical: "from-orange-600 via-rose-500 to-red-600",
    moderate: "from-amber-500 via-orange-400 to-yellow-500",
    on_track: "from-emerald-500 via-teal-400 to-cyan-500",
    basically_there: "from-violet-600 via-blue-500 to-cyan-400",
  };

  const personalityIcons: Record<string, typeof Rocket> = {
    critical: Footprints,
    moderate: TreePine,
    on_track: TrendingUp,
    basically_there: Rocket,
  };

  const Icon = personalityIcons[narrativeType];

  const taglines: Record<string, string> = {
    critical: t("freedomCard.exploring"),
    moderate: t("freedomCard.building"),
    on_track: t("freedomCard.trailBlazing"),
    basically_there: t("freedomCard.liftoff"),
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#1a1a1a",
      });
      const link = document.createElement("a");
      link.download = `freedom-score-${freedomScore}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
    } finally {
      setIsDownloading(false);
    }
  };

  const shareText = t("freedomCard.shareText", {
    personality,
    score: freedomScore,
    age: freedomAge,
    canYouBeat: t("freedomCard.canYouBeat"),
  });

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-center">
            {t("freedomCard.title")}
          </DialogTitle>
        </DialogHeader>

        <div
          ref={cardRef}
          className={`rounded-md overflow-hidden bg-gradient-to-br ${gradients[narrativeType]} text-white`}
          data-testid="card-share"
        >
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img src={finksmartLogo} alt="FinkSmart" className="h-6 w-auto brightness-0 invert opacity-80" />
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                {personality}
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                  <span className="text-4xl font-bold">{freedomScore}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-white/70 tracking-wider uppercase">{t("freedomCard.score")}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-md p-4 mb-4">
              <p className="text-center text-sm font-medium italic">
                "{taglines[narrativeType]}"
              </p>
            </div>

            <div className="text-center mb-4 px-2">
              <p className="text-sm font-semibold">
                {t("freedomCard.freedomAge")}: {freedomAge}
              </p>
              {freedomAge > targetAge ? (
                <p className="text-xs text-white/70 mt-1">
                  ({t("freedomCard.afterTarget", { years: freedomAge - targetAge, target: targetAge })})
                </p>
              ) : (
                <p className="text-xs text-white/70 mt-1">
                  {freedomAge === targetAge ? t("freedomCard.rightOnTarget") : t("freedomCard.beforeTarget", { target: targetAge })}
                </p>
              )}
            </div>
          </div>

          <div className="bg-black/20 px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-white/50">
              {t("freedomCard.canYouBeat")}
            </p>
            <p className="text-xs text-white/60 font-medium">
              finksmart.com
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            disabled={isDownloading}
            data-testid="button-download-image"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? t("freedomCard.saving") : t("freedomCard.download")}
          </Button>
          <Button
            className="flex-1"
            onClick={handleCopyShare}
            data-testid="button-copy-share"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t("freedomCard.copied")}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {t("freedomCard.copyToShare")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
