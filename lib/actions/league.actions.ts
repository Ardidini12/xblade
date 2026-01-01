/**
 * League Server Actions
 * 
 * These server actions handle CRUD operations for league data.
 * They provide the server-side functions that components can call
 * to interact with the database, following Next.js best practices
 * for data mutations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import League, { ILeague } from '@/lib/models/league.model';
import Season from '@/lib/models/season.model';
import Club from '@/lib/models/club.model';

/**
 * Creates a new league in the database
 * @param leagueData - The league data to create
 * @returns The created league or null if error
 */
export async function createLeague(leagueData: Partial<ILeague>) {
  try {
    await connectToDatabase();
    
    const newLeague = new League(leagueData);
    await newLeague.save();
    
    // Revalidate the leagues page to show the new league
    revalidatePath('/admin/leagues');
    
    return JSON.parse(JSON.stringify(newLeague));
  } catch (error) {
    console.error('Error creating league:', error);
    return null;
  }
}

/**
 * Gets a league by its ID
 * @param leagueId - The ID of the league to retrieve
 * @returns The league or null if not found
 */
export async function getLeagueById(leagueId: string) {
  try {
    await connectToDatabase();
    
    const league = await League.findById(leagueId);
    
    if (!league) return null;
    
    return JSON.parse(JSON.stringify(league));
  } catch (error) {
    console.error('Error fetching league:', error);
    return null;
  }
}

/**
 * Gets leagues with optional filtering and pagination
 * @param page - The page number (default: 1)
 * @param limit - The number of leagues per page (default: 10)
 * @param search - Optional search term for league names
 * @param createdBy - Optional admin user ID to filter leagues
 * @param isActive - Optional filter for active leagues
 * @param type - Optional filter for league type (3v3+1 or 6v6+1)
 * @returns Object with leagues array and pagination info
 */
