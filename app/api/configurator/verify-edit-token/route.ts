import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/src/lib/prisma";
import {
  success,
  fail,
  unauthorized,
  notFound,
  serverError,
} from "@/src/lib/response";
import { env } from "@/src/config/env";

const allowedOrigins = [
  "https://exact-dupe-engine.vercel.app",
  "http://localhost:8080",
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

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;
    if (!token) {
      const res = fail("Missing token", undefined, 400);
      return applyCors(res, origin);
    }

    const secret = env.EDIT_TOKEN_SECRET;
    if (!secret) {
      console.error("EDIT_TOKEN_SECRET not set");
      const res = serverError("Server misconfiguration");
      return applyCors(res, origin);
    }

    let payload: any;
    try {
      payload = verify(token, secret) as any;
    } catch (err) {
      const res = unauthorized("Invalid token");
      return applyCors(res, origin);
    }

    if (
      !payload ||
      payload.type !== "configurator_edit" ||
      !payload.sub ||
      !payload.configuratorId
    ) {
      const res = unauthorized("Invalid token payload");
      return applyCors(res, origin);
    }

    const configurator = await prisma.configurator.findUnique({
      where: { id: String(payload.configuratorId) },
      select: { id: true, clientId: true },
    });

    if (!configurator) {
      const res = notFound("Configurator not found");
      return applyCors(res, origin);
    }

    if (configurator.clientId !== String(payload.sub)) {
      const res = unauthorized("Ownership mismatch");
      return applyCors(res, origin);
    }

    const res = success({
      valid: true,
      configuratorId: configurator.id,
      clientId: configurator.clientId,
    });
    return applyCors(res, origin);
  } catch (err) {
    console.error("verify-edit-token error:", err);
    const res = serverError("Internal error");
    return applyCors(res, origin);
  }
}
