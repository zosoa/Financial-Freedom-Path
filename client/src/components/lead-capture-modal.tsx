import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { MessageCircle, Shield, Check, Loader2 } from "lucide-react";
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
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !whatsapp.trim()) return;
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/leads", {
        calculationId,
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        country,
        currency,
        gapPercent,
        freedomScore,
        referralSource: referralSource || null,
      });
      setIsSubmitted(true);
    } catch (e) {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setName("");
      setWhatsapp("");
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
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <DialogTitle className="font-serif text-xl text-center">
                  Get your free expert explanation
                </DialogTitle>
                <DialogDescription className="text-center">
                  An independent, UHNW-trained professional will walk you through your results on WhatsApp. No products, no pressure.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="lead-name">Your name</Label>
                  <Input
                    id="lead-name"
                    placeholder="John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-lead-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-whatsapp">WhatsApp number</Label>
                  <Input
                    id="lead-whatsapp"
                    placeholder="+1 234 567 8900"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    data-testid="input-lead-whatsapp"
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!name.trim() || !whatsapp.trim() || isSubmitting}
                  data-testid="button-submit-lead"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Sending..." : "Connect me with an expert"}
                </Button>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Your data is private. We never share it without your consent.</span>
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
                You're in good hands
              </h3>
              <p className="text-muted-foreground mb-6">
                An expert will reach out to you on WhatsApp within 24 hours. They'll explain your numbers in plain language&mdash;no jargon, no pressure.
              </p>
              <Button variant="outline" onClick={handleClose} data-testid="button-close-lead-success">
                Back to my results
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
