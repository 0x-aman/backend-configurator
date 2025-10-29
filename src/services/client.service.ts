// Client service
import { prisma } from "@/src/lib/prisma";
import { hashPassword } from "@/src/lib/auth";
import { generateApiKey, generatePublicKey } from "@/src/lib/api-keys";
import { NotFoundError, ConflictError } from "@/src/lib/errors";
import type { Client, SubscriptionStatus, SubscriptionDuration } from "@prisma/client";

export const ClientService = {
  async create(data: {
    email: string;
    password?: string;
    name: string;
    companyName?: string;
    googleId?: string;
  }): Promise<Client> {
    const existing = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = data.password
      ? await hashPassword(data.password)
      : undefined;

    return await prisma.client.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        companyName: data.companyName,
        googleId: data.googleId,
        apiKey: generateApiKey("sk"),
        publicKey: generatePublicKey("pk"),
        emailVerified: !!data.googleId, // Auto-verify OAuth users
      },
    });
  },

  async getById(id: string): Promise<Client> {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundError("Client");
    return client;
  },

  async getByEmail(email: string): Promise<Client | null> {
    return await prisma.client.findUnique({ where: { email } });
  },

  async getByGoogleId(googleId: string): Promise<Client | null> {
    return await prisma.client.findUnique({ where: { googleId } });
  },

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data,
    });
  },

  async updateSubscription(
    id: string,
    data: {
      subscriptionStatus: SubscriptionStatus;
      subscriptionDuration?: SubscriptionDuration | null;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      subscriptionEndsAt?: Date;
    }
  ): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data,
    });
  },

  async incrementRequests(id: string): Promise<void> {
    await prisma.client.update({
      where: { id },
      data: {
        monthlyRequests: { increment: 1 },
      },
    });
  },

  async resetMonthlyRequests(id: string): Promise<void> {
    await prisma.client.update({
      where: { id },
      data: {
        monthlyRequests: 0,
        lastResetAt: new Date(),
      },
    });
  },

  async updateAllowedDomains(id: string, domains: string[]): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data: { allowedDomains: domains },
    });
  },

  async regenerateApiKey(id: string): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data: { apiKey: generateApiKey("sk") },
    });
  },

  async regeneratePublicKey(id: string): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data: { publicKey: generatePublicKey("pk") },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.client.delete({ where: { id } });
  },

  async getSafeClient(id: string) {
    const client = await this.getById(id);
    const { resetToken, emailVerifyToken, ...safe } = client;
    // Include hasPassword indicator but not the actual hash
    return {
      ...safe,
      passwordHash: client.passwordHash ? "SET" : undefined,
    };
  },
};
