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
  reportUrl?: string;
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
    basically_there: "Astronaut",
    on_track: "Trail Blazer",
    moderate: "Base Camp Builder",
    critical: "First Steps Explorer",
  };
  return map[type] || "Explorer";
}

function getPersonalityDescription(type: string): string {
  const map: Record<string, string> = {
    basically_there: "Your financial trajectory puts freedom within reach right on schedule. Your discipline and planning have paid off brilliantly.",
    on_track: "You're cutting through financial complexity with confidence. A few smart optimizations could launch you even faster toward freedom.",
    moderate: "You're building something real. Your foundation is solid, and with strategic tweaks you can shave years off your timeline.",
    critical: "You've taken the most important step -- knowing where you stand. With the right moves, you can dramatically reshape your trajectory.",
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
        <a href="${data.reportUrl}" style="display: inline-block; background: #C05621; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 9999px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
          View My Full Interactive Report
        </a>
        <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">Access your detailed charts, projections, and strategy levers anytime</p>
      </div>`
    : "";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #faf9f7; border-radius: 12px; padding: 28px 32px; text-align: center; margin-bottom: 24px; border: 1px solid #e8e4de;">
      <img src="https://finksmart.com/finksmart-logo.png" alt="FinkSmart - Pro-Investing Decoded" style="max-width: 200px; height: auto;" />
    </div>

    <div style="background: #ffffff; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      <p style="color: #64748b; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
        Hi ${data.recipientName},<br><br>
        Here is your personal Freedom Report -- your complete financial independence analysis. Keep this email as your reference.
      </p>

      <!-- Freedom Score Circle -->
      <div style="text-align: center; padding: 20px; background: #faf9f7; border-radius: 10px; margin-bottom: 24px;">
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Your Freedom Score</p>
        <div style="display: inline-block; width: 90px; height: 90px; border-radius: 50%; background: ${scoreColor}15; border: 3px solid ${scoreColor}; line-height: 90px; text-align: center;">
          <span style="font-size: 36px; font-weight: 800; color: ${scoreColor};">${data.freedomScore}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0;">out of 100</p>
        <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 10px 0 2px 0;">${personality}</p>
        <p style="font-size: 12px; color: #64748b; margin: 0; max-width: 400px; display: inline-block; line-height: 1.5;">${personalityDesc}</p>
      </div>

      <!-- HERO: Freedom Age vs Target Age -->
      <div style="background: ${ageColors.bgColor}; border: 2px solid ${ageColors.color}30; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; font-weight: 600;">
          Financial Freedom Timeline
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Your Target</p>
              <p style="font-size: 42px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1;">${data.targetAge}</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">years old</p>
            </td>
            <td style="width: 16%; text-align: center; vertical-align: middle;">
              <div style="font-size: 20px; color: ${ageColors.color}; font-weight: 700;">vs</div>
            </td>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Projected (6%)</p>
              <p style="font-size: 42px; font-weight: 800; color: ${ageColors.color}; margin: 0; line-height: 1;">${data.freedomAge}</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">years old</p>
            </td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${ageColors.color}20;">
          ${isOnTrack
            ? `<p style="color: #22c55e; font-size: 15px; font-weight: 700; margin: 0;">
                You're on track or ahead of schedule!
                ${yearsDiff < 0 ? `You could reach freedom ${Math.abs(yearsDiff)} year${Math.abs(yearsDiff) !== 1 ? 's' : ''} early.` : ''}
              </p>`
            : `<p style="color: ${ageColors.color}; font-size: 15px; font-weight: 700; margin: 0;">
                ${yearsDiff} year${yearsDiff !== 1 ? 's' : ''} gap to close
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">
                At your current pace, you'll reach financial freedom ${yearsDiff} year${yearsDiff !== 1 ? 's' : ''} later than planned
              </p>`
          }
        </div>
      </div>

      <!-- Key Numbers -->
      <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-weight: 600; text-align: center;">Your Full Report</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #faf9f7; border-radius: 10px; overflow: hidden;">
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Your Age</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.age}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Target Freedom Age</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.targetAge}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Projected Freedom Age</span><br>
            <span style="color: ${ageColors.color}; font-size: 16px; font-weight: 700;">${data.freedomAge}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Gap Status</span><br>
            ${isOnTrack 
              ? `<span style="color: #22c55e; font-size: 14px; font-weight: 600;">On track</span>`
              : `<span style="color: #f97316; font-size: 14px; font-weight: 600;">${Math.round(data.gapPercent)}% gap</span>`
            }
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Desired Monthly Income</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.desiredMonthlyIncome)}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Net Income</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.monthlyIncome)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Current Savings</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.currentSavings)}</span>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Savings</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.monthlySavingsRate)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Required Capital</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.requiredCapital)}</span>
          </td>
          <td style="padding: 14px 16px; text-align: right;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Projected Capital (6%)</span><br>
            <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${data.currencySymbol}${formatNumber(data.plannedCapital)}</span>
          </td>
        </tr>
        ${gapCapital > 0 ? `
        <tr>
          <td colspan="2" style="padding: 14px 16px; background: ${ageColors.bgColor}; border-top: 2px solid ${ageColors.color}20;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Capital Gap</span><br>
            <span style="color: ${ageColors.color}; font-size: 18px; font-weight: 800;">${data.currencySymbol}${formatNumber(gapCapital)}</span>
            <span style="color: #64748b; font-size: 12px; margin-left: 8px;">needed to close the gap</span>
          </td>
        </tr>` : ""}
      </table>

      ${reportLink}

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #92400e; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">What's next?</p>
        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
          Your numbers tell a story -- but the real power is in optimizing your strategy.
          Our UHNW-trained advisors can help you find the hidden levers in your financial plan.
          Visit <a href="https://finksmart.com" style="color: #C05621; text-decoration: underline; font-weight: 600;">finksmart.com</a> to retake the test or explore your options.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://finksmart.com" style="display: inline-block; background: linear-gradient(135deg, #C05621, #9C4221, #7B341E); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 9999px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
          Retake My Freedom Check
        </a>
      </div>
    </div>

    <div style="text-align: center; padding: 16px;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        FinkSmart: Pro-Investing Decoded &middot; Sponsored by BLACKWAVE CAPITAL
      </p>
      <p style="color: #cbd5e1; font-size: 10px; margin: 0; line-height: 1.5;">
        This report is for educational purposes only and does not constitute financial advice.
        All projections are hypothetical, based on simplified assumptions (2% inflation, 6% SWR).
        Past performance does not guarantee future results. Consult a qualified advisor before making investment decisions.
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
      subject: `Your Freedom Report: Score ${data.freedomScore}/100 | Target Age ${data.targetAge} vs Projected ${data.freedomAge} -- ${personality}`,
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
    ? "You're already on track or ahead -- that's impressive. Our team will review your profile and share ideas to protect and accelerate what you've built."
    : `You have a ${Math.round(data.gapPercent)}% gap to close. That's exactly the kind of insight our advisors specialize in -- turning a gap into a clear, actionable strategy.`;

  const ageComparisonHtml = hasFreedomAge ? `
      <!-- Freedom Age vs Target Age Hero -->
      <div style="background: ${ageColors.bgColor}; border: 2px solid ${ageColors.color}30; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-weight: 600;">
          Your Financial Freedom Timeline
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 10px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Your Target</p>
              <p style="font-size: 36px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1;">${data.targetAge}</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 2px 0 0 0;">years old</p>
            </td>
            <td style="width: 16%; text-align: center; vertical-align: middle;">
              <div style="font-size: 18px; color: ${ageColors.color}; font-weight: 700;">vs</div>
            </td>
            <td style="width: 42%; text-align: center; padding: 0 8px;">
              <p style="color: #94a3b8; font-size: 10px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Projected (6%)</p>
              <p style="font-size: 36px; font-weight: 800; color: ${ageColors.color}; margin: 0; line-height: 1;">${data.freedomAge}</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 2px 0 0 0;">years old</p>
            </td>
          </tr>
        </table>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid ${ageColors.color}20;">
          ${isOnTrack
            ? `<p style="color: #22c55e; font-size: 14px; font-weight: 700; margin: 0;">On track${yearsDiff < 0 ? ` -- ${Math.abs(yearsDiff)} year${Math.abs(yearsDiff) !== 1 ? 's' : ''} early!` : '!'}</p>`
            : `<p style="color: ${ageColors.color}; font-size: 14px; font-weight: 700; margin: 0;">${yearsDiff} year${yearsDiff !== 1 ? 's' : ''} gap to close</p>`
          }
        </div>
      </div>` : "";

  const capitalHtml = (data.requiredCapital && data.plannedCapital && sym) ? `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #faf9f7; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Required Capital</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 700;">${sym}${formatNumber(data.requiredCapital)}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Projected Capital (6%)</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 700;">${sym}${formatNumber(data.plannedCapital)}</span>
          </td>
        </tr>
        ${data.desiredMonthlyIncome ? `
        <tr>
          <td colspan="2" style="padding: 12px 16px;">
            <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Desired Monthly Income</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 700;">${sym}${formatNumber(data.desiredMonthlyIncome)}</span>
          </td>
        </tr>` : ""}
      </table>` : "";

  const reportLinkHtml = data.reportUrl ? `
      <div style="text-align: center; margin: 16px 0;">
        <a href="${data.reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #C05621, #9C4221); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
          View My Full Report
        </a>
      </div>` : "";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <div style="background: #faf9f7; border-radius: 12px; padding: 28px 32px; text-align: center; margin-bottom: 24px; border: 1px solid #e8e4de;">
      <img src="https://finksmart.com/finksmart-logo.png" alt="FinkSmart - Pro-Investing Decoded" style="max-width: 200px; height: auto;" />
    </div>

    <div style="background: #ffffff; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0; font-weight: 700;">
        You're in, ${data.recipientName}.
      </h2>
      <p style="color: #64748b; font-size: 15px; margin: 0 0 20px 0; line-height: 1.7;">
        Your Freedom Roadmap has been secured and your profile is now flagged for a personal Risk Analysis by one of our UHNW-trained advisors.
      </p>

      <div style="text-align: center; padding: 20px; background: #faf9f7; border-radius: 10px; margin-bottom: 24px;">
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Your Freedom Score</p>
        <div style="display: inline-block; width: 72px; height: 72px; border-radius: 50%; background: ${scoreColor}15; border: 3px solid ${scoreColor}; line-height: 72px; text-align: center;">
          <span style="font-size: 28px; font-weight: 800; color: ${scoreColor};">${data.freedomScore}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">out of 100</p>
        ${personality ? `<p style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 8px 0 0 0;">${personality}</p>` : ""}
      </div>

      ${ageComparisonHtml}

      ${capitalHtml}

      <p style="color: #64748b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.7;">
        ${gapMessage}
      </p>

      ${reportLinkHtml}

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">What happens next?</p>
        <ol style="color: #15803d; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>A UHNW-trained advisor reviews your profile</li>
          <li>They'll reach out within 24 hours via WhatsApp or email</li>
          <li>You'll have a no-pressure conversation about your strategy</li>
        </ol>
      </div>

      <p style="color: #64748b; font-size: 13px; margin: 0 0 24px 0; line-height: 1.6;">
        In the meantime, feel free to retake the Freedom Check anytime to experiment with different scenarios -- what if you saved more, or retired earlier?
      </p>

      <div style="text-align: center;">
        <a href="https://finksmart.com" style="display: inline-block; background: linear-gradient(135deg, #C05621, #9C4221, #7B341E); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 9999px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
          Explore More Scenarios
        </a>
      </div>
    </div>

    <div style="text-align: center; padding: 16px;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        FinkSmart: Pro-Investing Decoded &middot; Sponsored by BLACKWAVE CAPITAL
      </p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        BNP Paribas | Deutsche Bank | Citi | Julius Baer | Afrasia Bank
      </p>
      <p style="color: #cbd5e1; font-size: 10px; margin: 0; line-height: 1.5;">
        This email confirms your request for a personal Freedom Roadmap review.
        Your data is only shared with our selected institutional partners as described when you submitted the form.
        No financial advice is provided in this email.
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
      subject: `You're in, ${data.recipientName} -- your advisor review is underway${subjectAge}`,
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
