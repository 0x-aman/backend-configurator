// Get configurator by public ID (for embed)
import { NextRequest, NextResponse } from "next/server";
import { ConfiguratorService } from "@/src/services/configurator.service";
import { ClientService } from "@/src/services/client.service";
import { success, fail } from "@/src/lib/response";
import { addCorsHeaders, handleCors } from "@/src/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const url = new URL(request.url);
    const publicKey = url.searchParams.get("publicKey");

    if (!publicKey) {
      const res = fail("Missing client public key.", "MISSING_CLIENT_KEY", 400);
      return addCorsHeaders(res, request, ["*"]);
    }

    // Step 1: verify client
    const client = await ClientService.getByPublicKey(publicKey);
    if (!client) {
      const res = fail("Invalid client public key.", "CLIENT_NOT_FOUND", 404);
      return addCorsHeaders(res, request, ["*"]);
    }

    // Step 2: check the origin (client’s actual website)
    const embedOrigin = request.headers.get("x-embed-origin");
    if (!embedOrigin) {
      const res = fail("Missing origin header.", "MISSING_EMBED_ORIGIN", 400);
      return addCorsHeaders(res, request, ["*"]);
    }

    try {
      const originHost = new URL(embedOrigin).hostname;
      const allowed = client.allowedDomains || [];

      // ✅ Bypass for embed-konfigra.vercel.app and localhost:8080
      const bypassDomains = ["embed-konfigra.vercel.app", "localhost"];
      const isBypass = bypassDomains.some(
        (domain) => originHost === domain || originHost.endsWith(`.${domain}`)
      );

      if (isBypass) {
        // Skip domain validation for bypass domains
      } else {
        // No configured domains → block to force setup
        if (allowed.length === 0) {
          const res = fail(
            "No allowed domains configured. Please add your domain to allowed origins in your account settings.",
            "NO_ALLOWED_ORIGINS",
            403
          );
          return addCorsHeaders(res, request, ["*"]);
        }

        const isAllowed = allowed.some(
          (domain: string) =>
            originHost === domain || originHost.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
          const res = fail(
            `Unauthorized embed domain (${originHost}). Please add it to your allowed domains in account settings.`,
            "ORIGIN_MISMATCH",
            403
          );
          return addCorsHeaders(res, request, ["*"]);
        }
      }
    } catch {
      const res = fail("Invalid origin format.", "INVALID_ORIGIN", 400);
      return addCorsHeaders(res, request, ["*"]);
    }

    // Step 3: find configurator belonging to this client
    const configurator = await ConfiguratorService.getByPublicIdAndClientId(
      publicId,
      client.id
    );

    if (!configurator) {
      const res = fail(
        "Configurator not found for this client.",
        "NOT_FOUND",
        404
      );
      return addCorsHeaders(res, request, ["*"]);
    }

    // Step 4: success
    await ConfiguratorService.updateAccessedAt(configurator.id);
    const res = success(configurator);
    return addCorsHeaders(res, request, ["*"]);
  } catch (error: any) {
    const res = fail(error.message, "CONFIGURATOR_ERROR", 500);
    return addCorsHeaders(res, request, ["*"]);
  }
}
export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 204 });
}
