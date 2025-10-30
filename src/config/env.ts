// Environment variable validation and exports

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "something",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || "",
  STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID || "",

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@example.com",

  // Azure Blob Storage
  AZURE_STORAGE_CONNECTION_STRING:
    process.env.AZURE_STORAGE_CONNECTION_STRING || "",
  AZURE_CONTAINER_NAME: process.env.AZURE_CONTAINER_NAME || "uploads",

  // App
  APP_NAME: process.env.APP_NAME || "SaaS Configurator",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "60000"),

  // Subscription Pricing
  MONTHLY_PRICE: parseFloat(process.env.MONTHLY_PRICE || "99.00"),
  YEARLY_PRICE: parseFloat(process.env.YEARLY_PRICE || "999.00"),

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS || "*",

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Next.js Public Variables (client-side)
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",

  //edit token secret
  EDIT_TOKEN_SECRET: process.env.EDIT_TOKEN_SECRET,
};

export function validateEnv() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];

  const missing = required.filter((key) => !env[key as keyof typeof env]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
}
