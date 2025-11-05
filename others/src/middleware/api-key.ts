// API key middleware for public embed endpoints
import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { AuthenticationError, AuthorizationError } from '@/src/lib/errors';
import type { Client } from '@prisma/client';

export async function validatePublicKey(request: NextRequest): Promise<Client> {
  const publicKey = request.headers.get('x-public-key');
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';

  if (!publicKey) {
    throw new AuthenticationError('Public key required');
  }

  const client = await prisma.client.findUnique({
    where: { publicKey },
  });

  if (!client) {
    throw new AuthenticationError('Invalid public key');
  }

  // Check subscription status
  if (client.subscriptionStatus === 'CANCELED' || client.subscriptionStatus === 'SUSPENDED') {
    throw new AuthorizationError('Subscription is not active');
  }

  // Validate allowed domains
  if (client.allowedDomains.length > 0 && origin) {
    const originUrl = new URL(origin).hostname;
    const isAllowed = client.allowedDomains.some(
      (domain) => domain === '*' || originUrl.includes(domain)
    );

    if (!isAllowed) {
      throw new AuthorizationError('Domain not allowed');
    }
  }

  // Check rate limits
  if (client.monthlyRequests >= client.requestLimit) {
    throw new AuthorizationError('Monthly request limit exceeded');
  }

  return client;
}

export async function validateApiKey(request: NextRequest): Promise<Client> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    throw new AuthenticationError('API key required');
  }

  const client = await prisma.client.findUnique({
    where: { apiKey },
  });

  if (!client) {
    throw new AuthenticationError('Invalid API key');
  }

  return client;
}
