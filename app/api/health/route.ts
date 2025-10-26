// Health check endpoint for all integrations
import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { stripe } from '@/src/lib/stripe';
import { resend } from '@/src/lib/email';
import { s3Client } from '@/src/lib/s3';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { success } from '@/src/lib/response';
import { env } from '@/src/config/env';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'error' | 'not_configured';
  message?: string;
  responseTime?: number;
}

async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      service: 'PostgreSQL',
      status: 'healthy',
      message: 'Database connection successful',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      service: 'PostgreSQL',
      status: 'error',
      message: error.message || 'Database connection failed',
      responseTime: Date.now() - start,
    };
  }
}

async function checkStripe(): Promise<HealthStatus> {
  const start = Date.now();
  
  // Check if Stripe is configured
  if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
    return {
      service: 'Stripe',
      status: 'not_configured',
      message: 'Stripe API key not configured',
    };
  }

  try {
    // Try to retrieve account information
    await stripe.accounts.retrieve();
    return {
      service: 'Stripe',
      status: 'healthy',
      message: 'Stripe API connection successful',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      service: 'Stripe',
      status: 'error',
      message: error.message || 'Stripe API connection failed',
      responseTime: Date.now() - start,
    };
  }
}

async function checkResend(): Promise<HealthStatus> {
  const start = Date.now();
  
  // Check if Resend is configured
  if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 're_your_resend_api_key') {
    return {
      service: 'Resend',
      status: 'not_configured',
      message: 'Resend API key not configured',
    };
  }

  try {
    // Try to list domains (lightweight API call)
    await resend.domains.list();
    return {
      service: 'Resend',
      status: 'healthy',
      message: 'Resend API connection successful',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      service: 'Resend',
      status: 'error',
      message: error.message || 'Resend API connection failed',
      responseTime: Date.now() - start,
    };
  }
}

async function checkAWS(): Promise<HealthStatus> {
  const start = Date.now();
  
  // Check if AWS is configured
  if (!env.AWS_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID === 'your_aws_access_key_id') {
    return {
      service: 'AWS S3',
      status: 'not_configured',
      message: 'AWS credentials not configured',
    };
  }

  try {
    // Try to list buckets (lightweight API call)
    await s3Client.send(new ListBucketsCommand({}));
    return {
      service: 'AWS S3',
      status: 'healthy',
      message: 'AWS S3 connection successful',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      service: 'AWS S3',
      status: 'error',
      message: error.message || 'AWS S3 connection failed',
      responseTime: Date.now() - start,
    };
  }
}

export async function GET(request: NextRequest) {
  const checks = await Promise.all([
    checkDatabase(),
    checkStripe(),
    checkResend(),
    checkAWS(),
  ]);

  const overallHealthy = checks.every(check => check.status === 'healthy' || check.status === 'not_configured');

  return success({
    status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
}
