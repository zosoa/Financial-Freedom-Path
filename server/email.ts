import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReportEmailData {
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
}

function formatNumber(num: number): string {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getPersonalityEmoji(type: string): string {
  const map: Record<string, string> = {
    basically_there: "🚀",
    on_track: "🔥",
    moderate: "🏕️",
    critical: "👣",
  };
  return map[type] || "📊";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export async function sendReportEmail(data: ReportEmailData): Promise<boolean> {
  const scoreColor = getScoreColor(data.freedomScore);
  const emoji = getPersonalityEmoji(data.narrativeType);
  const gapStatus = data.gapPercent <= 0 
    ? `<span style="color: #22c55e; font-weight: 600;">On track or ahead of schedule!</span>` 
    : `<span style="color: #f97316; font-weight: 600;">${Math.round(data.gapPercent)}% gap to close</span>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0; font-weight: 700;">Freedom Path</h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Pro-Investing Decoded</p>
    </div>

    <div style="background: #ffffff; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      <p style="color: #64748b; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
        Hi ${data.recipientName},<br><br>
        Here is your saved Freedom Report. Keep this email as your personal reference — it contains your full financial independence analysis.
      </p>

      <div style="text-align: center; padding: 24px; background: #faf9f7; border-radius: 10px; margin-bottom: 24px;">
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Your Freedom Score</p>
        <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background: ${scoreColor}20; line-height: 80px; text-align: center;">
          <span style="font-size: 32px; font-weight: 800; color: ${scoreColor};">${data.freedomScore}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">out of 100</p>
        <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 12px 0 0 0;">${emoji} ${data.personality}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 12px;">Your Age</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.age}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 12px;">Target Freedom Age</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.targetAge}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 12px;">Projected Freedom Age (6%)</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.freedomAge}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 12px;">Gap Status</span><br>
            <span style="font-size: 14px;">${gapStatus}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 12px;">Desired Monthly Income</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.currencySymbol}${formatNumber(data.desiredMonthlyIncome)}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 12px;">Monthly Net Income</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.currencySymbol}${formatNumber(data.monthlyIncome)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="color: #94a3b8; font-size: 12px;">Current Savings</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.currencySymbol}${formatNumber(data.currentSavings)}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="color: #94a3b8; font-size: 12px;">Monthly Savings</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.currencySymbol}${formatNumber(data.monthlySavingsRate)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px;">
            <span style="color: #94a3b8; font-size: 12px;">Required Capital</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.currencySymbol}${formatNumber(data.requiredCapital)}</span>
          </td>
          <td style="padding: 12px 16px; text-align: right;">
            <span style="color: #94a3b8; font-size: 12px;">Projected Capital (6%)</span><br>
            <span style="color: #1e293b; font-size: 15px; font-weight: 600;">${data.currencySymbol}${formatNumber(data.plannedCapital)}</span>
          </td>
        </tr>
      </table>

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
          <strong>What's next?</strong> Your numbers tell a story — but the real power is in optimizing your strategy. 
          Our UHNW-trained advisors can help you find the hidden levers in your financial plan. 
          Visit <a href="https://finksmart.com" style="color: #d97706; text-decoration: underline;">finksmart.com</a> to retake the test or explore your options.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://finksmart.com" style="display: inline-block; background: #d97706; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
          Retake My Freedom Check
        </a>
      </div>
    </div>

    <div style="text-align: center; padding: 16px;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
        Freedom Path: Pro-Investing Decoded &middot; Sponsored by BLACKWAVE CAPITAL
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
      from: "Freedom Path <onboarding@resend.dev>",
      to: data.recipientEmail,
      subject: `Your Freedom Score: ${data.freedomScore}/100 — ${data.personality}`,
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
