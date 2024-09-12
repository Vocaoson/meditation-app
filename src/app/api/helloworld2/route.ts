import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../middleware/authMiddleware';

export async function GET(req: NextRequest) {
  const authenticatedReq = await authMiddleware(req);
  
  if (authenticatedReq instanceof NextResponse) {
    // This means authentication failed
    return authenticatedReq;
  }

  const user = (authenticatedReq as any).user;
  return NextResponse.json({ message: `Hello, ${user.email}!`, user });
}