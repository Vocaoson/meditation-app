import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    // Add user to the request
    const requestWithUser = req.clone();
    (requestWithUser as any).user = data.user;

    return requestWithUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}