import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
  success,
  fail,
  unauthorized,
  notFound,
  serverError,
} from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";
import { handleCors, addCorsHeaders } from "@/src/lib/cors";

// ======================================
// CORS handled by centralized system
// ======================================
export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCors(request);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// ======================================
// VERIFY EDIT TOKEN
// ======================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body?.token;

    if (!token) {
      const res = fail("Missing token", undefined, 400);
      return addCorsHeaders(res, request);
    }

    // The helper now returns null if token is invalid/expired
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId || !payload.configuratorId) {
      const res = success({ valid: false });
      return addCorsHeaders(res, request);
    }

    // 🔎 Check configurator exists and ownership matches
    const configurator = await prisma.configurator.findUnique({
      where: { id: String(payload.configuratorId) },
      select: { id: true, publicId: true, clientId: true },
    });

    if (!configurator) {
      const res = notFound("Configurator not found");
      return addCorsHeaders(res, request);
    }

    if (configurator.clientId !== String(payload.clientId)) {
      const res = unauthorized("Ownership mismatch");
      return addCorsHeaders(res, request);
    }

    // ✅ Success: valid token
    const res = success({
      valid: true,
      publicId: configurator.publicId,
    });

    return addCorsHeaders(res, request);
  } catch (err) {
    console.error("verify-edit-token error:", err);
    const res = serverError("Internal server error");
    return addCorsHeaders(res, request);
  }
}
