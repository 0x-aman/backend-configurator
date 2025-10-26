// Input sanitization utilities

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>"']/g, '');
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - use a library like DOMPurify for production
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+\-()\s]/g, '');
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
}
