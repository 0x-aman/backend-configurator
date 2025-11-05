// Admin - Get all clients
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { AdminService } from "@/src/services/admin.service";
import { success, fail } from "@/src/lib/response";

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    // TODO: Add admin role check
    // For now, anyone authenticated can access (add proper admin middleware)

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
  } catch (error: any) {
    return fail(error.message, "ADMIN_ERROR", error.statusCode || 500);
  }
}
