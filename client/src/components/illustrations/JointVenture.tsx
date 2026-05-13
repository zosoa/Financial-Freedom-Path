/**
 * Joint-venture identity for the FinkSmart footer / emails.
 *
 * Renders the partner logos preferring the owner-supplied PNGs at
 *   /realsmart-logo.png
 *   /gelios-logo.png
 * (drop the actual PNGs into client/public/ — they will be served from
 * the site root in dev and prod). If a file is missing the <img> hides
 * itself (onError) and the partner name still reads.
 */
import { useState } from "react";

type Props = { className?: string };

function PngLogo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit: "contain" }}
      onError={() => setFailed(true)}
    />
  );
}

export function RealSmartLogo({ className }: Props) {
  return <PngLogo src="/realsmart-logo.png" alt="RealSmart Group" className={className} />;
}

export function GeliosLogo({ className }: Props) {
  return <PngLogo src="/gelios-logo.png" alt="Gelios" className={className} />;
}

/** Footer block — the JV identity. */
export function JointVentureFooter({ tagline }: { tagline?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-semibold">
        Une joint-venture entre
      </p>
      <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
        <div className="flex items-center gap-3">
          <RealSmartLogo className="h-12 w-12" />
          <div className="text-left">
            <div className="text-sm font-bold text-foreground leading-tight">RealSmart Group</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">EU</div>
          </div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-border" />
        <div className="flex items-center gap-3">
          <GeliosLogo className="h-12 w-auto" />
          <div className="text-left">
            <div className="text-sm font-bold text-foreground leading-tight">Gelios</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Maurice</div>
          </div>
        </div>
      </div>
      {tagline && (
        <p className="text-[11px] text-muted-foreground/80 max-w-md italic">{tagline}</p>
      )}
    </div>
  );
}
