import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
  success,
  fail,
  unauthorized,
  notFound,
  serverError,
} from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";

// ======================================
// CORS SETUP
// ======================================
const allowedOrigins = [
  "https://exact-dupe-engine.vercel.app",
  "http://localhost:8080",
  "localhost",
];

function applyCors(response: NextResponse, origin: string | null) {
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  return response;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return applyCors(res, origin);
}

// ======================================
// VERIFY EDIT TOKEN
// ======================================
export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;

    if (!token) {
      const res = fail("Missing token", undefined, 400);
      return applyCors(res, origin);
    }

    // The helper now returns null if token is invalid/expired
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId || !payload.configuratorId) {
      const res = success({ valid: false });
      return applyCors(res, origin);
    }

    // 🔎 Check configurator exists and ownership matches
    const configurator = await prisma.configurator.findUnique({
      where: { id: String(payload.configuratorId) },
      select: { id: true, publicId: true, clientId: true },
    });

    if (!configurator) {
      const res = notFound("Configurator not found");
      return applyCors(res, origin);
    }

    if (configurator.clientId !== String(payload.clientId)) {
      const res = unauthorized("Ownership mismatch");
      return applyCors(res, origin);
    }

    // ✅ Success: valid token
    const res = success({
      valid: true,
      publicId: configurator.publicId,
    });

    return applyCors(res, origin);
  } catch (err) {
    console.error("verify-edit-token error:", err);
    const res = serverError("Internal server error");
    return applyCors(res, origin);
  }
}
