// Application constants

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    requestLimit: 1000,
    configuratorLimit: 1,
    features: ['1 Configurator', '1,000 requests/month', 'Basic themes', 'Email support'],
  },
  STARTER: {
    name: 'Starter',
    price: 29,
    requestLimit: 10000,
    configuratorLimit: 5,
    features: ['5 Configurators', '10,000 requests/month', 'Custom themes', 'Priority support', 'Analytics'],
  },
  PRO: {
    name: 'Pro',
    price: 99,
    requestLimit: 100000,
    configuratorLimit: 25,
    features: ['25 Configurators', '100,000 requests/month', 'White-label', 'API access', '24/7 support'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 299,
    requestLimit: 1000000,
    configuratorLimit: -1, // unlimited
    features: ['Unlimited Configurators', '1M+ requests/month', 'Custom integrations', 'Dedicated support', 'SLA'],
  },
};

export const CATEGORY_TYPES = [
  'GENERIC',
  'COLOR',
  'DIMENSION',
  'MATERIAL',
  'FEATURE',
  'ACCESSORY',
  'POWER',
  'TEXT',
  'FINISH',
  'CUSTOM',
];

export const ATTRIBUTE_TYPES = [
  'TEXT',
  'NUMBER',
  'COLOR',
  'SELECT',
  'BOOLEAN',
  'DIMENSION',
  'RANGE',
];

export const QUOTE_STATUSES = [
  'DRAFT',
  'PENDING',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CONVERTED',
];

export const FILE_TYPES = ['IMAGE', 'DOCUMENT', 'ASSET', 'OTHER'];

export const ANALYTICS_EVENT_TYPES = [
  'CONFIGURATOR_VIEW',
  'CONFIGURATOR_INTERACTION',
  'QUOTE_REQUEST',
  'CONVERSION',
  'EMBED_LOAD',
];

export const DEFAULT_THEME = {
  name: 'Default Theme',
  primaryColor: '220 70% 50%',
  secondaryColor: '340 70% 50%',
  accentColor: '280 70% 50%',
  backgroundColor: '0 0% 100%',
  surfaceColor: '0 0% 98%',
  textColor: '0 0% 10%',
  textColorMode: 'AUTO',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '0.5rem',
  spacingUnit: '1rem',
  maxWidth: '1200px',
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
];

export const EMAIL_TEMPLATES = {
  QUOTE_REQUEST: {
    subject: 'Your Quote Request - {{quoteCode}}',
    body: `
      <h1>Thank you for your quote request!</h1>
      <p>Hello {{customerName}},</p>
      <p>We received your configuration request for {{configuratorName}}.</p>
      <h2>Quote Details:</h2>
      <p>Quote Code: <strong>{{quoteCode}}</strong></p>
      <p>Total Price: <strong>{{totalPrice}}</strong></p>
      <p>We'll get back to you shortly!</p>
    `,
  },
  QUOTE_SENT: {
    subject: 'Your Quote is Ready - {{quoteCode}}',
    body: `
      <h1>Your Quote is Ready!</h1>
      <p>Hello {{customerName}},</p>
      <p>Your quote for {{configuratorName}} is ready for review.</p>
      <h2>Quote Summary:</h2>
      <p>Quote Code: <strong>{{quoteCode}}</strong></p>
      <p>Total Price: <strong>{{totalPrice}}</strong></p>
      <p><a href="{{quoteLink}}">View Full Quote</a></p>
    `,
  },
};
