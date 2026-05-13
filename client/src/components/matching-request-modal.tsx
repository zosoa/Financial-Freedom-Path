import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Shield, Check, Loader2, Mail, Phone, Sparkles, Network } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MatchingRequestModalProps {
  open: boolean;
  onClose: () => void;
  calculationId: string | null;
  country: string;
  currency: string;
  climate: string | null;
  freedomScore: number;
  gapPercent: number;
  referralSource?: string;
  sessionId?: string;
  /** Pre-fill if the user already submitted a lead earlier. */
  prefillName?: string;
  prefillEmail?: string;
  prefillWhatsapp?: string;
  /** Called after a successful submission. */
  onSuccess?: (name: string, email: string) => void;
}

/**
 * "Demander une mise en relation" — explicit opt-in to be introduced
 * to FinkSmart's regulated partner network (asset managers, brokers,
 * licensed advisors).
 *
 * Pre-fills name / email / WhatsApp from earlier lead submissions so
 * the user only sees the *additional* commitment they're making:
 * sharing their data with a regulated specialist.
 */
export function MatchingRequestModal({
  open,
  onClose,
  calculationId,
  country,
  currency,
  climate,
  freedomScore,
  gapPercent,
  referralSource,
  sessionId,
  prefillName = "",
  prefillEmail = "",
  prefillWhatsapp = "",
  onSuccess,
}: MatchingRequestModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [whatsapp, setWhatsapp] = useState(prefillWhatsapp);
  const [partnerConsent, setPartnerConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    whatsapp.trim().length > 0 &&
    partnerConsent &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const capturedName = name.trim();
    const capturedEmail = email.trim();
    try {
      await apiRequest("POST", "/api/leads", {
        calculationId,
        sessionId: sessionId || null,
        name: capturedName,
        email: capturedEmail,
        whatsapp: whatsapp.trim(),
        country,
        currency,
        gapPercent,
        freedomScore,
        leadStatus: "matching_requested",
        lifeEvent: climate ? `climate:${climate}` : null,
        referralSource: referralSource || null,
      });
      setIsSubmitted(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(capturedName, capturedEmail), 1200);
      }
    } catch (e) {
      console.error("Matching request submission failed:", e);
      setIsSubmitted(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(capturedName, capturedEmail), 1200);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setPartnerConsent(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="w-14 h-14 rounded-2xl bg-mint/15 grid place-items-center mx-auto mb-3">
                  <Network className="w-7 h-7 text-mint" />
                </div>
                <DialogTitle className="font-serif text-xl text-center">
                  {t("matching.title")}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {t("matching.subtitle")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* What we will do with the data — explicit and primary */}
                <div className="rounded-2xl bg-mint/10 border border-mint/30 p-3 text-xs space-y-1.5">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-mint" />
                    {t("matching.dataUse.title")}
                  </p>
                  <ul className="text-muted-foreground space-y-0.5 leading-relaxed pl-5 list-disc">
                    <li>{t("matching.dataUse.b1")}</li>
                    <li>{t("matching.dataUse.b2")}</li>
                    <li>{t("matching.dataUse.b3")}</li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="match-name">{t("leadCapture.nameLabel")}</Label>
                  <Input
                    id="match-name"
                    placeholder={t("leadCapture.namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                    data-testid="input-match-name"
                  />
                </div>
                <div>
                  <Label htmlFor="match-email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {t("leadCapture.emailLabel")}
                  </Label>
                  <Input
                    id="match-email"
                    type="email"
                    placeholder={t("leadCapture.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                    data-testid="input-match-email"
                  />
                </div>
                <div>
                  <Label htmlFor="match-whatsapp" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {t("leadCapture.whatsappLabel")}
                  </Label>
                  <Input
                    id="match-whatsapp"
                    placeholder={t("leadCapture.whatsappPlaceholder")}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="rounded-xl"
                    data-testid="input-match-whatsapp"
                  />
                </div>

                {/* The critical second consent: explicit opt-in to be contacted by partners */}
                <label className="flex items-start gap-2 text-xs text-foreground cursor-pointer select-none rounded-xl border-2 border-primary/40 p-3 hover-elevate">
                  <input
                    type="checkbox"
                    checked={partnerConsent}
                    onChange={(e) => setPartnerConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    data-testid="checkbox-partner-consent"
                  />
                  <span className="leading-snug">
                    <strong className="block mb-0.5">{t("matching.partnerConsent.title")}</strong>
                    <span className="text-muted-foreground">{t("matching.partnerConsent.body")}</span>
                  </span>
                </label>

                <Button
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  data-testid="button-submit-matching"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "..." : t("matching.submit")}
                </Button>

                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  {t("matching.legalFooter")}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-mint/15 grid place-items-center mx-auto mb-4">
                <Check className="w-8 h-8 text-mint" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">
                {t("matching.success.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t("matching.success.subtitle")}
              </p>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                {t("leadCapture.close")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
