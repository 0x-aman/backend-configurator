import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { env } from "@/src/config/env";

// --- Helper: Handle CORS ---
function handleCORS(response) {
  response.headers.set(
    "Access-Control-Allow-Origin",
    env.CORS_ORIGINS
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// --- OPTIONS handler for CORS ---
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// --- Main route handler ---
async function handleRoute(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join("/")}`;
  const method = request.method;

  try {
    // Root endpoint
    if ((route === "/root" || route === "/") && method === "GET") {
      return handleCORS(NextResponse.json({ message: "Hello World" }));
    }

    // POST /api/status — create new status entry
    if (route === "/status" && method === "POST") {
      const body = await request.json();

      if (!body.client_name) {
        return handleCORS(
          NextResponse.json(
            { error: "client_name is required" },
            { status: 400 }
          )
        );
      }

      const newStatus = await prisma.statusCheck.create({
        data: {
          id: uuidv4(),
          client_name: body.client_name,
          timestamp: new Date(),
        },
      });

      return handleCORS(NextResponse.json(newStatus));
    }

    // GET /api/status — list status entries
    if (route === "/status" && method === "GET") {
      const statusChecks = await prisma.statusCheck.findMany({
        orderBy: { timestamp: "desc" },
        take: 1000,
      });

      return handleCORS(NextResponse.json(statusChecks));
    }

    // Default 404
    return handleCORS(
      NextResponse.json({ error: `Route ${route} not found` }, { status: 404 })
    );
  } catch (error) {
    console.error("API Error:", error);
    return handleCORS(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}

// --- Export HTTP methods ---
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
