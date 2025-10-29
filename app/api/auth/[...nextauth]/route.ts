// NextAuth.js configuration with Google OAuth
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword } from "@/src/lib/auth";
import { ClientService } from "@/src/services/client.service";
import { env } from "@/src/config/env";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        // Find or create client with Google ID
        let client = await prisma.client.findUnique({
          where: { email: user.email! }
        });

        if (client) {
          // Link Google account to existing client if not already linked
          if (!client.googleId) {
            client = await prisma.client.update({
              where: { id: client.id },
              data: { 
                googleId: account.providerAccountId,
                emailVerified: true,
                lastLoginAt: new Date(),
              }
            });
          } else {
            // Just update last login
            await prisma.client.update({
              where: { id: client.id },
              data: { lastLoginAt: new Date() }
            });
          }
        } else {
          // Create new client for first-time Google OAuth user
          client = await ClientService.create({
            email: user.email!,
            name: user.name || "User",
            googleId: account.providerAccountId,
          });
        }
        
        // CRITICAL: Set user.id so it gets passed to JWT callback
        user.id = client.id;
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        // Fetch fresh client data to include in session
        const client = await prisma.client.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            subscriptionStatus: true,
            subscriptionDuration: true,
          }
        });

        if (client) {
          session.user = {
            ...session.user,
            id: client.id,
            email: client.email,
            name: client.name,
            avatarUrl: client.avatarUrl,
            subscriptionStatus: client.subscriptionStatus,
            subscriptionDuration: client.subscriptionDuration,
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
      
      // For Google OAuth, ensure we have the client ID
      if (account?.provider === "google" && user?.email) {
        const client = await prisma.client.findUnique({
          where: { email: user.email },
          select: { id: true }
        });
        if (client) {
          token.sub = client.id;
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
