/**
 * API Route for League Management
 * 
 * This route handles HTTP requests for league CRUD operations.
 * It provides endpoints for creating and listing leagues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeagues, createLeague } from '@/lib/actions/league.actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const createdBy = searchParams.get('createdBy') || '';
    const isActive = searchParams.get('isActive') === 'true' ? true : 
                     searchParams.get('isActive') === 'false' ? false : undefined;
    const type = searchParams.get('type') || '';

    const result = await getLeagues(page, limit, search, createdBy, isActive, type);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'League name is required' },
        { status: 400 }
      );
    }

    if (!body.type || !['3v3+1', '6v6+1'].includes(body.type)) {
      return NextResponse.json(
        { error: 'League type must be either "3v3+1" or "6v6+1"' },
        { status: 400 }
      );
    }

    if (!body.createdBy) {
      return NextResponse.json(
        { error: 'CreatedBy (admin user ID) is required' },
        { status: 400 }
      );
    }
    
    const league = await createLeague(body);
    
    if (!league) {
      return NextResponse.json(
        { error: 'Failed to create league. League name may already exist.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(league, { status: 201 });
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    );
  }
}

