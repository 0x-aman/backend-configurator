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
    // ✅ Improved: signIn callback with better error handling
    async signIn({ user, account, profile }) {
      try {
        // For Google OAuth, perform account linking validation
        if (account?.provider === "google" && user?.email) {
          const existingClient = await prisma.client.findUnique({
            where: { email: user.email },
          });

          // ✅ Check if a different Google account is already linked
          if (
            existingClient &&
            existingClient.googleId &&
            existingClient.googleId !== account.providerAccountId
          ) {
            console.error(
              `Account linking conflict: Email ${user.email} is already linked to a different Google account`
            );
            // Redirect to error page with specific message
            return `/login?error=OAuthAccountNotLinked&email=${encodeURIComponent(user.email)}`;
          }

          // ✅ If client exists without Google ID, linking will happen in events.signIn
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
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
    // Ensure NextAuth honors callbackUrl and doesn't drop query params or redirect to a default
    async redirect({ url, baseUrl }) {
      try {
        // If the callback is a relative path (starts with '/'), allow it
        if (url && url.startsWith("/")) return `${baseUrl}${url}`;

        // If callback is same origin, allow it as-is
        if (url && url.startsWith(baseUrl)) return url;

        // Fallback: send user to dashboard
        return `${baseUrl}/dashboard`;
      } catch (err) {
        console.error("redirect callback error:", err);
        return `${baseUrl}/dashboard`;
      }
    },
  },
  // ✅ Improved: Use events for post-signin actions and account linking
  events: {
    async signIn({ user, account, profile, isNewUser }: any) {
      try {
        if (account?.provider === "google" && user?.email) {
          // Find the user record created/managed by the adapter
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { client: true },
          });

          if (existingUser?.clientId) {
            // ✅ Update client with Google ID and last login
            await prisma.client.update({
              where: { id: existingUser.clientId },
              data: {
                googleId: account.providerAccountId,
                emailVerified: true,
                lastLoginAt: new Date(),
              },
            });

            console.log(
              `✅ Google account linked successfully for user: ${user.email}`
            );
          }
        }

        // Update last login for all sign-ins
        if (user?.email) {
          const userRecord = await prisma.user.findUnique({
            where: { email: user.email },
            select: { clientId: true },
          });

          if (userRecord?.clientId) {
            await prisma.client.update({
              where: { id: userRecord.clientId },
              data: { lastLoginAt: new Date() },
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
    error: "/login", // Errors will be passed as URL params
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // ✅ Fixed: 7 days (matching JWT expiry)
  },
  secret: env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
