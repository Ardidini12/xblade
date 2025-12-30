/**
 * Club Server Actions
 * 
 * These server actions handle CRUD operations for club data.
 * They provide the server-side functions that components can call
 * to interact with the database, following Next.js best practices
 * for data mutations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import Club, { IClub } from '@/lib/models/club.model';
import { getClubId } from '@/lib/services/eaApiService';

/**
 * Creates a new club in the database
 * @param clubData - The club data to create
 * @returns The created club or null if error
 */
export async function createClub(clubData: Partial<IClub>) {
  try {
    await connectToDatabase();
    
    const newClub = new Club(clubData);
    await newClub.save();
    
    // Revalidate the clubs page to show the new club
    revalidatePath('/admin/clubs');
    
    return JSON.parse(JSON.stringify(newClub));
  } catch (error) {
    console.error('Error creating club:', error);
    return null;
  }
}

/**
 * Gets a club by its ID
 * @param clubId - The ID of the club to retrieve
 * @returns The club or null if not found
 */
export async function getClubById(clubId: string) {
  try {
    await connectToDatabase();
    
    const club = await Club.findOne({ clubId });
    
    if (!club) return null;
    
    return JSON.parse(JSON.stringify(club));
  } catch (error) {
    console.error('Error fetching club:', error);
    return null;
  }
}

/**
 * Gets clubs with optional filtering and pagination
 * @param page - The page number (default: 1)
 * @param limit - The number of clubs per page (default: 10)
 * @param search - Optional search term for club names
 * @returns Object with clubs array and pagination info
 */
export async function getClubs(page = 1, limit = 10, search = '') {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Get total count for pagination
    const total = await Club.countDocuments(query);
    
    // Get clubs with pagination
    const clubs = await Club.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    return {
      clubs: JSON.parse(JSON.stringify(clubs)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return {
      clubs: [],
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
 * Updates a club in the database
 * @param clubId - The ID of the club to update
 * @param updateData - The data to update
 * @returns The updated club or null if error
 */
export async function updateClub(clubId: string, updateData: Partial<IClub>) {
  try {
    await connectToDatabase();
    
    const updatedClub = await Club.findOneAndUpdate(
      { clubId },
      updateData,
      { new: true }
    );
    
    if (!updatedClub) return null;
    
    // Revalidate the clubs page to show the updated club
    revalidatePath('/admin/clubs');
    
    return JSON.parse(JSON.stringify(updatedClub));
  } catch (error) {
    console.error('Error updating club:', error);
    return null;
  }
}

/**
 * Deletes a club from the database
 * @param clubId - The ID of the club to delete
 * @returns True if successful, false otherwise
 */
export async function deleteClub(clubId: string) {
  try {
    await connectToDatabase();
    
    const result = await Club.deleteOne({ clubId });
    
    if (result.deletedCount === 0) return false;
    
    // Revalidate the clubs page to reflect the deletion
    revalidatePath('/admin/clubs');
    
    return true;
  } catch (error) {
    console.error('Error deleting club:', error);
    return false;
  }
}

/**
 * Imports club data from EA API
 * @param clubName - The name of the club to import
 * @param platform - The platform (default: "common-gen5")
 * @returns The imported club or null if error
 */
export async function importClubFromEA(clubName: string, platform = "common-gen5") {
  try {
    // Fetch club data from EA API
    const clubData = await getClubId(clubName, platform);
    
    if (!clubData || !Object.keys(clubData).length) {
      return null;
    }
    
    // Extract the first (and only) club from the response
    const clubId = Object.keys(clubData)[0];
    const clubInfo = clubData[clubId];
    
    // Check if club already exists
    await connectToDatabase();
    const existingClub = await Club.findOne({ clubId });
    
    if (existingClub) {
      // Update existing club
      const updatedClub = await updateClub(clubId, clubInfo);
      return updatedClub;
    } else {
      // Create new club
      const newClub = await createClub(clubInfo);
      return newClub;
    }
  } catch (error) {
    console.error('Error importing club from EA:', error);
    return null;
  }
}

/**
 * Searches for clubs by name in EA API
 * @param clubName - The name to search for
 * @param platform - The platform (default: "common-gen5")
 * @returns Array of matching clubs or null if error
 */
export async function searchClubsInEA(clubName: string, platform = "common-gen5") {
  try {
    const clubData = await getClubId(clubName, platform);
    
    if (!clubData || !Object.keys(clubData).length) {
      return [];
    }
    
    // Convert the object to an array of clubs
    const clubs = Object.keys(clubData).map(key => ({
      clubId: key,
      ...clubData[key]
    }));
    
    return clubs;
  } catch (error) {
    console.error('Error searching clubs in EA:', error);
    return [];
  }
}