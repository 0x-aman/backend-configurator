import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      email: string;
      image?: string | null;
      id: string;
      avatarUrl?: string | null;
      subscriptionStatus?:
        | "ACTIVE"
        | "INACTIVE"
        | "CANCELED"
        | "PAST_DUE"
        | "SUSPENDED";
      subscriptionDuration?: "MONTHLY" | "YEARLY" | null;
      emailVerified?: boolean;
    };
  }
}
