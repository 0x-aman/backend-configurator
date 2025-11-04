// NextAuth.js configuration with Google OAuth
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { CustomPrismaAdapter } from "@/src/lib/custom-prisma-adapter";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword } from "@/src/lib/auth";
import { ClientService } from "@/src/services/client.service";
import { env } from "@/src/config/env";

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const client = await ClientService.getByEmail(credentials.email);
        if (!client || !client.passwordHash) {
          throw new Error("Invalid credentials");
        }

        // ✅ Check if account is locked
        if (client.lockedUntil && client.lockedUntil > new Date()) {
          throw new Error("Account is locked due to too many failed attempts");
        }

        const isValid = await verifyPassword(
          credentials.password,
          client.passwordHash
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Update last login
        await ClientService.update(client.id, {
          lastLoginAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        });

        return {
          id: client.id,
          email: client.email,
          name: client.name,
        };
      },
    }),
  ],
  callbacks: {
    // ✅ Fixed: Simplified signIn callback
    async signIn({ user, account, profile }) {
      // For Google OAuth, perform account linking check here
      if (account?.provider === "google" && user?.email) {
        const existingClient = await prisma.client.findUnique({
          where: { email: user.email },
        });

        // If client exists with different Google ID, prevent sign in
        if (
          existingClient &&
          existingClient.googleId &&
          existingClient.googleId !== account.providerAccountId
        ) {
          console.error(
            "Attempted sign in with different Google account for same email"
          );
          return false; // Prevent sign in
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        // Fetch user and their client data
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          include: {
            client: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                subscriptionStatus: true,
                subscriptionDuration: true,
                emailVerified: true,
              },
            },
          },
        });

        if (user?.client) {
          session.user = {
            ...session.user,
            id: user.client.id,
            email: user.client.email,
            name: user.client.name,
            avatarUrl: user.client.avatarUrl,
            subscriptionStatus: user.client.subscriptionStatus,
            subscriptionDuration: user.client.subscriptionDuration,
            emailVerified: user.client.emailVerified,
          } as any;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // On sign in, user object contains id
      if (user) {
        token.sub = user.id;
      }

      // For Google OAuth, ensure we have the user ID
      if (account?.provider === "google" && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (existingUser) {
          token.sub = existingUser.id;
        }
      }

      return token;
    },
  },
  // ✅ Improved: Use events for post-signin actions
  events: {
    async signIn({ user, account, profile, isNewUser }: any) {
      try {
        if (account?.provider === "google" && user?.email) {
          // Find any existing client (from email/password signup flow)
          const existingClient = await prisma.client.findUnique({
            where: { email: user.email },
          });

          // Find the user record created/managed by the adapter
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { client: true },
          });

          if (existingUser && !existingUser.clientId && existingClient) {
            // Link existing email/password client to OAuth user
            await prisma.$transaction([
              prisma.client.update({
                where: { id: existingClient.id },
                data: {
                  googleId: account.providerAccountId,
                  emailVerified: true,
                  lastLoginAt: new Date(),
                },
              }),
              prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  clientId: existingClient.id,
                  emailVerified: new Date(),
                },
              }),
            ]);
          } else if (existingUser?.clientId) {
            // Update existing linked client
            await prisma.client.update({
              where: { id: existingUser.clientId },
              data: {
                googleId: account.providerAccountId,
                emailVerified: true,
                lastLoginAt: new Date(),
              },
            });
          }
        }
      } catch (err) {
        console.error("NextAuth events.signIn error:", err);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // ✅ Fixed: 7 days (matching JWT expiry)
  },
  secret: env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
