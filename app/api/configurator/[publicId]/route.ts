// Get configurator by public ID (for embed)
import { NextRequest } from "next/server";
import { ConfiguratorService } from "@/src/services/configurator.service";
import { success, fail } from "@/src/lib/response";
import { addCorsHeaders } from "@/src/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const configurator = await ConfiguratorService.getByPublicId(publicId);

    // Update access time
    await ConfiguratorService.updateAccessedAt(configurator.id);

    const response = success(configurator);
    return addCorsHeaders(response, request, ["*"]);
  } catch (error: any) {
    const response = fail(
      error.message,
      "CONFIGURATOR_ERROR",
      error.statusCode || 500
    );
    return addCorsHeaders(response, request, ["*"]);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
