// Email client using Resend
import { Resend } from "resend";
import { env } from "@/src/config/env";

export const resend = new Resend(env.RESEND_API_KEY || "re_dummy_key");

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = env.FROM_EMAIL,
  replyTo,
}: SendEmailParams) {
  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export function renderEmailTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, String(value));
  }
  return rendered;
}

export async function sendQuoteEmail({
  to,
  customerName,
  quoteCode,
  totalPrice,
  configuratorName,
  quoteLink,
}: {
  to: string;
  customerName: string;
  quoteCode: string;
  totalPrice: string;
  configuratorName: string;
  quoteLink: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Quote is Ready!</h1>
          </div>
          <div class="content">
            <p>Hello ${customerName},</p>
            <p>Thank you for your interest in <strong>${configuratorName}</strong>.</p>
            <h2>Quote Details:</h2>
            <p><strong>Quote Code:</strong> ${quoteCode}</p>
            <p><strong>Total Price:</strong> ${totalPrice}</p>
            <a href="${quoteLink}" class="button">View Full Quote</a>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your Quote is Ready - ${quoteCode}`,
    html,
  });
}
