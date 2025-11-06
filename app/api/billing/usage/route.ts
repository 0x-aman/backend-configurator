import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  const client = await prisma.client.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!client)
    return new Response(JSON.stringify({ error: "Client not found" }), {
      status: 404,
    });

  const count = await prisma.option.count({
    where: {
      category: {
        isPrimary: true,
        configurator: { clientId: client.id },
      },
    },
  });

  // Calculate included limit based on purchased blocks
  const usage = await prisma.billingUsage.findUnique({
    where: { clientId: client.id },
    select: { chargedBlocks: true },
  });

  const baseLimit = 10;
  const extraLimit = (usage?.chargedBlocks ?? 0) * 10;
  const included = baseLimit + extraLimit;
  const remaining = Math.max(0, included - count);

  return Response.json({
    included,
    used: count,
    remaining,
    limitReached: count >= included,
  });
}
