// Validation utilities

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address');
  }
}

export function validatePassword(password: string): void {
  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 8 characters long');
  }
}

export interface ValidationRule {
  field: string;
  value: any;
  rules: ('required' | 'email' | 'password' | 'url' | 'domain' | 'phone')[];
}

export function validate(rules: ValidationRule[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const rule of rules) {
    for (const r of rule.rules) {
      try {
        switch (r) {
          case 'required':
            validateRequired(rule.value, rule.field);
            break;
          case 'email':
            if (rule.value) validateEmail(rule.value);
            break;
          case 'password':
            if (rule.value) validatePassword(rule.value);
            break;
          case 'url':
            if (rule.value && !isValidUrl(rule.value)) {
              throw new Error(`${rule.field} must be a valid URL`);
            }
            break;
          case 'domain':
            if (rule.value && !isValidDomain(rule.value)) {
              throw new Error(`${rule.field} must be a valid domain`);
            }
            break;
          case 'phone':
            if (rule.value && !isValidPhone(rule.value)) {
              throw new Error(`${rule.field} must be a valid phone number`);
            }
            break;
        }
      } catch (error: any) {
        errors.push(error.message);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
