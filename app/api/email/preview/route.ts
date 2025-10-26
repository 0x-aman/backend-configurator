// Preview email template
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { renderEmailTemplate } from '@/src/lib/email';
import { EmailTemplateService } from '@/src/services/email-template.service';
import { success, fail } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { templateId, variables, body: templateBody, subject: templateSubject } = body;

    let html, subject;

    if (templateId) {
      const template = await EmailTemplateService.getById(templateId);
      html = renderEmailTemplate(template.body, variables || {});
      subject = renderEmailTemplate(template.subject, variables || {});
    } else if (templateBody && templateSubject) {
      html = renderEmailTemplate(templateBody, variables || {});
      subject = renderEmailTemplate(templateSubject, variables || {});
    } else {
      return fail('Template ID or template content is required', 'VALIDATION_ERROR');
    }

    return success({ html, subject });
  } catch (error: any) {
    return fail(error.message, 'PREVIEW_ERROR', 500);
  }
}
