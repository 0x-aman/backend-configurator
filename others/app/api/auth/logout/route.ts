// Logout endpoint
import { NextRequest } from 'next/server';
import { success } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and can be used to invalidate tokens if needed
  return success(null, 'Logged out successfully');
}
