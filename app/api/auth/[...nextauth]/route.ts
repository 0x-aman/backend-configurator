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
      // keep signIn simple and allow the flow to continue.
      // Database linking/creation is handled in the `events.signIn` handler
      // (which runs after the adapter has created/linked the user record).
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
  // Use NextAuth events to perform post-creation/post-signin linking
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

          if (existingUser) {
            // If user exists but has no client, link or create one
            if (!existingUser.clientId) {
              if (existingClient) {
                // Link to existing client
                await prisma.client.update({
                  where: { id: existingClient.id },
                  data: {
                    googleId: account.providerAccountId,
                    emailVerified: true,
                    lastLoginAt: new Date(),
                  },
                });

                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { clientId: existingClient.id },
                });
              } else {
                // Create a new client and link
                const client = await prisma.client.create({
                  data: {
                    email: user.email,
                    name: user.name || "User",
                    googleId: account.providerAccountId,
                    emailVerified: true,
                    lastLoginAt: new Date(),
                  },
                });

                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { clientId: client.id },
                });
              }
            } else {
              // User already linked to a client — update client's googleId
              await prisma.client.update({
                where: { id: existingUser.clientId },
                data: {
                  googleId: account.providerAccountId,
                  emailVerified: true,
                  lastLoginAt: new Date(),
                },
              });
            }
          } else if (existingClient) {
            // Rare case: client exists but user record not found. Update client googleId so when
            // the adapter later creates the user it can be linked by email.
            await prisma.client.update({
              where: { id: existingClient.id },
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
    maxAge: 7 * 24 * 60 * 60, // 7
  },
  secret: env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
