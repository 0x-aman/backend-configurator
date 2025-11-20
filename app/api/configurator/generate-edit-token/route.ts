import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sign } from "jsonwebtoken";
import { prisma } from "@/src/lib/prisma";
import {
  success,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  fail,
} from "@/src/lib/response";
import { env } from "@/src/config/env";

type Body = { configuratorId?: string };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return unauthorized("Not authenticated");
    }

    const body: Body = await req.json().catch(() => ({}));
    const { configuratorId } = body;
    if (!configuratorId) {
      return fail("Missing configuratorId", undefined, 400);
    }

    // find user and client
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true },
    });

    if (!user || !user.client) {
      return unauthorized("Client not found");
    }

    // ensure configurator belongs to client
    const configurator = await prisma.configurator.findUnique({
      where: { publicId: configuratorId },
      select: { id: true, publicId: true, clientId: true },
    });

    if (!configurator) {
      return notFound("Configurator not found");
    }

    if (configurator.clientId !== user.client.id) {
      return forbidden("Forbidden");
    }

    const secret = env.EDIT_TOKEN_SECRET;
    if (!secret) {
      console.error("EDIT_TOKEN_SECRET is not set");
      return serverError("Server misconfiguration");
    }

    const payload = {
      sub: user.client.id,
      configuratorId: configurator.id,
      publicKey: user.client.publicKey,
      type: "configurator_edit",
    } as const;

    const token = sign(payload, secret, { expiresIn: "1h" });

    return success({ token });
  } catch (err) {
    console.error("generate-edit-token error:", err);
    return serverError("Internal error");
  }
}
