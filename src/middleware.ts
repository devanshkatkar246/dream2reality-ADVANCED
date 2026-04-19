import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. In a real app we'd verify Auth tokens (Firebase Admin / Edge JWT validation) here.
  // const token = request.headers.get('authorization')?.split('Bearer ')[1];
  // if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. We'd also Rate Limit here using Upstash
  // const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  // const { success } = await ratelimit.limit(ip);
  // if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  // Adding basic security headers for hackathon bonus points
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
