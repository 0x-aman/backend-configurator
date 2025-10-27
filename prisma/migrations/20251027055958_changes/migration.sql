-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SubscriptionDuration" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('GENERIC', 'COLOR', 'DIMENSION', 'MATERIAL', 'FEATURE', 'ACCESSORY', 'POWER', 'TEXT', 'FINISH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'COLOR', 'SELECT', 'BOOLEAN', 'DIMENSION', 'RANGE');

-- CreateEnum
CREATE TYPE "TextColorMode" AS ENUM ('AUTO', 'WHITE', 'BLACK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'DOCUMENT', 'ASSET', 'OTHER');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('CONFIGURATOR_VIEW', 'CONFIGURATOR_INTERACTION', 'QUOTE_REQUEST', 'CONVERSION', 'EMBED_LOAD');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "googleId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifySentAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "subscriptionDuration" "SubscriptionDuration",
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionEndsAt" TIMESTAMP(3),
    "billingEmail" TEXT,
    "monthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 99.00,
    "yearlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 999.00,
    "apiKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "domain" TEXT,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedSettings" JSONB,
    "monthlyRequests" INTEGER NOT NULL DEFAULT 0,
    "requestLimit" INTEGER NOT NULL DEFAULT 1000,
    "lastResetAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurators" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Product Configurator',
    "description" TEXT,
    "slug" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "themeId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currencySymbol" TEXT NOT NULL DEFAULT '$',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "allowQuotes" BOOLEAN NOT NULL DEFAULT true,
    "requireEmail" BOOLEAN NOT NULL DEFAULT true,
    "autoPricing" BOOLEAN NOT NULL DEFAULT false,
    "showTotal" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "configurators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "configuratorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryType" "CategoryType" NOT NULL DEFAULT 'GENERIC',
    "description" TEXT,
    "helpText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "imageUrl" TEXT,
    "defaultOptionId" TEXT,
    "attributesTemplate" JSONB NOT NULL DEFAULT '[]',
    "validationRules" JSONB,
    "minSelections" INTEGER NOT NULL DEFAULT 1,
    "maxSelections" INTEGER NOT NULL DEFAULT 1,
    "pricingFormula" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "cost" DECIMAL(10,2),
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockQuantity" INTEGER,
    "lowStockThreshold" INTEGER DEFAULT 10,
    "attributeValues" JSONB NOT NULL DEFAULT '{}',
    "color" TEXT,
    "hexColor" TEXT,
    "dimensions" JSONB,
    "weight" DECIMAL(10,2),
    "voltage" TEXT,
    "wattage" TEXT,
    "materialType" TEXT,
    "finishType" TEXT,
    "textValue" TEXT,
    "maxCharacters" INTEGER,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_incompatibilities" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "incompatibleOptionId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_incompatibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_dependencies" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "dependsOnOptionId" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL DEFAULT 'requires',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT NOT NULL DEFAULT '220 70% 50%',
    "secondaryColor" TEXT NOT NULL DEFAULT '340 70% 50%',
    "accentColor" TEXT NOT NULL DEFAULT '280 70% 50%',
    "backgroundColor" TEXT NOT NULL DEFAULT '0 0% 100%',
    "surfaceColor" TEXT NOT NULL DEFAULT '0 0% 98%',
    "textColor" TEXT NOT NULL DEFAULT '0 0% 10%',
    "textColorMode" "TextColorMode" NOT NULL DEFAULT 'AUTO',
    "customTextColor" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "headingFont" TEXT,
    "bodyFont" TEXT,
    "borderRadius" TEXT NOT NULL DEFAULT '0.5rem',
    "spacingUnit" TEXT NOT NULL DEFAULT '1rem',
    "maxWidth" TEXT NOT NULL DEFAULT '1200px',
    "customCSS" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "previewText" TEXT,
    "inheritThemeColors" BOOLEAN NOT NULL DEFAULT true,
    "templateType" TEXT NOT NULL DEFAULT 'quote',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "configuratorId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerCompany" TEXT,
    "customerAddress" JSONB,
    "title" TEXT,
    "selectedOptions" JSONB NOT NULL,
    "configuration" JSONB,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2),
    "taxRate" DECIMAL(5,4),
    "taxAmount" DECIMAL(10,2),
    "quoteCode" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "internalNotes" TEXT,
    "customerNotes" TEXT,
    "adminNotes" TEXT,
    "validUntil" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "lastReminderSentAt" TIMESTAMP(3),
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "lastOpenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "configuratorId" TEXT,
    "eventType" "AnalyticsEventType" NOT NULL,
    "eventName" TEXT NOT NULL,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "path" TEXT,
    "referrer" TEXT,
    "domain" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_logs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "responseTime" INTEGER NOT NULL,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "apiKeyId" TEXT,
    "userId" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_googleId_key" ON "clients"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_stripeCustomerId_key" ON "clients"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_stripeSubscriptionId_key" ON "clients"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_apiKey_key" ON "clients"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "clients_publicKey_key" ON "clients"("publicKey");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_apiKey_idx" ON "clients"("apiKey");

-- CreateIndex
CREATE INDEX "clients_publicKey_idx" ON "clients"("publicKey");

-- CreateIndex
CREATE INDEX "clients_subscriptionStatus_idx" ON "clients"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "clients_createdAt_idx" ON "clients"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "configurators_publicId_key" ON "configurators"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "configurators_slug_key" ON "configurators"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "configurators_accessToken_key" ON "configurators"("accessToken");

-- CreateIndex
CREATE INDEX "configurators_clientId_idx" ON "configurators"("clientId");

