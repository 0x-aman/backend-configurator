// Quote service
import { prisma } from "@/src/lib/prisma";
import { generateQuoteCode } from "@/src/utils/id";
import { NotFoundError } from "@/src/lib/errors";
import type { Quote, QuoteStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export const QuoteService = {
  async create(
    clientId: string,
    data: {
      configuratorId?: string;
      customerEmail: string;
      customerName?: string;
      customerPhone?: string;
      selectedOptions: any;
      totalPrice: number | Decimal;
      configuration?: any;
    }
  ): Promise<Quote> {
    return await prisma.quote.create({
      data: {
        clientId,
        configuratorId: data.configuratorId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        selectedOptions: data.selectedOptions,
        configuration: data.configuration,
        totalPrice: new Decimal(data.totalPrice.toString()),
        quoteCode: generateQuoteCode(),
      },
    });
  },

  async list(
    clientId: string,
    filters?: {
      status?: QuoteStatus;
      configuratorId?: string;
      customerEmail?: string;
    }
  ): Promise<Quote[]> {
    return await prisma.quote.findMany({
      where: {
        clientId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.configuratorId && {
          configuratorId: filters.configuratorId,
        }),
        ...(filters?.customerEmail && { customerEmail: filters.customerEmail }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        configurator: true,
      },
    });
  },

  async getById(id: string): Promise<Quote> {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { configurator: true },
    });
    if (!quote) throw new NotFoundError("Quote");
    return quote;
  },

  async getByCode(quoteCode: string): Promise<Quote> {
    const quote = await prisma.quote.findUnique({
      where: { quoteCode },
      include: { configurator: true },
    });
    if (!quote) throw new NotFoundError("Quote");
    return quote;
  },

  async update(id: string, data: Partial<Quote>): Promise<Quote> {
    if (data.totalPrice) {
      data.totalPrice = new Decimal(data.totalPrice.toString());
    }
    return await prisma.quote.update({
      where: { id },
      data: data as any,
    });
  },

  async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    return await prisma.quote.update({
      where: { id },
      data: { status },
    });
  },

  async markAsSent(id: string): Promise<Quote> {
    return await prisma.quote.update({
      where: { id },
      data: {
        status: "SENT",
        emailSentAt: new Date(),
      },
    });
  },

  async trackOpen(quoteCode: string): Promise<void> {
    await prisma.quote.update({
      where: { quoteCode },
      data: {
        openCount: { increment: 1 },
        lastOpenedAt: new Date(),
      },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.quote.delete({ where: { id } });
  },
};
