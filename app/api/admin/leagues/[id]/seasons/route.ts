/**
 * API Route for Season Management within a League
 * 
 * This route handles HTTP requests for adding seasons to a league.
 */

import { NextRequest, NextResponse } from 'next/server';
import { addSeasonToLeague, getSeasonsForLeague } from '@/lib/actions/league.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seasons = await getSeasonsForLeague(id);
    
    return NextResponse.json(seasons);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Season name is required' },
        { status: 400 }
      );
    }

    if (!body.startDate) {
      return NextResponse.json(
        { error: 'Season start date is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(body.startDate);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date format' },
        { status: 400 }
      );
    }

    // Validate end date if provided
    if (body.endDate) {
      const endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 }
        );
      }
      
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }
    
    const seasonData = {
      leagueId: id,
      name: body.name,
      description: body.description,
      startDate: startDate,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      clubs: body.clubs || []
    };
    
    const league = await addSeasonToLeague(id, seasonData);
    
    if (!league) {
      return NextResponse.json(
        { error: 'Failed to add season to league. League may not exist.' },
        { status: 400 }
      );
    }
    
    // Find the newly added season (last one in the array)
    const newSeason = league.seasons && league.seasons.length > 0 
      ? league.seasons[league.seasons.length - 1]
      : null;
    
    // Serialize dates to ISO strings
    const serializedSeason = newSeason ? {
      ...newSeason,
      startDate: newSeason.startDate instanceof Date ? newSeason.startDate.toISOString() : newSeason.startDate,
      endDate: newSeason.endDate ? (newSeason.endDate instanceof Date ? newSeason.endDate.toISOString() : newSeason.endDate) : undefined
    } : null;
    
    return NextResponse.json(serializedSeason || league, { status: 201 });
  } catch (error) {
    console.error('Error adding season to league:', error);
    return NextResponse.json(
      { error: 'Failed to add season to league' },
      { status: 500 }
    );
  }
}
