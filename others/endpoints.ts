/*
  Auto-generated endpoints manifest
  - Provides a simple JSON-like map of API endpoints to a short description and typical HTTP methods.
  - Keep this file in sync when you add/remove API route files under `app/api`.

  NOTE: Methods are inferred from route intent (common REST conventions) and may not exactly match the exported handlers
  in every route file. Use the route files themselves as the source of truth for exact verbs and payload shapes.
*/

const ENDPOINTS: Record<
  string,
  { methods: string[]; description: string; requiredHeaders?: string[] }
> = {
  "/api/[[...path]]": {
    methods: ["GET", "POST", "PUT", "DELETE"],
    description:
      "Catch-all API proxy used by dynamic or legacy routes. Check implementation in app/api/[[...path]]/route.ts",
    requiredHeaders: [],
  },

  // Auth
  "/api/auth/[...nextauth]": {
    methods: ["GET", "POST"],
    description:
      "NextAuth authentication endpoint (OAuth callbacks, session, providers).",
    // NextAuth mostly uses cookies; no special header required by default
    requiredHeaders: [],
  },
  "/api/auth/login": {
    methods: ["POST"],
    description: "Local login endpoint (email/password).",
    requiredHeaders: [],
  },
  "/api/auth/register": {
    methods: ["POST"],
    description: "Create a new client/user account.",
    requiredHeaders: [],
  },
  "/api/auth/logout": {
    methods: ["POST"],
    description: "Log the current user out / revoke session.",
    requiredHeaders: [],
  },
  "/api/auth/me": {
    methods: ["GET"],
    description: "Return authenticated user / client profile.",
    requiredHeaders: ["Authorization"],
  },
  "/api/auth/forgot-password": {
    methods: ["POST"],
    description: "Start password reset flow (email).",
    requiredHeaders: [],
  },
  "/api/auth/reset-password": {
    methods: ["POST"],
    description: "Complete password reset with token and new password.",
    requiredHeaders: [],
  },
  "/api/auth/add-password": {
    methods: ["POST"],
    description:
      "Add a password to an OAuth-only account (enable local login).",
    requiredHeaders: ["Authorization"],
  },
  "/api/auth/unlink-google": {
    methods: ["POST"],
    description: "Unlink Google account from local client/user.",
    requiredHeaders: ["Authorization"],
  },

  // Client management
  "/api/client/me": {
    methods: ["GET"],
    description: "Get current client details (profile, subscription info).",
    requiredHeaders: ["Authorization"],
  },
  "/api/client/update": {
    methods: ["PUT", "PATCH"],
    description: "Update client metadata (name, billing contact, etc).",
    requiredHeaders: ["Authorization"],
  },
  "/api/client/domains": {
    methods: ["GET", "POST"],
    description: "Manage client custom domains for embeds/sites.",
    requiredHeaders: ["Authorization"],
  },

  // Configurators (product builder)
  "/api/configurator/create": {
    methods: ["POST"],
    description: "Create a new configurator (project).",
    requiredHeaders: ["Authorization"],
  },
  "/api/configurator/list": {
    methods: ["GET"],
    description: "List configurators for the current client.",
    requiredHeaders: ["Authorization"],
  },
  "/api/configurator/update": {
    methods: ["PUT", "PATCH"],
    description: "Update a configurator's metadata or settings.",
    requiredHeaders: ["Authorization"],
  },
  "/api/configurator/delete": {
    methods: ["DELETE"],
    description: "Delete a configurator.",
    requiredHeaders: ["Authorization"],
  },
  "/api/configurator/duplicate": {
    methods: ["POST"],
    description: "Duplicate an existing configurator.",
    requiredHeaders: ["Authorization"],
  },
  "/api/configurator/[publicId]": {
    methods: ["GET"],
    description:
      "Public endpoint to fetch a configurator by public id (embedable).",
    // Public fetch by publicId in the path; usually no header required but check embed security rules
    requiredHeaders: [],
  },

  // Quotes
  "/api/quote/create": {
    methods: ["POST"],
    description: "Create a quote from a configurator or cart.",
    requiredHeaders: ["Authorization"],
  },
  "/api/quote/list": {
    methods: ["GET"],
    description: "List quotes for the current client.",
    requiredHeaders: ["Authorization"],
  },
  "/api/quote/update": {
    methods: ["PUT", "PATCH"],
    description: "Update quote status or metadata.",
    requiredHeaders: ["Authorization"],
  },
  "/api/quote/[quoteCode]": {
    methods: ["GET"],
    description: "Fetch a single quote by its public code.",
    // Often public, but if quotes are private change to require Authorization
    requiredHeaders: [],
  },

  // Options (configurator options)
  "/api/option/create": {
    methods: ["POST"],
    description:
      "Create a new option for a configurator (e.g. color, accessory).",
    requiredHeaders: ["Authorization"],
  },
  "/api/option/list": {
    methods: ["GET"],
    description: "List options for a configurator or client.",
    requiredHeaders: ["Authorization"],
  },
  "/api/option/update": {
    methods: ["PUT", "PATCH"],
    description: "Update an option's details or pricing.",
    requiredHeaders: ["Authorization"],
  },

  // Categories
  "/api/category/list": {
    methods: ["GET"],
    description: "List product/configurator categories.",
    requiredHeaders: [],
  },
  "/api/category/create": {
    methods: ["POST"],
    description: "Create a new category.",
    requiredHeaders: ["Authorization"],
  },
  "/api/category/update": {
    methods: ["PUT", "PATCH"],
    description: "Update a category.",
    requiredHeaders: ["Authorization"],
  },

  // Themes
  "/api/theme/list": {
    methods: ["GET"],
    description: "List available themes for embeds or configurators.",
    requiredHeaders: [],
  },
  "/api/theme/create": {
    methods: ["POST"],
    description: "Create a new theme (colors, fonts).",
    requiredHeaders: ["Authorization"],
  },
  "/api/theme/update": {
    methods: ["PUT", "PATCH"],
    description: "Update a theme.",
    requiredHeaders: ["Authorization"],
  },

  // Files
  "/api/files/upload": {
    methods: ["POST"],
    description:
      "Upload assets (images, attachments) to S3 or project storage.",
    requiredHeaders: ["Authorization"],
  },
  "/api/files/list": {
    methods: ["GET"],
    description: "List uploaded files for the client/project.",
    requiredHeaders: ["Authorization"],
  },
  "/api/files/delete": {
    methods: ["DELETE"],
    description: "Delete files or assets.",
    requiredHeaders: ["Authorization"],
  },

  // Email / templates
  "/api/email/send": {
    methods: ["POST"],
    description: "Send transactional emails (quotes, confirmations).",
    requiredHeaders: ["Authorization"],
  },
  "/api/email/templates": {
    methods: ["GET", "POST"],
    description: "Manage email templates and previews.",
    requiredHeaders: ["Authorization"],
  },
  "/api/email/preview": {
    methods: ["POST"],
    description: "Render an email preview (HTML) for templates.",
    requiredHeaders: ["Authorization"],
  },

  // Billing / Stripe
  "/api/billing": {
    methods: ["GET"],
    description:
      "General billing info endpoint (may return account/subscription summary).",
    requiredHeaders: ["Authorization"],
  },
  "/api/billing/create-session": {
    methods: ["POST"],
    description: "Create a Stripe Checkout session for subscription purchase.",
    requiredHeaders: ["Authorization"],
  },
  "/api/billing/verify-session": {
    methods: ["GET"],
    description:
      "Server-side verification helper to fetch Stripe checkout session and update subscription state.",
    requiredHeaders: ["Authorization"],
  },
  "/api/billing/portal": {
    methods: ["POST"],
    description:
      "Create a Stripe customer portal session for billing management.",
    requiredHeaders: ["Authorization"],
  },
  "/api/billing/transactions": {
    methods: ["GET"],
    description: "List billing transactions/invoices for the client.",
    requiredHeaders: ["Authorization"],
  },
  "/api/billing/webhook": {
    methods: ["POST"],
    description:
      "Stripe webhook receiver for subscription, invoice and checkout events.",
    // Stripe sends a signature header that should be verified by the webhook handler
    requiredHeaders: ["Stripe-Signature"],
  },
  "/api/billing/cancel-subscription": {
    methods: ["POST"],
    description: "Cancel an active subscription for the client.",
    requiredHeaders: ["Authorization"],
  },

  // Admin
  "/api/admin/clients": {
    methods: ["GET", "POST"],
    description: "Admin endpoint to list/manage clients.",
    // Admin endpoints require Authorization and likely an admin role check
    requiredHeaders: ["Authorization"],
  },
  "/api/admin/stats": {
    methods: ["GET"],
    description: "Admin analytics and statistics endpoint.",
    requiredHeaders: ["Authorization"],
  },

  // Analytics
  "/api/analytics/usage": {
    methods: ["GET"],
    description: "Usage metrics (configurator/quote usage) for dashboards.",
    requiredHeaders: ["Authorization"],
  },
  "/api/analytics/performance": {
    methods: ["GET"],
    description: "Performance metrics for analytics dashboards.",
    requiredHeaders: ["Authorization"],
  },
  "/api/embed/analytics": {
    methods: ["POST"],
    description: "Embed analytics collector for front-end embeds (events).",
    // Embeds often send a lightweight public key or embed key header; adjust to your implementation
    requiredHeaders: ["x-embed-key"],
  },

  // Embed endpoints
  "/api/embed/configurator/[publicKey]": {
    methods: ["GET"],
    description:
      "Public embed endpoint for configurators identified by a public key.",
    // Public by URL param; typically no additional headers required unless your embed requires a header
    requiredHeaders: [],
  },

  // Misc
  "/api/health": {
    methods: ["GET"],
    description:
      "Healthcheck endpoint used by uptime monitors and deployment checks.",
    requiredHeaders: [],
  },
};

export default ENDPOINTS;
