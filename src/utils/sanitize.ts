import sanitizeHtmlLib from "sanitize-html";

export function sanitizeHtml(input: string): string {
  return sanitizeHtmlLib(input || "", {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function sanitizeForDisplay(input: string): string {
  return sanitizeHtmlLib(input || "", {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "br"],
    allowedAttributes: {
      a: ["href"],
    },
    allowedSchemes: ["http", "https"],
  });
}

export function sanitizeText(input: string): string {
  return (input || "")
    .trim()
    .replace(/[<>"']/g, "")
    .substring(0, 1000);
}

export function sanitizeEmail(email: string): string {
  return (email || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, "");
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: Array<keyof T>
): T {
  const sanitized = { ...obj };

  for (const field of fields) {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeText(sanitized[field] as string) as any;
    }
  }

  return sanitized;
}
