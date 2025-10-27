// Get current user endpoint
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { ClientService } from "@/src/services/client.service";
import { success, fail, unauthorized } from "@/src/lib/response";

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const safeClient = await ClientService.getSafeClient(client.id);

    return success(safeClient);
  } catch (error: any) {
    if (error.statusCode === 401) {
      return unauthorized(error.message);
    }
    return fail(error.message, "AUTH_ERROR", 500);
  }
}
