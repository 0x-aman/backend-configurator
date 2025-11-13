// Environment variable validation and exports

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://localhost:3000",
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",

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
  APP_URL: process.env.APP_URL || "https://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "https://localhost:3000",

  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "60000"),

  // Subscription Pricing
  MONTHLY_PRICE: parseFloat(process.env.MONTHLY_PRICE || "99.00"),
  YEARLY_PRICE: parseFloat(process.env.YEARLY_PRICE || "999.00"),

  // ✅ Centralized CORS Configuration
  // Set to '*' for local development, or comma-separated domains for production
  // Example: "https://my-app.com,https://dashboard.my-app.com,https://admin.my-app.com"
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [
        "*", // Allow all origins in development - change in production!
      ],

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Next.js Public Variables (client-side)
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",

  //edit token secret
  EDIT_TOKEN_SECRET: process.env.EDIT_TOKEN_SECRET,
};

// ✅ Fixed: Strict environment validation
export function validateEnv() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];

  const missing = required.filter((key) => !env[key as keyof typeof env]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate NEXTAUTH_SECRET strength
  if (env.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      "⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters for security"
    );
  }

  // Warn about wildcard CORS in production
  if (env.NODE_ENV === "production" && env.CORS_ALLOWED_ORIGINS.includes("*")) {
    console.warn(
      "⚠️  WARNING: CORS is set to allow all origins (*) in production. This is insecure! Set CORS_ALLOWED_ORIGINS to specific domains."
    );
  }

  // Warn about missing optional but important variables
  const optional = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "RESEND_API_KEY",
    "STRIPE_SECRET_KEY",
  ];

  const missingOptional = optional.filter(
    (key) => !env[key as keyof typeof env]
  );

  if (missingOptional.length > 0 && env.NODE_ENV === "production") {
    console.warn(
      `⚠️  WARNING: Missing optional environment variables (features may not work): ${missingOptional.join(
        ", "
      )}`
    );
  }

  console.log("✅ Environment variables validated successfully");
  console.log(
    `📍 CORS allowed origins: ${env.CORS_ALLOWED_ORIGINS.join(", ")}`
  );
}

// Validate on import (only in Node.js environment)
if (typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
  }
}
