import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ReportEmailData {
  recipientEmail: string;
  recipientName: string;
  freedomScore: number;
  freedomAge: number;
  targetAge: number;
  gapPercent: number;
  requiredCapital: number;
  plannedCapital: number;
  country: string;
  currency: string;
  currencySymbol: string;
  age: number;
  monthlyIncome: number;
  desiredMonthlyIncome: number;
  monthlySavingsRate: number;
  currentSavings: number;
  personality: string;
  narrativeType: string;
  // Permalink back to the live /results page with all params preserved.
  reportUrl?: string;
  // CTA URL for retaking the calculator from scratch.
  retakeUrl?: string;
  // CTA URL pointing at /risk-dna with all Phase 1 params (when DNA not yet done).
  riskDnaUrl?: string;
  // Phase 2 — Risk DNA climate, if the user has completed it.
  climate?: string | null;
  climateName?: string | null;
  climateReturn?: number | null;
  climateAdvice1?: string | null;
  climateAdvice2?: string | null;
  climateAdvice3?: string | null;
  allocBonds?: number | null;
  allocEquity?: number | null;
  allocAlt?: number | null;
  dnaScore?: number | null;
}

function formatNumber(num: number): string {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getPersonalityLabel(type: string): string {
  const map: Record<string, string> = {
    basically_there: "Astronaute Financier",
    on_track: "Éclaireur",
    moderate: "Bâtisseur de Camp de Base",
    critical: "Explorateur des Premiers Pas",
  };
  return map[type] || "Explorateur";
}

function getPersonalityDescription(type: string): string {
  const map: Record<string, string> = {
    basically_there: "Votre trajectoire financière place la liberté à portée de main, pile dans les temps. Votre discipline et votre planification ont brillamment porté leurs fruits.",
    on_track: "Vous naviguez dans la complexité financière avec confiance. Quelques optimisations stratégiques pourraient vous propulser encore plus vite vers la liberté.",
    moderate: "Vous construisez quelque chose de solide. Vos fondations sont en place, et avec quelques ajustements stratégiques, vous pouvez gagner des années sur votre parcours.",
    critical: "Vous avez franchi l'étape la plus importante — savoir où vous en êtes. Avec les bons choix, vous pouvez transformer radicalement votre trajectoire.",
  };
  return map[type] || "";
}

function getAgeComparisonColor(freedomAge: number, targetAge: number): { color: string; bgColor: string } {
  if (freedomAge <= targetAge) return { color: "#22c55e", bgColor: "#f0fdf4" };
  if (freedomAge <= targetAge + 5) return { color: "#f59e0b", bgColor: "#fffbeb" };
  return { color: "#ef4444", bgColor: "#fef2f2" };
}

export async function sendReportEmail(data: ReportEmailData): Promise<boolean> {
  const scoreColor = getScoreColor(data.freedomScore);
  const personality = getPersonalityLabel(data.narrativeType);
  const personalityDesc = getPersonalityDescription(data.narrativeType);
  const ageColors = getAgeComparisonColor(data.freedomAge, data.targetAge);
  const yearsDiff = data.freedomAge - data.targetAge;
  const isOnTrack = yearsDiff <= 0;
  const gapCapital = Math.max(0, data.requiredCapital - data.plannedCapital);

  const reportLink = data.reportUrl
    ? `<div style="text-align: center; margin: 24px 0;">
        <a href="${data.reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #F97316 100%); color: #1E1B14 !important; text-decoration: none; padding: 14px 36px; border-radius: 14px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 8px 24px -8px rgba(245, 158, 11, 0.55);">
          Voir Mon Rapport Interactif Complet →
        </a>
        <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">Tes graphiques détaillés, projections et leviers stratégiques à tout moment</p>
      </div>`
    : "";

  // Phase 2 — DNA section (only when the user has completed the Risk DNA).
  const hasDna = !!data.climate && !!data.climateName;
  const dnaSection = hasDna ? `
      <div style="background: linear-gradient(180deg, #FFFBF1 0%, #FEF6E4 100%); border: 1px solid #F5E6C9; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <p style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0; font-weight: 700;">
          Phase 2 · Risk DNA
        </p>
        <p style="font-size: 26px; font-weight: 800; color: #1E293B; margin: 0; line-height: 1.15;">
          Ton climat : ${data.climateName}
        </p>
        <p style="font-size: 13px; color: #64748B; margin: 6px 0 16px 0;">
          Score Risk DNA : <strong style="color: #D97706;">${data.dnaScore ?? "—"} / 35</strong> &middot; Rendement réaliste : <strong style="color: #D97706;">${data.climateReturn ?? "—"} %/an</strong>
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #F5E6C9;">
          <tr>
            <td style="padding: 12px 14px;">
              <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Allocation cible</span><br>
              <span style="color: #1E293B; font-size: 14px; font-weight: 700;">
                ${data.allocBonds ?? 0}% obligations &middot; ${data.allocEquity ?? 0}% actions &middot; ${data.allocAlt ?? 0}% alternatifs
              </span>
            </td>
          </tr>
        </table>
        <p style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 16px 0 8px 0; font-weight: 700;">
          Tes 3 conseils prioritaires
        </p>
        <ol style="color: #1E293B; font-size: 13.5px; padding-left: 20px; margin: 0; line-height: 1.7;">
          ${data.climateAdvice1 ? `<li style="margin-bottom: 6px;">${data.climateAdvice1}</li>` : ""}
          ${data.climateAdvice2 ? `<li style="margin-bottom: 6px;">${data.climateAdvice2}</li>` : ""}
          ${data.climateAdvice3 ? `<li>${data.climateAdvice3}</li>` : ""}
        </ol>
      </div>
  ` : "";

  // CTA shown when DNA hasn't been done yet — drives users back to the Risk DNA flow.
  const dnaCta = !hasDna && data.riskDnaUrl ? `
      <div style="background: #FFFBF1; border: 1px solid #F5E6C9; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0; font-weight: 700;">
          La suite — Phase 2
        </p>
        <p style="color: #1E293B; font-size: 16px; font-weight: 700; margin: 0 0 10px 0;">
          Décode ton ADN d'investisseur en 7 questions
        </p>
        <p style="color: #64748B; font-size: 13px; margin: 0 0 14px 0; line-height: 1.6;">
          Tu sauras quel rendement réaliste viser, comment allouer ton capital, et 3 règles cardinales calibrées pour ton profil.
        </p>
        <a href="${data.riskDnaUrl}" style="display: inline-block; background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #F97316 100%); color: #1E1B14 !important; text-decoration: none; padding: 12px 28px; border-radius: 14px; font-size: 13px; font-weight: 700;">
          Décoder mon ADN →
        </a>
      </div>
  ` : "";

  const retakeBtn = data.retakeUrl ? `
      <div style="text-align: center;">
        <a href="${data.retakeUrl}" style="display: inline-block; background: #ffffff; color: #92400E !important; text-decoration: none; padding: 12px 28px; border-radius: 14px; font-size: 13px; font-weight: 700; border: 1.5px solid #F5E6C9;">
          Refaire le test
        </a>
      </div>
  ` : "";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FEF6E4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #FFFBF1; border-radius: 16px; padding: 28px 32px; text-align: center; margin-bottom: 24px; border: 1px solid #F5E6C9;">
      <img src="https://finksmart.com/finksmart-logo.png" alt="FinkSmart" style="max-width: 180px; height: auto;" />
      <!-- Mini hero illustration: sun + mountain (inline SVG, ~600 bytes) -->
      <svg viewBox="0 0 320 100" width="100%" style="max-width: 320px; margin-top: 12px; display: block; margin-left: auto; margin-right: auto;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="240" cy="35" r="20" fill="#FBBF24"/>
        <circle cx="240" cy="35" r="28" fill="#FBBF24" opacity="0.25"/>
        <path d="M0 90 L70 40 L110 65 L160 30 L210 60 L320 90 Z" fill="#FB923C" opacity="0.85"/>
        <path d="M105 32 L110 28 L114 33 L112 34 L110 31 L107 33 Z" fill="#FFF7ED"/>
        <path d="M155 28 L160 23 L165 30 L162 32 L160 29 L158 31 Z" fill="#FFF7ED"/>
        <line x1="160" y1="23" x2="160" y2="14" stroke="#1E293B" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M160 14 L172 17 L160 20 Z" fill="#10B981"/>
      </svg>
      <p style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0 0; font-weight: 700;">
        Pro-Investing Decoded
      </p>
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px -8px rgba(15, 23, 42, 0.08); border: 1px solid #F5E6C9;">
      <h2 style="color: #1E293B; font-size: 24px; margin: 0 0 8px 0; font-weight: 800; line-height: 1.2;">
        Bonjour ${data.recipientName},
      </h2>
      <p style="color: #64748b; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
        Voici ton Rapport de Liberté personnel — ton analyse complète d'indépendance financière. Garde cet email comme référence.
      </p>

      <!-- Freedom Score Circle -->
      <div style="text-align: center; padding: 20px; background: #FFFBF1; border-radius: 10px; margin-bottom: 24px;">
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Votre Score de Liberté</p>
        <div style="display: inline-block; width: 90px; height: 90px; border-radius: 50%; background: ${scoreColor}15; border: 3px solid ${scoreColor}; line-height: 90px; text-align: center;">
          <span style="font-size: 36px; font-weight: 800; color: ${scoreColor};">${data.freedomScore}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0;">sur 100</p>
        <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 10px 0 2px 0;">${personality}</p>
        <p style="font-size: 12px; color: #64748b; margin: 0; max-width: 400px; display: inline-block; line-height: 1.5;">${personalityDesc}</p>
      </div>

      <!-- HERO: Freedom Age vs Target Age -->
      <div style="background: ${ageColors.bgColor}; border: 2px solid ${ageColors.color}30; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; font-weight: 600;">
          Chronologie de la Liberté Financière
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Votre Objectif</p>
              <p style="font-size: 42px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1;">${data.targetAge}</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">ans</p>
            </td>
            <td style="width: 16%; text-align: center; vertical-align: middle;">
              <div style="font-size: 20px; color: ${ageColors.color}; font-weight: 700;">vs</div>
            </td>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Projeté (6%)</p>
              <p style="font-size: 42px; font-weight: 800; color: ${ageColors.color}; margin: 0; line-height: 1;">${data.freedomAge}</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">ans</p>
            </td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${ageColors.color}20;">
          ${isOnTrack
            ? `<p style="color: #22c55e; font-size: 15px; font-weight: 700; margin: 0;">
                Vous êtes en bonne voie ou en avance !
                ${yearsDiff < 0 ? `Vous pourriez atteindre la liberté ${Math.abs(yearsDiff)} an${Math.abs(yearsDiff) !== 1 ? 's' : ''} plus tôt.` : ''}
              </p>`
            : `<p style="color: ${ageColors.color}; font-size: 15px; font-weight: 700; margin: 0;">
                ${yearsDiff} an${yearsDiff !== 1 ? 's' : ''} d'écart à combler
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">
                À votre rythme actuel, vous atteindrez la liberté financière ${yearsDiff} an${yearsDiff !== 1 ? 's' : ''} plus tard que prévu
              </p>`
          }
        </div>
      </div>

      <!-- Key Numbers -->
      <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-weight: 600; text-align: center;">Votre Rapport Complet</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #FFFBF1; border-radius: 10px; overflow: hidden;">
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Votre Âge</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.age}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Âge de Liberté Visé</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.targetAge}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Âge de Liberté Projeté</span><br>
            <span style="color: ${ageColors.color}; font-size: 16px; font-weight: 700;">${data.freedomAge}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Statut</span><br>
            ${isOnTrack 
              ? `<span style="color: #22c55e; font-size: 14px; font-weight: 600;">En bonne voie</span>`
              : `<span style="color: #f97316; font-size: 14px; font-weight: 600;">${Math.round(data.gapPercent)}% d'écart</span>`
            }
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Revenu Mensuel Souhaité</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.desiredMonthlyIncome)}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Revenu Mensuel Net</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.monthlyIncome)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Épargne Actuelle</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.currentSavings)}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Épargne Mensuelle</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.monthlySavingsRate)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Capital Requis</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.requiredCapital)}</span>
          </td>
          <td style="padding: 14px 16px; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Capital Projeté (6%)</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.plannedCapital)}</span>
          </td>
        </tr>
        ${gapCapital > 0 ? `
        <tr>
          <td colspan="2" style="padding: 14px 16px; background: ${ageColors.bgColor}; border-top: 2px solid ${ageColors.color}20;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Écart de Capital</span><br>
            <span style="color: ${ageColors.color}; font-size: 18px; font-weight: 800;">${data.currencySymbol}${formatNumber(gapCapital)}</span>
            <span style="color: #64748b; font-size: 12px; margin-left: 8px;">à combler pour atteindre l'objectif</span>
          </td>
        </tr>` : ""}
      </table>

      ${dnaSection}

      ${reportLink}

      ${dnaCta}

      <div style="background: #FFFBF1; border: 1px solid #F5E6C9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #92400e; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">Et maintenant ?</p>
        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
          ${hasDna
            ? "Tu as ton diagnostic complet : ton score, ton tier, ton climat, ton allocation cible et tes 3 règles cardinales. Garde cet email, partage-le, et reviens régulièrement pour tracker tes progrès."
            : "Tes chiffres racontent une histoire — mais le vrai pouvoir réside dans le diagnostic complet : décode ton ADN d'investisseur juste au-dessus pour obtenir ton allocation cible et tes 3 conseils personnalisés."}
        </p>
      </div>

      ${retakeBtn}
    </div>

    <div style="text-align: center; padding: 16px;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        FinkSmart : Pro-Investing Decoded &middot; Sponsorisé par BLACKWAVE CAPITAL
      </p>
      <p style="color: #cbd5e1; font-size: 10px; margin: 0; line-height: 1.5;">
        Ce rapport est à but éducatif uniquement et ne constitue pas un conseil financier.
        Toutes les projections sont hypothétiques, basées sur des hypothèses simplifiées (inflation 2 %, TSR 6 %).
        Les performances passées ne garantissent pas les résultats futurs. Consultez un conseiller qualifié avant toute décision d'investissement.
      </p>
      <p style="color: #cbd5e1; font-size: 10px; margin: 8px 0 0 0;">
        finksmart.com
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: "FinkSmart <hello@finksmart.com>",
      to: data.recipientEmail,
      subject: `Votre Rapport de Liberté : Score ${data.freedomScore}/100 | Objectif ${data.targetAge} vs Projeté ${data.freedomAge} — ${personality}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

export interface LeadConfirmationData {
  recipientEmail: string;
  recipientName: string;
  freedomScore: number;
  gapPercent: number;
  freedomAge?: number;
  targetAge?: number;
  requiredCapital?: number;
  plannedCapital?: number;
  age?: number;
  currency?: string;
  currencySymbol?: string;
  desiredMonthlyIncome?: number;
  personality?: string;
  reportUrl?: string;
}

export async function sendLeadConfirmationEmail(data: LeadConfirmationData): Promise<boolean> {
  const scoreColor = getScoreColor(data.freedomScore);
  const hasFreedomAge = data.freedomAge !== undefined && data.targetAge !== undefined;
  const yearsDiff = hasFreedomAge ? (data.freedomAge! - data.targetAge!) : 0;
  const isOnTrack = yearsDiff <= 0;
  const ageColors = hasFreedomAge ? getAgeComparisonColor(data.freedomAge!, data.targetAge!) : { color: "#f59e0b", bgColor: "#fffbeb" };
  const personality = data.personality ? getPersonalityLabel(data.personality) : "";
  const sym = data.currencySymbol || "";

  const gapMessage = data.gapPercent <= 0
    ? "Vous êtes déjà en bonne voie ou en avance — impressionnant. Notre équipe analysera votre profil et partagera des idées pour protéger et accélérer ce que vous avez construit."
    : `Vous avez un écart de ${Math.round(data.gapPercent)}% à combler. C'est exactement le type d'analyse dans lequel nos conseillers excellent — transformer un écart en stratégie claire et actionnable.`;

  const ageComparisonHtml = hasFreedomAge ? `
      <!-- Freedom Age vs Target Age Hero -->
      <div style="background: ${ageColors.bgColor}; border: 2px solid ${ageColors.color}30; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-weight: 600;">
          Votre Chronologie de Liberté Financière
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 10px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Votre Objectif</p>
              <p style="font-size: 36px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1;">${data.targetAge}</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 2px 0 0 0;">ans</p>
            </td>
            <td style="width: 16%; text-align: center; vertical-align: middle;">
              <div style="font-size: 18px; color: ${ageColors.color}; font-weight: 700;">vs</div>
            </td>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 10px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Projeté (6%)</p>
              <p style="font-size: 36px; font-weight: 800; color: ${ageColors.color}; margin: 0; line-height: 1;">${data.freedomAge}</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 2px 0 0 0;">ans</p>
            </td>
          </tr>
        </table>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid ${ageColors.color}20;">
          ${isOnTrack
            ? `<p style="color: #22c55e; font-size: 14px; font-weight: 700; margin: 0;">En bonne voie${yearsDiff < 0 ? ` — ${Math.abs(yearsDiff)} an${Math.abs(yearsDiff) !== 1 ? 's' : ''} d'avance !` : ' !'}</p>`
            : `<p style="color: ${ageColors.color}; font-size: 14px; font-weight: 700; margin: 0;">${yearsDiff} an${yearsDiff !== 1 ? 's' : ''} d'écart à combler</p>`
          }
        </div>
      </div>` : "";

  const capitalHtml = (data.requiredCapital && data.plannedCapital && sym) ? `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #FFFBF1; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Capital Requis</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 700;">${sym}${formatNumber(data.requiredCapital)}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Capital Projeté (6%)</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 700;">${sym}${formatNumber(data.plannedCapital)}</span>
          </td>
        </tr>
        ${data.desiredMonthlyIncome ? `
        <tr>
          <td colspan="2" style="padding: 12px 16px;">
            <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Revenu Mensuel Souhaité</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 700;">${sym}${formatNumber(data.desiredMonthlyIncome)}</span>
          </td>
        </tr>` : ""}
      </table>` : "";

  const reportLinkHtml = data.reportUrl ? `
      <div style="text-align: center; margin: 16px 0;">
        <a href="${data.reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #FBBF24, #F59E0B); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
          Voir Mon Rapport Complet
        </a>
      </div>` : "";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FEF6E4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <div style="background: #FFFBF1; border-radius: 16px; padding: 28px 32px; text-align: center; margin-bottom: 24px; border: 1px solid #F5E6C9;">
      <img src="https://finksmart.com/finksmart-logo.png" alt="FinkSmart" style="max-width: 180px; height: auto;" />
      <svg viewBox="0 0 320 100" width="100%" style="max-width: 320px; margin-top: 12px; display: block; margin-left: auto; margin-right: auto;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="240" cy="35" r="20" fill="#FBBF24"/>
        <circle cx="240" cy="35" r="28" fill="#FBBF24" opacity="0.25"/>
        <path d="M0 90 L70 40 L110 65 L160 30 L210 60 L320 90 Z" fill="#FB923C" opacity="0.85"/>
        <path d="M105 32 L110 28 L114 33 L112 34 L110 31 L107 33 Z" fill="#FFF7ED"/>
        <path d="M155 28 L160 23 L165 30 L162 32 L160 29 L158 31 Z" fill="#FFF7ED"/>
        <line x1="160" y1="23" x2="160" y2="14" stroke="#1E293B" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M160 14 L172 17 L160 20 Z" fill="#10B981"/>
      </svg>
      <p style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0 0; font-weight: 700;">
        Pro-Investing Decoded
      </p>
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px -8px rgba(15, 23, 42, 0.08); border: 1px solid #F5E6C9;">
      <h2 style="color: #1E293B; font-size: 24px; margin: 0 0 16px 0; font-weight: 800; line-height: 1.2;">
        Bienvenue ${data.recipientName}.
      </h2>
      <p style="color: #64748b; font-size: 15px; margin: 0 0 20px 0; line-height: 1.7;">
        Votre Feuille de Route vers la Liberté est sécurisée et votre profil est maintenant signalé pour une Analyse de Risque personnelle par l'un de nos conseillers formés en gestion UHNW.
      </p>

      <div style="text-align: center; padding: 20px; background: #FFFBF1; border-radius: 10px; margin-bottom: 24px;">
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Votre Score de Liberté</p>
        <div style="display: inline-block; width: 72px; height: 72px; border-radius: 50%; background: ${scoreColor}15; border: 3px solid ${scoreColor}; line-height: 72px; text-align: center;">
          <span style="font-size: 28px; font-weight: 800; color: ${scoreColor};">${data.freedomScore}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">sur 100</p>
        ${personality ? `<p style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 8px 0 0 0;">${personality}</p>` : ""}
      </div>

      ${ageComparisonHtml}

      ${capitalHtml}

      <p style="color: #64748b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.7;">
        ${gapMessage}
      </p>

      ${reportLinkHtml}

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Que se passe-t-il ensuite ?</p>
        <ol style="color: #15803d; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Un conseiller formé en gestion UHNW examine votre profil</li>
          <li>Il vous contactera sous 24 heures par WhatsApp ou email</li>
          <li>Vous aurez une conversation sans pression sur votre stratégie</li>
        </ol>
      </div>

      <p style="color: #64748b; font-size: 13px; margin: 0 0 24px 0; line-height: 1.6;">
        En attendant, n'hésitez pas à refaire le Bilan de Liberté pour tester différents scénarios — et si vous épargniez davantage ou partiez plus tôt à la retraite ?
      </p>

      <div style="text-align: center;">
        <a href="https://finksmart.com" style="display: inline-block; background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #F97316 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 9999px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
          Explorer Plus de Scénarios
        </a>
      </div>
    </div>

    <div style="text-align: center; padding: 16px;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        FinkSmart : Pro-Investing Decoded &middot; Sponsorisé par BLACKWAVE CAPITAL
      </p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        BNP Paribas | Deutsche Bank | Citi | Julius Baer | Afrasia Bank
      </p>
      <p style="color: #cbd5e1; font-size: 10px; margin: 0; line-height: 1.5;">
        Cet email confirme votre demande d'analyse personnelle de Feuille de Route vers la Liberté.
        Vos données ne sont partagées qu'avec nos partenaires institutionnels sélectionnés tel que décrit lors de votre soumission.
        Aucun conseil financier n'est fourni dans cet email.
      </p>
      <p style="color: #cbd5e1; font-size: 10px; margin: 8px 0 0 0;">
        finksmart.com
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const subjectAge = hasFreedomAge 
      ? ` | Target ${data.targetAge} vs Projected ${data.freedomAge}` 
      : "";
    const { error } = await resend.emails.send({
      from: "FinkSmart <hello@finksmart.com>",
      to: data.recipientEmail,
      subject: `Bienvenue ${data.recipientName} — votre analyse par un conseiller est en cours${subjectAge}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Lead confirmation email error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Lead confirmation email failed:", err);
    return false;
  }
}
