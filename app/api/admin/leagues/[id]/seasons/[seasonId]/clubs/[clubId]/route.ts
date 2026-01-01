/**
 * API Route for Individual Club Operations within a Season
 * 
 * This route handles HTTP requests for removing clubs from a season.
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeClubFromSeason, getSeasonById } from '@/lib/actions/league.actions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; seasonId: string; clubId: string } }
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

    // Verify the club is in the season
    if (!season.clubs || !season.clubs.includes(params.clubId)) {
      return NextResponse.json(
        { error: 'Club is not in this season' },
        { status: 404 }
      );
    }
    
    const updatedSeason = await removeClubFromSeason(params.id, params.seasonId, params.clubId);
    
    if (!updatedSeason) {
      return NextResponse.json(
        { error: 'Failed to remove club from season' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing club from season:', error);
    return NextResponse.json(
      { error: 'Failed to remove club from season' },
      { status: 500 }
    );
  }
}

