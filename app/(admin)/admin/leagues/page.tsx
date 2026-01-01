/**
 * League Management Page
 * 
 * This page provides the admin interface for managing leagues, seasons, and clubs.
 * It allows admins to create, edit, and organize leagues that structure the data
 * collected from EA's NHL Pro Clubs API.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { LeagueManagementClient } from '@/components/admin/league-management/LeagueManagementClient';
import { getLeagues } from '@/lib/actions/league.actions';

export const metadata: Metadata = {
  title: 'League Management | XBlade',
  description: 'Manage leagues, seasons, and clubs for the xblade platform',
};

async function getLeaguesData() {
  try {
    const result = await getLeagues(1, 100); // Get up to 100 leagues
    return result.leagues || [];
  } catch (error) {
    console.error('Failed to fetch leagues:', error);
    return [];
  }
}

function LeagueManagementSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-muted rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-4 w-24 bg-muted rounded mb-2 animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 w-48 bg-muted rounded mb-2 animate-pulse" />
              <div className="h-4 w-full bg-muted rounded mb-2 animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Details Skeleton */}
        <div>
          <div className="border rounded-lg p-6">
            <div className="h-6 w-64 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function LeagueManagementPage() {
  const leagues = await getLeaguesData();

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LeagueManagementSkeleton />}>
        <LeagueManagementClient initialLeagues={leagues} />
      </Suspense>
    </div>
  );
}

