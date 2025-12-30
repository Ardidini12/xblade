/**
 * Match Server Actions
 * 
 * These server actions handle CRUD operations for match data.
 * They provide the server-side functions that components can call
 * to interact with the database, following Next.js best practices
 * for data mutations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import Match, { IMatch } from '@/lib/models/match.model';
import { getClubMatches } from '@/lib/services/eaApiService';

/**
 * Creates a new match in the database
 * @param matchData - The match data to create
 * @returns The created match or null if error
 */
export async function createMatch(matchData: Partial<IMatch>) {
  try {
    await connectToDatabase();
    
    // Check if match already exists to prevent duplicates
    const existingMatch = await Match.findOne({ matchId: matchData.matchId });
    if (existingMatch) {
      return JSON.parse(JSON.stringify(existingMatch));
    }
    
    const newMatch = new Match(matchData);
    await newMatch.save();
    
    // Revalidate relevant paths
    revalidatePath('/admin/matches');
    revalidatePath(`/admin/clubs/${Object.keys(matchData.clubs || {})[0]}`);
    
    return JSON.parse(JSON.stringify(newMatch));
  } catch (error) {
    console.error('Error creating match:', error);
    return null;
  }
}

/**
 * Gets a match by its ID
 * @param matchId - The ID of the match to retrieve
 * @returns The match or null if not found
 */
export async function getMatchById(matchId: string) {
  try {
    await connectToDatabase();
    
    const match = await Match.findOne({ matchId });
    
    if (!match) return null;
    
    return JSON.parse(JSON.stringify(match));
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}

/**
 * Gets matches with optional filtering and pagination
 * @param page - The page number (default: 1)
 * @param limit - The number of matches per page (default: 10)
 * @param clubId - Optional club ID to filter matches
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Object with matches array and pagination info
 */
export async function getMatches(
  page = 1, 
  limit = 10, 
  clubId = '', 
  startDate = '', 
  endDate = ''
) {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (clubId) {
      // Find matches where this club participated
      query[`clubs.${clubId}`] = { $exists: true };
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        const start = new Date(startDate).getTime() / 1000;
        query.timestamp.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate).getTime() / 1000;
        query.timestamp.$lte = end;
      }
    }
    
    // Get total count for pagination
    const total = await Match.countDocuments(query);
    
    // Get matches with pagination, sorted by timestamp (newest first)
    const matches = await Match.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      matches: JSON.parse(JSON.stringify(matches)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      matches: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };
  }
}

/**
 * Gets matches for a specific club
 * @param clubId - The ID of the club
 * @param page - The page number (default: 1)
 * @param limit - The number of matches per page (default: 10)
 * @returns Object with matches array and pagination info
 */
export async function getClubMatchesFromDB(clubId: string, page = 1, limit = 10) {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    
    // Find matches where this club participated
    const query = {
      [`clubs.${clubId}`]: { $exists: true }
    };
    
    // Get total count for pagination
    const total = await Match.countDocuments(query);
    
    // Get matches with pagination, sorted by timestamp (newest first)
    const matches = await Match.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      matches: JSON.parse(JSON.stringify(matches)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching club matches:', error);
    return {
      matches: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };
  }
}

/**
 * Imports matches for a club from EA API
 * @param clubId - The ID of the club to import matches for
 * @param platform - The platform (default: "common-gen5")
 * @param matchType - The type of match (default: "club_private")
 * @returns Array of imported matches or null if error
 */
export async function importMatchesFromEA(
  clubId: string, 
  platform = "common-gen5",
  matchType = "club_private"
) {
  try {
    // Fetch match data from EA API
    const matchesData = await getClubMatches(clubId, platform, matchType);
    
    if (!matchesData || !Array.isArray(matchesData) || matchesData.length === 0) {
      return [];
    }
    
    const importedMatches = [];
    
    // Process each match
    for (const matchData of matchesData) {
      const match = await createMatch(matchData);
      if (match) {
        importedMatches.push(match);
      }
    }
    
    // Revalidate paths to show new matches
    revalidatePath('/admin/matches');
    revalidatePath(`/admin/clubs/${clubId}`);
    
    return importedMatches;
  } catch (error) {
    console.error('Error importing matches from EA:', error);
    return [];
  }
}

/**
 * Gets recent matches for a club (last 5 matches)
 * @param clubId - The ID of the club
 * @returns Array of recent matches
 */
export async function getRecentMatchesForClub(clubId: string) {
  try {
    await connectToDatabase();
    
    // Find matches where this club participated
    const query = {
      [`clubs.${clubId}`]: { $exists: true }
    };
    
    // Get last 5 matches, sorted by timestamp (newest first)
    const matches = await Match.find(query)
      .sort({ timestamp: -1 })
      .limit(5);
    
    return JSON.parse(JSON.stringify(matches));
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

/**
 * Gets match statistics for a club
 * @param clubId - The ID of the club
 * @returns Object with match statistics
 */
export async function getClubMatchStats(clubId: string) {
    try {
      await connectToDatabase();
      
      const stats = await Match.aggregate([
        { $match: { [`clubs.${clubId}`]: { $exists: true } } },
        {
          $project: {
            clubData: { $getField: { field: clubId, input: "$clubs" } }
          }
        },
        {
          $group: {
            _id: null,
            totalMatches: { $sum: 1 },
            wins: {
              $sum: {
                $cond: [{ $in: [{ $toInt: "$clubData.result" }, [1, 16385]] }, 1, 0]
              }
            },
            losses: {
              $sum: {
                $cond: [{ $in: [{ $toInt: "$clubData.result" }, [2, 10]] }, 1, 0]
              }
            },
            goalsFor: { $sum: { $toInt: { $ifNull: ["$clubData.goals", "0"] } } },
            goalsAgainst: { $sum: { $toInt: { $ifNull: ["$clubData.goalsAgainst", "0"] } } }
          }
        }
      ]);
      
      if (!stats.length) {
        return { totalMatches: 0, wins: 0, losses: 0, ties: 0, goalsFor: 0, goalsAgainst: 0 };
      }
      
      const { totalMatches, wins, losses, goalsFor, goalsAgainst } = stats[0];
      return {
        totalMatches,
        wins,
        losses,
        ties: totalMatches - wins - losses,
        goalsFor,
        goalsAgainst
      };
    } catch (error) {
      console.error('Error fetching club match stats:', error);
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    }
  }

