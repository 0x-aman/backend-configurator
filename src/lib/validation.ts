/**
 * Request Validation Utilities
 * 
 * Provides Zod-based validation schemas for common API request patterns
 */

import { z } from "zod";

// ==================== Common Schemas ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const idSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// ==================== Theme Schemas ====================

export const createThemeSchema = z.object({
  token: z.string().min(1, "Edit token is required"),
  name: z.string().min(1, "Theme name is required").max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
  primaryColor: z.string().regex(/^\d+ \d+% \d+%$/, "Invalid HSL color format").default("220 70% 50%"),
  secondaryColor: z.string().regex(/^\d+ \d+% \d+%$/, "Invalid HSL color format").default("340 70% 50%"),
  accentColor: z.string().regex(/^\d+ \d+% \d+%$/, "Invalid HSL color format").default("280 70% 50%"),
  backgroundColor: z.string().regex(/^\d+ \d+% \d+%$/, "Invalid HSL color format").default("0 0% 100%"),
  surfaceColor: z.string().regex(/^\d+ \d+% \d+%$/, "Invalid HSL color format").default("0 0% 98%"),
  textColor: z.string().regex(/^\d+ \d+% \d+%$/, "Invalid HSL color format").default("0 0% 10%"),
  textColorMode: z.enum(["AUTO", "WHITE", "BLACK", "CUSTOM"]).default("AUTO"),
  customTextColor: z.string().optional(),
  fontFamily: z.string().default("Inter, sans-serif"),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  borderRadius: z.string().default("0.5rem"),
  spacingUnit: z.string().default("1rem"),
  maxWidth: z.string().default("1200px"),
  customCSS: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateThemeSchema = z.object({
  token: z.string().min(1, "Edit token is required"),
  id: z.string().min(1, "Theme ID is required"),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  primaryColor: z.string().regex(/^\d+ \d+% \d+%$/).optional(),
  secondaryColor: z.string().regex(/^\d+ \d+% \d+%$/).optional(),
  accentColor: z.string().regex(/^\d+ \d+% \d+%$/).optional(),
  backgroundColor: z.string().regex(/^\d+ \d+% \d+%$/).optional(),
  surfaceColor: z.string().regex(/^\d+ \d+% \d+%$/).optional(),
  textColor: z.string().regex(/^\d+ \d+% \d+%$/).optional(),
  textColorMode: z.enum(["AUTO", "WHITE", "BLACK", "CUSTOM"]).optional(),
  customTextColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  borderRadius: z.string().optional(),
  spacingUnit: z.string().optional(),
  maxWidth: z.string().optional(),
  customCSS: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==================== Configurator Schemas ====================

export const createConfiguratorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens").optional(),
  themeId: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  currencySymbol: z.string().max(5).default("$"),
  language: z.string().length(2).default("en"),
  timezone: z.string().default("UTC"),
  allowQuotes: z.boolean().default(true),
  requireEmail: z.boolean().default(true),
  autoPricing: z.boolean().default(false),
  showTotal: z.boolean().default(true),
  password: z.string().min(6).optional(),
});

export const updateConfiguratorSchema = z.object({
  token: z.string().min(1, "Edit token is required"),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  themeId: z.string().optional(),
  currency: z.string().length(3).optional(),
  currencySymbol: z.string().max(5).optional(),
  language: z.string().length(2).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  allowQuotes: z.boolean().optional(),
  requireEmail: z.boolean().optional(),
  autoPricing: z.boolean().optional(),
  showTotal: z.boolean().optional(),
  password: z.string().min(6).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  ogImage: z.string().url().optional(),
});

// ==================== Category Schemas ====================

export const categoryTypeEnum = z.enum([
  "GENERIC", "COLOR", "DIMENSION", "MATERIAL", 
  "FEATURE", "ACCESSORY", "POWER", "TEXT", "FINISH", "CUSTOM"
]);

export const createCategorySchema = z.object({
  configuratorId: z.string().min(1, "Configurator ID is required"),
  name: z.string().min(1, "Category name is required").max(200),
  categoryType: categoryTypeEnum.default("GENERIC"),
  description: z.string().max(1000).optional(),
  helpText: z.string().max(500).optional(),
  isPrimary: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  orderIndex: z.number().int().min(0).default(0),
  icon: z.string().optional(),
  imageUrl: z.string().url().optional(),
  minSelections: z.number().int().min(0).default(1),
  maxSelections: z.number().int().min(1).default(1),
});

// ==================== Option Schemas ====================

export const createOptionSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  label: z.string().min(1, "Label is required").max(200),
  description: z.string().max(1000).optional(),
  sku: z.string().max(100).optional(),
  price: z.number().min(0, "Price must be non-negative"),
  cost: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  gallery: z.array(z.string().url()).default([]),
  orderIndex: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).default(10),
  color: z.string().optional(),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  weight: z.number().min(0).optional(),
  voltage: z.string().optional(),
  wattage: z.string().optional(),
  materialType: z.string().optional(),
  finishType: z.string().optional(),
  textValue: z.string().optional(),
  maxCharacters: z.number().int().min(1).optional(),
});

// ==================== Quote Schemas ====================

export const quoteStatusEnum = z.enum([
  "DRAFT", "PENDING", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"
]);

export const createQuoteSchema = z.object({
  configuratorId: z.string().optional(),
  customerEmail: z.string().email("Invalid email address"),
  customerName: z.string().min(1).max(200).optional(),
  customerPhone: z.string().max(50).optional(),
  customerCompany: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  selectedOptions: z.record(z.any()),
  configuration: z.record(z.any()).optional(),
  totalPrice: z.number().min(0),
  subtotal: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  taxAmount: z.number().min(0).optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ==================== Validation Helper ====================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: z.ZodError };

/**
 * Validate request body against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or errors
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format Zod validation errors for API response
 * 
 * @param errors - Zod error object
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}
