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
// const runMiddleware = (req: NextRequest, res: NextResponse, fn: Function) => {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: unknown) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const prisma = new PrismaClient();

const ZALO_APP_SECRET_KEY = process.env.ZALO_APP_SECRET!;

const calculateHMacSHA256 = (data: string, secretKey: string) => {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(data);
  return hmac.digest("hex");
};

interface AuthResponse {
  user: {
    id: string;
    zaloId: string | null; // Allow zaloId to be null
    name: string | null; // Allow name to be null
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: Session | null;
}

export async function POST(req: NextRequest) {
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

    // Create or sign in with Supabase using Zalo ID
    console.log('Authenticating with Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${user.zaloId}@zalo.user`,
      password: user.zaloId, // Use a more secure method in production
    });

    let authData;

    if (error) {
      console.log('User not found in Supabase, attempting to create or retrieve...');
      const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: `${user.zaloId}@zalo.user`,
        password: user.zaloId,
        email_confirm: true,
        user_metadata: { zalo_id: user.zaloId, name: user.name }
      });

      if (createUserError && createUserError.message !== 'User already registered') {
        console.error('User creation failed:', createUserError);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
      }

      // If user already exists or was just created, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${user.zaloId}@zalo.user`,
        password: user.zaloId,
      });

      if (signInError) {
        console.error('Sign in failed:', signInError);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
      }

      authData = signInData;
    } else {
      authData = data;
    }

    console.log('Supabase authentication successful:', authData);

    const response: AuthResponse = {
      user: {
        id: user.id,
        zaloId: user.zaloId,
        name: user.name || null, // Use null if name is undefined or empty
        email: null, // We don't have an email
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      session: authData.session
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error during Zalo authentication:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}