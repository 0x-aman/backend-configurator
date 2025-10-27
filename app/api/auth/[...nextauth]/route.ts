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
        // Handle Google OAuth sign in
        const existingClient = await ClientService.getByGoogleId(
          account.providerAccountId
        );

        if (!existingClient) {
          // Create new client for Google OAuth user
          await ClientService.create({
            email: user.email!,
            name: user.name || "User",
            googleId: account.providerAccountId,
          });
        } else {
          // Update last login
          await ClientService.update(existingClient.id, {
            lastLoginAt: new Date(),
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Ensure session.user.id is present and typed
      session.user = {
        ...session.user,
        id: token?.sub ?? null,
      } as typeof session.user & { id: string | null };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
