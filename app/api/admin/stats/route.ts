// Admin - Get system stats
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { AdminService } from "@/src/services/admin.service";
import { success, fail } from "@/src/lib/response";

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    // TODO: Add admin role check

    const stats = await AdminService.getSystemStats();

    return success(stats);
  } catch (error: any) {
    return fail(error.message, "ADMIN_ERROR", 500);
  }
}
