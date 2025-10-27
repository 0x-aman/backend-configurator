// Get current client profile
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { ClientService } from "@/src/services/client.service";
import { success, fail } from "@/src/lib/response";

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const safeClient = await ClientService.getSafeClient(client.id);

    return success(safeClient);
  } catch (error: any) {
    return fail(error.message, "CLIENT_ERROR", error.statusCode || 500);
  }
}
