// Send email
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { sendEmail, renderEmailTemplate } from '@/src/lib/email';
import { EmailTemplateService } from '@/src/services/email-template.service';
import { success, fail } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { to, templateId, variables, subject, html } = body;

    if (!to) {
      return fail('Recipient email is required', 'VALIDATION_ERROR');
    }

    let emailHtml = html;
    let emailSubject = subject;

    // Use template if provided
    if (templateId) {
      const template = await EmailTemplateService.getById(templateId);
      emailHtml = renderEmailTemplate(template.body, variables || {});
      emailSubject = renderEmailTemplate(template.subject, variables || {});
    }

    if (!emailHtml || !emailSubject) {
      return fail('Email content and subject are required', 'VALIDATION_ERROR');
    }

    const result = await sendEmail({
      to,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!result.success) {
      return fail('Failed to send email', 'EMAIL_ERROR', 500);
    }

    return success({ sent: true, messageId: result.data }, 'Email sent');
  } catch (error: any) {
    return fail(error.message, 'EMAIL_ERROR', 500);
  }
}
