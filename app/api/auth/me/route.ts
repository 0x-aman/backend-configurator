// Get current user endpoint
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ClientService } from "@/src/services/client.service";
import { success, fail, unauthorized } from "@/src/lib/response";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return unauthorized("No valid session found. Please sign in again.");
    }

    // Get user with client data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { client: true },
    });

    if (!user || !user.client) {
      return unauthorized("User or client data not found.");
    }

    const safeClient = await ClientService.getSafeClient(user.client.id);

    return success(safeClient);
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    
    if (error.statusCode === 401) {
      return unauthorized(error.message || "Authentication failed");
    }
    
    return fail(
      error.message || "Failed to fetch user data",
      "AUTH_ERROR",
      500
    );
  }
}
