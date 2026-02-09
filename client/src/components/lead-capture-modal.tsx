import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        country,
        currency,
        gapPercent,
        freedomScore,
        lifeEvent: lifeEvent.trim() || null,
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
                  Secure Your Results & Unlock Phase 2
                </DialogTitle>
                <DialogDescription className="text-center">
                  Lock in your Freedom Roadmap and get your Personal Risk Profile analyzed by a UHNW-trained professional. No products, no pressure -- just clarity.
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
                  <Label htmlFor="lead-email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email address
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-lead-email"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">We'll send your saved roadmap to this email</p>
                </div>
                <div>
                  <Label htmlFor="lead-whatsapp" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp / Phone number
                  </Label>
                  <Input
                    id="lead-whatsapp"
                    placeholder="+1 234 567 8900"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    data-testid="input-lead-whatsapp"
                  />
                </div>

                <div>
                  <Label htmlFor="lead-life-event" className="text-xs text-muted-foreground">
                    What is the one life event we must account for in your plan? (Optional)
                  </Label>
                  <Textarea
                    id="lead-life-event"
                    placeholder="e.g., Wedding in 2027, inheritance expected, property sale planned..."
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
                  {isSubmitting ? "Securing..." : "Send My Roadmap & Unlock Risk Analysis"}
                </Button>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Your data is shared only with our vetted institutional partners.</span>
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
                Your roadmap is secured!
              </h3>
              <p className="text-muted-foreground mb-3">
                Check your email for your saved Freedom Roadmap. A UHNW-trained expert will reach out within 24 hours to walk you through your Risk Profile.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                No jargon, no pressure -- just a clear conversation about your strategy.
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
