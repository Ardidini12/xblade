/**
 * API Route for Session Management
 * 
 * This route provides the current user session information.
 * It's used to fetch the authenticated user's ID for forms
 * that require user identification (e.g., creating leagues).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { user: null },
      { status: 500 }
    );
  }
}
