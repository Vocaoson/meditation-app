import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient, User } from '@prisma/client';
import crypto from 'crypto';
import { Session } from '@supabase/supabase-js';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
});

// Update the runMiddleware function to use NextRequest and NextResponse
const runMiddleware = (req: NextRequest, res: NextResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const prisma = new PrismaClient();

const ZALO_APP_SECRET_KEY = process.env.ZALO_APP_SECRET!;

const calculateHMacSHA256 = (data: string, secretKey: string) => {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(data);
  return hmac.digest("hex");
};

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  await runMiddleware(req, res, cors);

  console.log('Received request to /api/auth/zalo');
  const { access_token } = await req.json();
  console.log('Access token received:', access_token);

  try {
    // Calculate appsecret_proof
    const appsecret_proof = calculateHMacSHA256(access_token, ZALO_APP_SECRET_KEY);
    console.log('Calculated appsecret_proof:', appsecret_proof);

    // Fetch user info from Zalo API
    console.log('Fetching user info from Zalo API...');
    const zaloUserResponse = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,birthday,picture', {
      method: 'GET',
      headers: { 
        'access_token': access_token,
        'appsecret_proof': appsecret_proof
      },
    });

    console.log('Zalo API response status:', zaloUserResponse.status);

    if (!zaloUserResponse.ok) {
      throw new Error(`Zalo API request failed with status ${zaloUserResponse.status}`);
    }

    const zaloUser = await zaloUserResponse.json();
    console.log('Zalo user data:', zaloUser);

    if (zaloUser.error) {
      throw new Error(zaloUser.error.message);
    }

    // Check if user exists in database
    console.log('Checking if user exists in database...');
    let user = await prisma.user.findUnique({ where: { zaloId: zaloUser.id } });

    if (!user) {
      console.log('User not found, creating new user...');
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          zaloId: zaloUser.id,
          name: zaloUser.name,
          // Add other fields as needed
        },
      });
    }

    console.log('User data:', user);

    // Create a Supabase session
    console.log('Creating Supabase session...');
    const { data, error } = await supabase.auth.signUp({
      email: `${user.zaloId}@zalo.user`,
      password: user.zaloId, // Use a more secure method in production
    });

    if (error) throw error;

    console.log('Supabase session created:', data);

    // Generate a session token for the app
    console.log('Generating session token...');
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: `${user.zaloId}@zalo.user`,
      password: user.zaloId, // Use a more secure method in production
    });

    if (sessionError) throw sessionError;

    console.log('Session token generated:', sessionData);

    // Update the AuthResponse interface
    interface AuthResponse {
      user: {
        id: string;
        zaloId: string;
        name: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
      session: Session | null;
    }

    const response: AuthResponse = {
      user: {
        id: user.id,
        zaloId: user.zaloId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      session: sessionData.session
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error during Zalo authentication:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}