export async function getLeagues(
  page = 1, 
  limit = 10, 
  search = '', 
  createdBy = '', 
  isActive = true,
  type = ''
) {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (createdBy) {
      query.createdBy = createdBy;
    }
    
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    
    if (type) {
      query.type = type;
    }
    
    // Get total count for pagination
    const total = await League.countDocuments(query);
    
    // Get leagues with pagination
    const leagues = await League.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      leagues: JSON.parse(JSON.stringify(leagues)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return {
      leagues: [],
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
 * Updates a league in the database
 * @param leagueId - The ID of the league to update
 * @param updateData - The data to update
 * @returns The updated league or null if error
 */
export async function updateLeague(leagueId: string, updateData: Partial<ILeague>) {
  try {
    await connectToDatabase();
    
    const updatedLeague = await League.findByIdAndUpdate(
      leagueId,
      updateData,
      { new: true }
    );
    
    if (!updatedLeague) return null;
    
    // Revalidate the leagues page to show the updated league
    revalidatePath('/admin/leagues');
    revalidatePath(`/admin/leagues/${leagueId}`);
    
    return JSON.parse(JSON.stringify(updatedLeague));
  } catch (error) {
    console.error('Error updating league:', error);
    return null;
  }
}

/**
 * Deletes a league from the database
 * @param leagueId - The ID of the league to delete
 * @returns True if successful, false otherwise
 */
export async function deleteLeague(leagueId: string) {
  try {
    await connectToDatabase();
    
    // First, delete all seasons associated with this league
    await Season.deleteMany({ leagueId });
    
    // Then delete the league
    const result = await League.findByIdAndDelete(leagueId);
    
    if (!result) return false;
    
    // Revalidate the leagues page to reflect the deletion
    revalidatePath('/admin/leagues');
    
    return true;
  } catch (error) {
    console.error('Error deleting league:', error);
    return false;
  }
}

/**
 * Adds a season to a league
 * @param leagueId - The ID of the league
 * @param seasonData - The season data to add
 * @returns The updated league or null if error
 */
export async function addSeasonToLeague(leagueId: string, seasonData: any) {
  try {
    await connectToDatabase();
    
    // Create the season
    const newSeason = new Season({
      ...seasonData,
      leagueId
    });
    await newSeason.save();
    
    // Add the season to the league
    const updatedLeague = await League.findByIdAndUpdate(
      leagueId,
      { 
        $push: { 
          seasons: {
            _id: newSeason._id,
            name: newSeason.name,
            startDate: newSeason.startDate,
            endDate: newSeason.endDate,
            isActive: newSeason.isActive,
            clubs: newSeason.clubs || [],
            description: newSeason.description
          } 
        } 
      },
      { new: true }
    );
    
    if (!updatedLeague) return null;
    
    // Revalidate paths
    revalidatePath('/admin/leagues');
    revalidatePath(`/admin/leagues/${leagueId}`);
    
    return JSON.parse(JSON.stringify(updatedLeague));
  } catch (error) {
    console.error('Error adding season to league:', error);
    return null;
  }
}

/**
 * Updates a season in a league
 * @param leagueId - The ID of the league
 * @param seasonId - The ID of the season to update
 * @param updateData - The data to update
 * @returns The updated season or null if error
 */
export async function updateSeasonInLeague(leagueId: string, seasonId: string, updateData: any) {
  try {
    await connectToDatabase();
    
    // Update the season
    const updatedSeason = await Season.findByIdAndUpdate(
      seasonId,
      updateData,
      { new: true }
    );
    
    if (!updatedSeason) return null;
    
    // Revalidate paths
    revalidatePath('/admin/leagues');
    revalidatePath(`/admin/leagues/${leagueId}`);
    revalidatePath(`/admin/seasons/${seasonId}`);
    
    return JSON.parse(JSON.stringify(updatedSeason));
  } catch (error) {
    console.error('Error updating season in league:', error);
    return null;
  }
}

/**
 * Removes a season from a league
 * @param leagueId - The ID of the league
 * @param seasonId - The ID of the season to remove
 * @returns The updated league or null if error
 */
export async function removeSeasonFromLeague(leagueId: string, seasonId: string) {
  try {
    await connectToDatabase();
    
    // Delete the season
    await Season.findByIdAndDelete(seasonId);
    
    // Remove the season from the league
    const updatedLeague = await League.findByIdAndUpdate(
      leagueId,
      { $pull: { seasons: seasonId } },
      { new: true }
    );
    
    if (!updatedLeague) return null;
    
    // Revalidate paths
    revalidatePath('/admin/leagues');
    revalidatePath(`/admin/leagues/${leagueId}`);
    
    return JSON.parse(JSON.stringify(updatedLeague));
  } catch (error) {
    console.error('Error removing season from league:', error);
    return null;
  }
}

/**
 * Adds a club to a season
 * @param leagueId - The ID of the league
 * @param seasonId - The ID of the season
 * @param clubId - The ID of the club to add
 * @returns The updated season or null if error
 */
export async function addClubToSeason(leagueId: string, seasonId: string, clubId: string) {
  try {
    await connectToDatabase();
    
    // Verify the club exists
    const club = await Club.findOne({ clubId });
    if (!club) return null;
    
    // Add the club to the season
    const updatedSeason = await Season.findByIdAndUpdate(
      seasonId,
      { $addToSet: { clubs: clubId } },
      { new: true }
    );
    
    if (!updatedSeason) return null;
    
    // Revalidate paths
    revalidatePath('/admin/leagues');
    revalidatePath(`/admin/leagues/${leagueId}`);
    revalidatePath(`/admin/seasons/${seasonId}`);
    
    return JSON.parse(JSON.stringify(updatedSeason));
  } catch (error) {
    console.error('Error adding club to season:', error);
    return null;
  }
}

/**
 * Removes a club from a season
 * @param leagueId - The ID of the league
 * @param seasonId - The ID of the season
 * @param clubId - The ID of the club to remove
 * @returns The updated season or null if error
 */
export async function removeClubFromSeason(leagueId: string, seasonId: string, clubId: string) {
  try {
    await connectToDatabase();
    
    // Remove the club from the season
    const updatedSeason = await Season.findByIdAndUpdate(
      seasonId,
      { $pull: { clubs: clubId } },
      { new: true }
    );
    
    if (!updatedSeason) return null;
    
    // Revalidate paths
    revalidatePath('/admin/leagues');
    revalidatePath(`/admin/leagues/${leagueId}`);
    revalidatePath(`/admin/seasons/${seasonId}`);
    
    return JSON.parse(JSON.stringify(updatedSeason));
  } catch (error) {
    console.error('Error removing club from season:', error);
    return null;
  }
}

/**
 * Gets all seasons for a league
 * @param leagueId - The ID of the league
 * @returns Array of seasons or empty array if error
 */
export async function getSeasonsForLeague(leagueId: string) {
  try {
    await connectToDatabase();
    
    const seasons = await Season.find({ leagueId })
      .sort({ startDate: -1 });
    
    return JSON.parse(JSON.stringify(seasons));
  } catch (error) {
    console.error('Error fetching seasons for league:', error);
    return [];
  }
}

/**
 * Gets a season by its ID
 * @param seasonId - The ID of the season to retrieve
 * @returns The season or null if not found
 */
export async function getSeasonById(seasonId: string) {
  try {
    await connectToDatabase();
    
    const season = await Season.findById(seasonId);
    
    if (!season) return null;
    
    return JSON.parse(JSON.stringify(season));
  } catch (error) {
    console.error('Error fetching season:', error);
    return null;
  }
}

/**
 * Gets clubs for a season
 * @param seasonId - The ID of the season
 * @returns Array of clubs or empty array if error
 */
export async function getClubsForSeason(seasonId: string) {
  try {
    await connectToDatabase();
    
    // First get the season to get the club IDs
    const season = await Season.findById(seasonId);
    if (!season || !season.clubs.length) return [];
    
    // Then get the clubs
    const clubs = await Club.find({ 
      clubId: { $in: season.clubs } 
    });
    
    return JSON.parse(JSON.stringify(clubs));
  } catch (error) {
    console.error('Error fetching clubs for season:', error);
    return [];
  }
}