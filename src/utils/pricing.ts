// Pricing calculation utilities
import { Decimal } from '@prisma/client/runtime/library';

export function calculateTotal(items: { price: number | Decimal }[]): number {
  return items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString());
    return total + price;
  }, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

export function calculateTotalWithTax(subtotal: number, taxRate: number): number {
  return subtotal + calculateTax(subtotal, taxRate);
}

export function formatPrice(amount: number, currency: string = 'USD', symbol: string = '$'): string {
  return `${symbol}${amount.toFixed(2)}`;
}

export function parsePriceInput(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export interface PriceBreakdown {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export function calculatePriceBreakdown(
  items: { price: number | Decimal }[],
  taxRate: number = 0
): PriceBreakdown {
  const subtotal = calculateTotal(items);
  const taxAmount = calculateTax(subtotal, taxRate);
  const total = subtotal + taxAmount;

  return {
    subtotal,
    taxRate,
    taxAmount,
    total,
  };
}
