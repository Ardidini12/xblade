/**
 * API Route for Club Management within a Season
 * 
 * This route handles HTTP requests for listing and adding clubs to a season.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClubsForSeason, addClubToSeason } from '@/lib/actions/league.actions';
import { getSeasonById } from '@/lib/actions/league.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; seasonId: string } }
) {
  try {
    // Verify the season belongs to the league
    const season = await getSeasonById(params.seasonId);
    
    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      );
    }

    if (season.leagueId !== params.id) {
      return NextResponse.json(
        { error: 'Season does not belong to this league' },
        { status: 400 }
      );
    }

    const clubs = await getClubsForSeason(params.seasonId);
    
    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs for season:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs for season' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; seasonId: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      );
    }

    // Verify the season belongs to the league
    const season = await getSeasonById(params.seasonId);
    
    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      );
    }

    if (season.leagueId !== params.id) {
      return NextResponse.json(
        { error: 'Season does not belong to this league' },
        { status: 400 }
      );
    }
    
    const updatedSeason = await addClubToSeason(params.id, params.seasonId, body.clubId);
    
    if (!updatedSeason) {
      return NextResponse.json(
        { error: 'Failed to add club to season. Club may not exist or already be in the season.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(updatedSeason, { status: 201 });
  } catch (error) {
    console.error('Error adding club to season:', error);
    return NextResponse.json(
      { error: 'Failed to add club to season' },
      { status: 500 }
    );
  }
}

