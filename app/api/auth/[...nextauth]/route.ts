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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Check if user already exists (adapter creates it automatically)
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { client: true },
        });

        if (existingUser) {
          // Link to existing client or create new client if needed
          if (!existingUser.clientId) {
            // Create client for this user
            const client = await prisma.client.create({
              data: {
                email: user.email!,
                name: user.name || "User",
                googleId: account.providerAccountId,
                emailVerified: true,
                lastLoginAt: new Date(),
              },
            });

            // Link user to client
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { clientId: client.id },
            });

            user.id = existingUser.id;
          } else {
            // Update existing client
            await prisma.client.update({
              where: { id: existingUser.clientId },
              data: {
                googleId: account.providerAccountId,
                emailVerified: true,
                lastLoginAt: new Date(),
              },
            });

            user.id = existingUser.id;
          }
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
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
