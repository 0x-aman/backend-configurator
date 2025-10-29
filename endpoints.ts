/*
  Auto-generated endpoints manifest
  - Provides a simple JSON-like map of API endpoints to a short description and typical HTTP methods.
  - Keep this file in sync when you add/remove API route files under `app/api`.

  NOTE: Methods are inferred from route intent (common REST conventions) and may not exactly match the exported handlers
  in every route file. Use the route files themselves as the source of truth for exact verbs and payload shapes.
*/

const ENDPOINTS: Record<string, { methods: string[]; description: string }> = {
  "/api/[[...path]]": {
    methods: ["GET", "POST", "PUT", "DELETE"],
    description: "Catch-all API proxy used by dynamic or legacy routes. Check implementation in app/api/[[...path]]/route.ts",
  },

  // Auth
  "/api/auth/[...nextauth]": {
    methods: ["GET", "POST"],
    description: "NextAuth authentication endpoint (OAuth callbacks, session, providers).",
  },
  "/api/auth/login": { methods: ["POST"], description: "Local login endpoint (email/password)." },
  "/api/auth/register": { methods: ["POST"], description: "Create a new client/user account." },
  "/api/auth/logout": { methods: ["POST"], description: "Log the current user out / revoke session." },
  "/api/auth/me": { methods: ["GET"], description: "Return authenticated user / client profile." },
  "/api/auth/forgot-password": { methods: ["POST"], description: "Start password reset flow (email)." },
  "/api/auth/reset-password": { methods: ["POST"], description: "Complete password reset with token and new password." },
  "/api/auth/add-password": { methods: ["POST"], description: "Add a password to an OAuth-only account (enable local login)." },
  "/api/auth/unlink-google": { methods: ["POST"], description: "Unlink Google account from local client/user." },

  // Client management
  "/api/client/me": { methods: ["GET"], description: "Get current client details (profile, subscription info)." },
  "/api/client/update": { methods: ["PUT", "PATCH"], description: "Update client metadata (name, billing contact, etc)." },
  "/api/client/domains": { methods: ["GET", "POST"], description: "Manage client custom domains for embeds/sites." },

  // Configurators (product builder)
  "/api/configurator/create": { methods: ["POST"], description: "Create a new configurator (project)." },
  "/api/configurator/list": { methods: ["GET"], description: "List configurators for the current client." },
  "/api/configurator/update": { methods: ["PUT", "PATCH"], description: "Update a configurator's metadata or settings." },
  "/api/configurator/delete": { methods: ["DELETE"], description: "Delete a configurator." },
  "/api/configurator/duplicate": { methods: ["POST"], description: "Duplicate an existing configurator." },
  "/api/configurator/[publicId]": { methods: ["GET"], description: "Public endpoint to fetch a configurator by public id (embedable)." },

  // Quotes
  "/api/quote/create": { methods: ["POST"], description: "Create a quote from a configurator or cart." },
  "/api/quote/list": { methods: ["GET"], description: "List quotes for the current client." },
  "/api/quote/update": { methods: ["PUT", "PATCH"], description: "Update quote status or metadata." },
  "/api/quote/[quoteCode]": { methods: ["GET"], description: "Fetch a single quote by its public code." },

  // Options (configurator options)
  "/api/option/create": { methods: ["POST"], description: "Create a new option for a configurator (e.g. color, accessory)." },
  "/api/option/list": { methods: ["GET"], description: "List options for a configurator or client." },
  "/api/option/update": { methods: ["PUT", "PATCH"], description: "Update an option's details or pricing." },

  // Categories
  "/api/category/list": { methods: ["GET"], description: "List product/configurator categories." },
  "/api/category/create": { methods: ["POST"], description: "Create a new category." },
  "/api/category/update": { methods: ["PUT", "PATCH"], description: "Update a category." },

  // Themes
  "/api/theme/list": { methods: ["GET"], description: "List available themes for embeds or configurators." },
  "/api/theme/create": { methods: ["POST"], description: "Create a new theme (colors, fonts)." },
  "/api/theme/update": { methods: ["PUT", "PATCH"], description: "Update a theme." },

  // Files
  "/api/files/upload": { methods: ["POST"], description: "Upload assets (images, attachments) to S3 or project storage." },
  "/api/files/list": { methods: ["GET"], description: "List uploaded files for the client/project." },
  "/api/files/delete": { methods: ["DELETE"], description: "Delete files or assets." },

  // Email / templates
  "/api/email/send": { methods: ["POST"], description: "Send transactional emails (quotes, confirmations)." },
  "/api/email/templates": { methods: ["GET", "POST"], description: "Manage email templates and previews." },
  "/api/email/preview": { methods: ["POST"], description: "Render an email preview (HTML) for templates." },

  // Billing / Stripe
  "/api/billing": { methods: ["GET"], description: "General billing info endpoint (may return account/subscription summary)." },
  "/api/billing/create-session": { methods: ["POST"], description: "Create a Stripe Checkout session for subscription purchase." },
  "/api/billing/verify-session": { methods: ["GET"], description: "Server-side verification helper to fetch Stripe checkout session and update subscription state." },
  "/api/billing/portal": { methods: ["POST"], description: "Create a Stripe customer portal session for billing management." },
  "/api/billing/transactions": { methods: ["GET"], description: "List billing transactions/invoices for the client." },
  "/api/billing/webhook": { methods: ["POST"], description: "Stripe webhook receiver for subscription, invoice and checkout events." },
  "/api/billing/cancel-subscription": { methods: ["POST"], description: "Cancel an active subscription for the client." },

  // Admin
  "/api/admin/clients": { methods: ["GET", "POST"], description: "Admin endpoint to list/manage clients." },
  "/api/admin/stats": { methods: ["GET"], description: "Admin analytics and statistics endpoint." },

  // Analytics
  "/api/analytics/usage": { methods: ["GET"], description: "Usage metrics (configurator/quote usage) for dashboards." },
  "/api/analytics/performance": { methods: ["GET"], description: "Performance metrics for analytics dashboards." },
  "/api/embed/analytics": { methods: ["POST"], description: "Embed analytics collector for front-end embeds (events)." },

  // Embed endpoints
  "/api/embed/configurator/[publicKey]": { methods: ["GET"], description: "Public embed endpoint for configurators identified by a public key." },

  // Misc
  "/api/health": { methods: ["GET"], description: "Healthcheck endpoint used by uptime monitors and deployment checks." },
};

export default ENDPOINTS;
