// List themes
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { ThemeService } from "@/src/services/theme.service";
import { success, fail } from "@/src/lib/response";
import { ClientService } from "@/src/services/client.service";

export async function GET(request: NextRequest) {
  try {
    const publicKey = request.headers.get("x-public-key");
    const client = await ClientService.getByPublicKey(publicKey!);

    if (!client || !client.id) {
      return fail("Client not found", "CLIENT_NOT_FOUND", 404);
    }

    const themes = await ThemeService.list(client.id);

    return success(themes);
  } catch (error: any) {
    return fail(error.message, "LIST_ERROR", 500);
  }
}
