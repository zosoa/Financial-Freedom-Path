import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Share2, Compass, Copy, Check } from "lucide-react";
import { toPng } from "html-to-image";

interface FreedomScoreCardProps {
  open: boolean;
  onClose: () => void;
  freedomScore: number;
  freedomAge: number;
  gapPercent: number;
  country: string;
  currency: string;
  narrativeType: "critical" | "moderate" | "on_track" | "basically_there";
  narrativeHeadline: string;
}

export function FreedomScoreCard({
  open,
  onClose,
  freedomScore,
  freedomAge,
  gapPercent,
  country,
  currency,
  narrativeType,
  narrativeHeadline,
}: FreedomScoreCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const gradients = {
    critical: "from-rose-600 via-rose-500 to-amber-500",
    moderate: "from-amber-500 via-orange-400 to-yellow-400",
    on_track: "from-emerald-500 via-teal-400 to-cyan-400",
    basically_there: "from-blue-500 via-indigo-400 to-purple-400",
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
      // silently fail
    } finally {
      setIsDownloading(false);
    }
  };

  const shareText = `I just discovered my Freedom Score: ${freedomScore}/100. I could reach financial freedom by age ${freedomAge}. Can you beat my score? Try it free at The Freedom Path.`;

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
            Your Freedom Score Card
          </DialogTitle>
        </DialogHeader>

        <div
          ref={cardRef}
          className={`rounded-md p-6 bg-gradient-to-br ${gradients[narrativeType]} text-white`}
          data-testid="card-share"
        >
          <div className="flex items-center gap-2 mb-6">
            <Compass className="w-5 h-5 text-white/80" />
            <span className="text-sm font-medium text-white/80">The Freedom Path</span>
          </div>

          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold">{freedomScore}</span>
            </div>
            <p className="text-xs text-white/70 tracking-wide uppercase">Freedom Score</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Freedom Age</span>
              <span className="font-bold">{freedomAge}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Gap</span>
              <span className="font-bold">{gapPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Location</span>
              <span className="font-bold">{country}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center">
            <p className="text-sm font-medium">{narrativeHeadline}</p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-white/50">
              Powered by FINSIM v5 &middot; thefreedompath.com
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            disabled={isDownloading}
            data-testid="button-download-card"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Saving..." : "Download"}
          </Button>
          <Button
            className="flex-1"
            onClick={handleCopyShare}
            data-testid="button-copy-share"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to share
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
