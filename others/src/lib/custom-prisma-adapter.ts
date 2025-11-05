// Custom Prisma Adapter for Next-Auth that syncs User with Client
import { PrismaClient } from "@prisma/client";
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      // ✅ Check if a Client already exists with this email (from email/password registration)
      const existingClient = await prisma.client.findUnique({
        where: { email: data.email! },
      });

      let client;

      if (existingClient) {
        // ✅ Client exists (email/password user) - just update it
        client = await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            emailVerified: true,
            avatarUrl: data.image || existingClient.avatarUrl,
            name: data.name || existingClient.name,
          },
        });
      } else {
        // Create new Client for OAuth-only user
        client = await prisma.client.create({
          data: {
            email: data.email!,
            name: data.name || "User",
            emailVerified: true,
            avatarUrl: data.image,
          },
        });
      }

      // Check if User record exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email! },
      });

      let user;
      if (existingUser) {
        // Update existing User and link to Client
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: data.emailVerified,
            image: data.image,
            clientId: client.id,
          },
        });
      } else {
        // Create new User record
        user = await prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            emailVerified: data.emailVerified,
            image: data.image,
            clientId: client.id,
          },
        });
      }

      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { client: true },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { client: true },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });

      if (!account) return null;

      return {
        id: account.user.id,
        email: account.user.email!,
        emailVerified: account.user.emailVerified,
        name: account.user.name,
        image: account.user.image,
      };
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          name: data.name,
          emailVerified: data.emailVerified,
          image: data.image,
        },
        include: { client: true },
      });

      // Sync with Client model
      if (user.clientId) {
        await prisma.client.update({
          where: { id: user.clientId },
          data: {
            email: data.email || user.email!,
            name: data.name || user.name!,
            avatarUrl: data.image || user.image,
            emailVerified:
              data.emailVerified !== undefined
                ? !!data.emailVerified
                : undefined,
          },
        });
      }

      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },

    async deleteUser(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.clientId) {
        // Delete Client (will cascade to User via onDelete: Cascade)
        await prisma.client.delete({
          where: { id: user.clientId },
        });
      } else {
        // Delete User only if no Client exists
        await prisma.user.delete({
          where: { id: userId },
        });
      }
    },

    async linkAccount(account: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
      // ✅ Update Client with googleId when linking Google account
      if (account.provider === "google") {
        const user = await prisma.user.findUnique({
          where: { id: account.userId },
          select: { clientId: true },
        });

        if (user?.clientId) {
          await prisma.client.update({
            where: { id: user.clientId },
            data: {
              googleId: account.providerAccountId,
              emailVerified: true,
            },
          });
        }
      }
    },

    async unlinkAccount({
      providerAccountId,
      provider,
    }: Pick<AdapterAccount, "providerAccountId" | "provider">) {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },

    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }) {
      return await prisma.session.create({
        data: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      });
    },

    async getSessionAndUser(sessionToken: string) {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!userAndSession) return null;

      const { user, ...session } = userAndSession;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: user.name,
          image: user.image,
        },
      };
    },

    async updateSession(
      data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ) {
      return await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data: {
          expires: data.expires,
          userId: data.userId,
        },
      });
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({
        where: { sessionToken },
      });
    },

    async createVerificationToken(token: VerificationToken) {
      return await prisma.verificationToken.create({
        data: {
          identifier: token.identifier,
          token: token.token,
          expires: token.expires,
        },
      });
    },

    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string;
      token: string;
    }) {
      try {
        return await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });
      } catch (error) {
        return null;
      }
    },
  };
}
