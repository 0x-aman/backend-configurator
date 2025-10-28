# Migration Notes - Azure Blob Storage & Stripe Integration

## Changes Implemented

### 1. **AWS S3 → Azure Blob Storage Migration** ✅

#### Removed:

- `@aws-sdk/client-s3` package
- `@aws-sdk/s3-request-presigner` package
- `/app/lib/s3.ts` file
- All AWS environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET)

#### Added:

- `@azure/storage-blob` package (v12.29.1)
- `/app/lib/azure-blob.ts` - Azure Blob Storage client
- New environment variables:
  - `AZURE_STORAGE_CONNECTION_STRING`
  - `AZURE_CONTAINER_NAME` (default: "uploads")

#### Updated Files:

- `/app/src/services/file.service.ts` - Complete rewrite to use Azure Blob Storage
  - Upload functionality
  - Delete functionality
  - List functionality
  - Signed URL generation (using SAS tokens)
- `/app/src/config/env.ts` - Environment variable configuration
- `/app/app/api/files/upload/route.ts` - Updated comments
- `/app/app/api/health/route.ts` - Health check now checks Azure instead of AWS

### 2. **Configurator Creation on Login** ✅

#### Changes:

- Updated `/app/app/dashboard/page.tsx`:
  - Added automatic detection of zero configurators
  - Shows prominent banner when no configurators exist
  - Displays modal for creating first configurator
  - Modal appears 500ms after dashboard load if no configurators
  - Integrated with existing `/api/configurator/create` endpoint

#### Features:

- User-friendly "Get Started" banner with sparkle icon
- Modal dialog with form for configurator name and description
- Proper error handling and toast notifications
- Auto-refresh after successful creation

### 3. **Stripe Payment Integration** ✅

#### Updated:

- `/app/src/services/billing.service.ts`:
  - Changed from plan-based to duration-based (MONTHLY/YEARLY)
  - Added dynamic price creation if price IDs not in environment
  - Updated webhook handlers to use subscription duration instead of plan
  - Helper function to create/retrieve Stripe prices

- `/app/app/api/billing/create-session/route.ts`:
  - Now accepts `duration` parameter (MONTHLY or YEARLY)
  - Validates duration properly
  - Uses success/cancel URLs from request body with fallback

- `/app/app/dashboard/billing/page.tsx`:
  - Already correctly implemented for MONTHLY/YEARLY
  - Fully functional with provided test keys

- `/app/src/config/env.ts`:
  - Added STRIPE_MONTHLY_PRICE_ID
  - Added STRIPE_YEARLY_PRICE_ID

### 4. **Prisma Schema Updates**

The schema already has proper `subscriptionDuration` field:

```prisma
subscriptionDuration SubscriptionDuration? // MONTHLY or YEARLY
```

---

## Environment Variables Setup

Create or update your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/configurator"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Stripe (Test Keys - Already Configured)
STRIPE_WEBHOOK_SECRET="" # Optional - for webhook events
STRIPE_MONTHLY_PRICE_ID="" # Optional - will be created dynamically if not set
STRIPE_YEARLY_PRICE_ID=""  # Optional - will be created dynamically if not set

# Azure Blob Storage (REQUIRED)
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
AZURE_CONTAINER_NAME="uploads"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Resend Email (Optional)
RESEND_API_KEY=""
FROM_EMAIL="noreply@example.com"

# App Configuration
APP_NAME="SaaS Configurator"
APP_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
```

---

## Setup Instructions

### 1. Azure Blob Storage Setup

1. Create an Azure Storage Account:
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Storage Account
   - Copy the connection string from Access Keys

2. Create a container:
   - Name it `uploads` (or customize via AZURE_CONTAINER_NAME)
   - Set access level to "Blob (anonymous read access for blobs only)"

3. Add connection string to `.env`:
   ```env
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
   ```

### 2. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Seed database
npm run db:seed
```

### 3. Stripe Setup (Already Configured)

The test keys are already in the `.env` file. To use in production:

1. Create products in Stripe Dashboard:
   - Monthly: €99/month
   - Yearly: €999/year

2. Copy price IDs to environment:

   ```env
   STRIPE_MONTHLY_PRICE_ID="price_xxxxx"
   STRIPE_YEARLY_PRICE_ID="price_xxxxx"
   ```

3. Configure webhook endpoint:
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## Testing Checklist

### File Upload (Azure Blob Storage)

- [ ] Upload image file
- [ ] Upload document file
- [ ] View uploaded files in dashboard
- [ ] Delete uploaded file
- [ ] Verify file appears in Azure Storage Account

### Configurator Creation

- [ ] Login as new user
- [ ] Verify banner appears on empty dashboard
- [ ] Click "Create Configurator" button
- [ ] Fill in name and description
- [ ] Verify configurator is created
- [ ] Verify banner disappears after creation

### Stripe Payment

- [ ] Visit `/pricing` page
- [ ] Click "Get Started" and register
- [ ] Go to `/dashboard/billing`
- [ ] Click "Get Started" on Monthly or Yearly plan
- [ ] Complete test payment (use test card: 4242 4242 4242 4242)
- [ ] Verify subscription status updates
- [ ] Test "Manage Billing" portal access

---

## API Endpoints Updated

### File Management

- `POST /api/files/upload` - Upload file to Azure Blob Storage
- `GET /api/files/upload?filename=x&contentType=y` - Get signed upload URL
- `GET /api/files/list` - List files
- `DELETE /api/files/delete` - Delete file

### Configurator

- `POST /api/configurator/create` - Create configurator
- `GET /api/configurator/list` - List configurators

### Billing

- `POST /api/billing/create-session` - Create Stripe checkout (accepts `duration`: MONTHLY/YEARLY)
- `POST /api/billing/portal` - Access customer portal
- `POST /api/billing/webhook` - Stripe webhook handler

### Health Check

- `GET /api/health` - Check all services (Database, Stripe, Resend, Azure Storage)

---

## Migration Benefits

1. **Cost**: Azure Blob Storage typically more cost-effective than S3
2. **Performance**: Similar performance with better integration options
3. **Flexibility**: Easier SAS token management
4. **Consistency**: All Microsoft services if using Azure ecosystem

---

## Troubleshooting

### Azure Blob Storage Issues

- **Error: "Connection string invalid"**
  - Verify the connection string format
  - Ensure no extra spaces or quotes

- **Error: "Container not found"**
  - Container is auto-created on first upload
  - Check AZURE_CONTAINER_NAME matches

### Stripe Issues

- **Error: "Invalid API key"**
  - Keys are already configured for test mode
  - For production, replace with live keys

- **Webhook not receiving events**
  - Configure webhook endpoint in Stripe Dashboard
  - Add STRIPE_WEBHOOK_SECRET to environment

### Configurator Creation

- **Modal doesn't appear**
  - Check if configurators already exist
  - Check browser console for errors
  - Verify `/api/configurator/list` returns data

---

## Future Enhancements

1. Add file upload progress indicators
2. Implement file type restrictions
3. Add file size limits
4. Create admin panel for managing uploads
5. Add CDN integration for faster file delivery
6. Implement automatic backup to secondary storage

---

## Support

For issues or questions:

- Check the logs: `console` in browser, server logs in terminal
- Review Prisma migrations: `npx prisma studio`
- Test API endpoints: Use the health check endpoint
- Contact: [Your Support Email]

---

**Migration completed successfully!** All AWS S3 references removed and replaced with Azure Blob Storage. Stripe integration updated and configurator creation flow implemented.
