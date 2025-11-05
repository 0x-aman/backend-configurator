// Input sanitization utilities
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML input to prevent XSS attacks
 * Removes all HTML tags and keeps only text content
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    KEEP_CONTENT: true, // Keep text content
  }).trim();
}

/**
 * Sanitize input for display (allows safe HTML)
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return '';
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, ''); // Only allow valid email characters
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize object with multiple fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: Array<keyof T>
): T {
  const sanitized = { ...obj };
  
  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeText(sanitized[field] as string) as T[keyof T];
    }
  }
  
  return sanitized;
}