-- CreateIndex
CREATE INDEX "configurators_publicId_idx" ON "configurators"("publicId");

-- CreateIndex
CREATE INDEX "configurators_isActive_isPublished_idx" ON "configurators"("isActive", "isPublished");

-- CreateIndex
CREATE INDEX "configurators_slug_idx" ON "configurators"("slug");

-- CreateIndex
CREATE INDEX "configurators_createdAt_idx" ON "configurators"("createdAt");

-- CreateIndex
CREATE INDEX "categories_configuratorId_idx" ON "categories"("configuratorId");

-- CreateIndex
CREATE INDEX "categories_configuratorId_orderIndex_idx" ON "categories"("configuratorId", "orderIndex");

-- CreateIndex
CREATE INDEX "categories_categoryType_idx" ON "categories"("categoryType");

-- CreateIndex
CREATE INDEX "options_categoryId_idx" ON "options"("categoryId");

-- CreateIndex
CREATE INDEX "options_categoryId_orderIndex_idx" ON "options"("categoryId", "orderIndex");

-- CreateIndex
CREATE INDEX "options_isActive_idx" ON "options"("isActive");

-- CreateIndex
CREATE INDEX "options_price_idx" ON "options"("price");

-- CreateIndex
CREATE INDEX "options_sku_idx" ON "options"("sku");

-- CreateIndex
CREATE INDEX "option_incompatibilities_optionId_idx" ON "option_incompatibilities"("optionId");

-- CreateIndex
CREATE INDEX "option_incompatibilities_incompatibleOptionId_idx" ON "option_incompatibilities"("incompatibleOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "option_incompatibilities_optionId_incompatibleOptionId_key" ON "option_incompatibilities"("optionId", "incompatibleOptionId");

-- CreateIndex
CREATE INDEX "option_dependencies_optionId_idx" ON "option_dependencies"("optionId");

-- CreateIndex
CREATE INDEX "option_dependencies_dependsOnOptionId_idx" ON "option_dependencies"("dependsOnOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "option_dependencies_optionId_dependsOnOptionId_key" ON "option_dependencies"("optionId", "dependsOnOptionId");

-- CreateIndex
CREATE INDEX "themes_clientId_idx" ON "themes"("clientId");

-- CreateIndex
CREATE INDEX "themes_clientId_isActive_idx" ON "themes"("clientId", "isActive");

-- CreateIndex
CREATE INDEX "themes_isDefault_idx" ON "themes"("isDefault");

-- CreateIndex
CREATE INDEX "email_templates_clientId_idx" ON "email_templates"("clientId");

-- CreateIndex
CREATE INDEX "email_templates_clientId_isDefault_idx" ON "email_templates"("clientId", "isDefault");

-- CreateIndex
CREATE INDEX "email_templates_templateType_idx" ON "email_templates"("templateType");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_clientId_name_key" ON "email_templates"("clientId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quoteCode_key" ON "quotes"("quoteCode");

-- CreateIndex
CREATE INDEX "quotes_clientId_idx" ON "quotes"("clientId");

-- CreateIndex
CREATE INDEX "quotes_configuratorId_idx" ON "quotes"("configuratorId");

-- CreateIndex
CREATE INDEX "quotes_customerEmail_idx" ON "quotes"("customerEmail");

-- CreateIndex
CREATE INDEX "quotes_quoteCode_idx" ON "quotes"("quoteCode");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_createdAt_idx" ON "quotes"("createdAt");

-- CreateIndex
CREATE INDEX "quotes_clientId_createdAt_idx" ON "quotes"("clientId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "files_accessToken_key" ON "files"("accessToken");

-- CreateIndex
CREATE INDEX "files_clientId_idx" ON "files"("clientId");

-- CreateIndex
CREATE INDEX "files_fileType_idx" ON "files"("fileType");

-- CreateIndex
CREATE INDEX "files_isPublic_idx" ON "files"("isPublic");

-- CreateIndex
CREATE INDEX "files_createdAt_idx" ON "files"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_clientId_idx" ON "analytics_events"("clientId");

-- CreateIndex
CREATE INDEX "analytics_events_configuratorId_idx" ON "analytics_events"("configuratorId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "api_logs_clientId_idx" ON "api_logs"("clientId");

-- CreateIndex
CREATE INDEX "api_logs_method_idx" ON "api_logs"("method");

-- CreateIndex
CREATE INDEX "api_logs_statusCode_idx" ON "api_logs"("statusCode");

-- CreateIndex
CREATE INDEX "api_logs_createdAt_idx" ON "api_logs"("createdAt");

-- CreateIndex
CREATE INDEX "api_logs_apiKeyId_idx" ON "api_logs"("apiKeyId");

-- AddForeignKey
ALTER TABLE "configurators" ADD CONSTRAINT "configurators_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurators" ADD CONSTRAINT "configurators_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_configuratorId_fkey" FOREIGN KEY ("configuratorId") REFERENCES "configurators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_incompatibilities" ADD CONSTRAINT "option_incompatibilities_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_incompatibilities" ADD CONSTRAINT "option_incompatibilities_incompatibleOptionId_fkey" FOREIGN KEY ("incompatibleOptionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_dependencies" ADD CONSTRAINT "option_dependencies_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_dependencies" ADD CONSTRAINT "option_dependencies_dependsOnOptionId_fkey" FOREIGN KEY ("dependsOnOptionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_configuratorId_fkey" FOREIGN KEY ("configuratorId") REFERENCES "configurators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_configuratorId_fkey" FOREIGN KEY ("configuratorId") REFERENCES "configurators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
