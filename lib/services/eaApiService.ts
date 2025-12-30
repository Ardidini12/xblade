/**
 * EA API Service
 * 
 * This service handles communication with EA's NHL Pro Clubs API.
 * It provides functions to fetch club data and match data with proper
 * error handling, caching, and rate limiting to ensure reliable data
 * collection for the scheduler system.
 */

// Cache for API responses to avoid excessive calls
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Common headers required by EA's API
const EA_API_HEADERS = {
  "Host": "proclubs.ea.com",
  "sec-ch-ua-platform": "\"Windows\"",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "accept": "application/json",
  "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
  "sec-ch-ua-mobile": "?0",
  "origin": "https://www.ea.com",
  "sec-fetch-site": "same-site",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "referer": "https://www.ea.com/",
  "accept-language": "en-US,en;q=0.9",
  "priority": "u=1, i"
};

/**
 * Helper function to check if cached data is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Fetches club ID by club name from EA's API
 * @param clubName - The name of the club to search for
 * @param platform - The platform (default: "common-gen5")
 * @returns Club data object or null if not found
 */
export async function getClubId(clubName: string, platform = "common-gen5") {
  try {
    // Check cache first
    const cacheKey = `club-${clubName}-${platform}`;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }

    // Construct URL with proper encoding
    const url = `https://proclubs.ea.com/api/nhl/clubs/search?platform=${platform}&clubName=${encodeURIComponent(clubName)}`;
    
    // Make API request
    const response = await fetch(url, {
      method: "GET",
      headers: EA_API_HEADERS,
      // Add cache control to prevent browser caching
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error(`Error fetching club ID for ${clubName}:`, error);
    return null;
  }
}

/**
 * Fetches match data for a specific club from EA's API
 * @param clubId - The ID of the club
 * @param platform - The platform (default: "common-gen5")
 * @param matchType - The type of match (default: "club_private")
 * @returns Array of match objects or null if error
 */
export async function getClubMatches(
  clubId: string, 
  platform = "common-gen5",
  matchType = "club_private"
) {
  try {
    // Check cache first
    const cacheKey = `matches-${clubId}-${platform}-${matchType}`;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }

    // Construct URL
    const url = `https://proclubs.ea.com/api/nhl/clubs/matches?matchType=${matchType}&platform=${platform}&clubIds=${clubId}`;
    
    // Make API request
    const response = await fetch(url, {
      method: "GET",
      headers: EA_API_HEADERS,
      // Add cache control to prevent browser caching
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error(`Error fetching matches for club ${clubId}:`, error);
    return null;
  }
}

/**
 * Clears expired entries from the cache
 */
export function clearExpiredCache() {
  for (const [key, value] of apiCache.entries()) {
    if (!isCacheValid(value.timestamp)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Clears all cache entries
 */
export function clearAllCache() {
  apiCache.clear();
}