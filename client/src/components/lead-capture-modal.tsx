import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Shield, Check, Loader2, Mail, Phone, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  calculationId: string | null;
  country: string;
  currency: string;
  gapPercent: number;
  freedomScore: number;
  referralSource?: string;
  sessionId?: string;
  leadStatus?: string;
}

export function LeadCaptureModal({
  open,
  onClose,
  calculationId,
  country,
  currency,
  gapPercent,
  freedomScore,
  referralSource,
  sessionId,
  leadStatus = "risk_dna_started",
}: LeadCaptureModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lifeEvent, setLifeEvent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !whatsapp.trim()) return;
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/leads", {
        calculationId,
        sessionId: sessionId || null,
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        country,
        currency,
        gapPercent,
        freedomScore,
        leadStatus: leadStatus || "risk_dna_started",
        lifeEvent: lifeEvent.trim() || null,
        referralSource: referralSource || null,
      });
      setIsSubmitted(true);
    } catch (e) {
      console.error("Lead capture submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setName("");
      setEmail("");
      setWhatsapp("");
      setLifeEvent("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <DialogTitle className="font-serif text-xl text-center">
                  {t("leadCapture.title")}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {t("leadCapture.subtitle")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="lead-name">{t("leadCapture.nameLabel")}</Label>
                  <Input
                    id="lead-name"
                    placeholder={t("leadCapture.namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-lead-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {t("leadCapture.emailLabel")}
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder={t("leadCapture.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-lead-email"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-whatsapp" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {t("leadCapture.whatsappLabel")}
                  </Label>
                  <Input
                    id="lead-whatsapp"
                    placeholder={t("leadCapture.whatsappPlaceholder")}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    data-testid="input-lead-whatsapp"
                  />
                </div>

                <div>
                  <Label htmlFor="lead-life-event" className="text-xs text-muted-foreground">
                    {t("leadCapture.lifeEventLabel")}
                  </Label>
                  <Textarea
                    id="lead-life-event"
                    placeholder={t("leadCapture.lifeEventPlaceholder")}
                    value={lifeEvent}
                    onChange={(e) => setLifeEvent(e.target.value)}
                    className="resize-none text-sm"
                    rows={2}
                    data-testid="input-lead-life-event"
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!name.trim() || !email.trim() || !whatsapp.trim() || isSubmitting}
                  data-testid="button-submit-lead"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "..." : t("leadCapture.submit")}
                </Button>

                <div className="flex items-start gap-2 justify-center text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{t("leadCapture.subtitle")}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2" data-testid="text-lead-success">
                {t("leadCapture.success")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("leadCapture.successSubtitle")}
              </p>
              <Button variant="outline" onClick={handleClose} data-testid="button-close-lead-success">
                {t("leadCapture.close")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
