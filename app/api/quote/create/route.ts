// Create quote
import { NextRequest, NextResponse } from "next/server";
import { QuoteService } from "@/src/services/quote.service";
import { AnalyticsService } from "@/src/services/analytics.service";
import { validatePublicKey } from "@/src/middleware/api-key";
import { success, fail, created } from "@/src/lib/response";
import { addCorsHeaders, handleCors } from "@/src/lib/cors";
import { validate } from "@/src/utils/validation";

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called from embed, so validate public key
    const client = await validatePublicKey(request);

    const body = await request.json();
    const {
      configuratorId,
      customerEmail,
      customerName,
      customerPhone,
      selectedOptions,
      totalPrice,
      configuration,
    } = body;

    const validation = validate([
      {
        field: "customerEmail",
        value: customerEmail,
        rules: ["required", "email"],
      },
      { field: "totalPrice", value: totalPrice, rules: ["required"] },
    ]);

    if (!validation.valid) {
      const response = fail(validation.errors.join(", "), "VALIDATION_ERROR");
      return addCorsHeaders(response, request, ["*"]);
    }

    const quote = await QuoteService.create(client.id, {
      configuratorId,
      customerEmail,
      customerName,
      customerPhone,
      selectedOptions,
      totalPrice: parseFloat(totalPrice),
      configuration,
    });

    // Track analytics event
    await AnalyticsService.trackEvent(client.id, {
      configuratorId,
      eventType: "QUOTE_REQUEST",
      eventName: "Quote Created",
      metadata: { quoteCode: quote.quoteCode },
    });

    const response = created(quote, "Quote created");
    return addCorsHeaders(response, request, ["*"]);
  } catch (error: any) {
    const response = fail(
      error.message,
      "CREATE_ERROR",
      error.statusCode || 500
    );
    return addCorsHeaders(response, request, ["*"]);
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCors(request);
  return corsResponse || new NextResponse(null, { status: 204 });
}
