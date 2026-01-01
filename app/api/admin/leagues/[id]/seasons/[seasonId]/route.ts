/**
 * API Route for Individual Season Operations within a League
 * 
 * This route handles HTTP requests for updating and deleting seasons.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSeasonInLeague, removeSeasonFromLeague, getSeasonById } from '@/lib/actions/league.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; seasonId: string } }
) {
  try {
    const season = await getSeasonById(params.seasonId);
    
    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      );
    }

    // Verify the season belongs to the league
    if (season.leagueId !== params.id) {
      return NextResponse.json(
        { error: 'Season does not belong to this league' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(season);
  } catch (error) {
    console.error('Error fetching season:', error);
    return NextResponse.json(
      { error: 'Failed to fetch season' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; seasonId: string } }
) {
  try {
    const body = await request.json();
    
    // Validate dates if provided
    if (body.startDate) {
      const startDate = new Date(body.startDate);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 }
        );
      }
      body.startDate = startDate;
    }

    if (body.endDate) {
      const endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 }
        );
      }
      body.endDate = endDate;

      // Validate end date is after start date
      if (body.startDate && endDate < body.startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }
    
    const season = await updateSeasonInLeague(params.id, params.seasonId, body);
    
    if (!season) {
      return NextResponse.json(
        { error: 'Season not found or failed to update' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(season);
  } catch (error) {
    console.error('Error updating season:', error);
    return NextResponse.json(
      { error: 'Failed to update season' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonId: string }> }
) {
  try {
    const { id, seasonId } = await params;
    const league = await removeSeasonFromLeague(id, seasonId);
    
    if (!league) {
      return NextResponse.json(
        { error: 'Season not found or failed to delete' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting season:', error);
    return NextResponse.json(
      { error: 'Failed to delete season' },
      { status: 500 }
    );
  }
}

