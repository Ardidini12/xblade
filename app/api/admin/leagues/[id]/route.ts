/**
 * API Route for Individual League Operations
 * 
 * This route handles HTTP requests for individual league operations
 * including getting, updating, and deleting leagues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeagueById, updateLeague, deleteLeague } from '@/lib/actions/league.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const league = await getLeagueById(id);
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(league);
  } catch (error) {
    console.error('Error fetching league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate type if provided
    if (body.type && !['3v3+1', '6v6+1'].includes(body.type)) {
      return NextResponse.json(
        { error: 'League type must be either "3v3+1" or "6v6+1"' },
        { status: 400 }
      );
    }
    
    const league = await updateLeague(id, body);
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found or failed to update' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(league);
  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json(
      { error: 'Failed to update league' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteLeague(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'League not found or failed to delete' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json(
      { error: 'Failed to delete league' },
      { status: 500 }
    );
  }
}

