/**
 * League Details Component
 * 
 * This component displays detailed information about a selected league,
 * including its configuration, seasons, and clubs.
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, 
  Trash2, 
  Trophy,
  Calendar,
  Users,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { ILeague, ISeason } from '@/lib/models/league.model';
import { SeasonForm } from '@/components/admin/league-management/SeasonForm';

interface LeagueDetailsProps {
  league: ILeague;
  onEdit: () => void;
  onDelete: (leagueId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

// Helper function to safely parse and format dates
const safeFormatDate = (date: string | Date | undefined, formatStr: string = 'PPp'): string => {
  if (!date) return 'Unknown';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'Invalid date';
  }
};

export function LeagueDetails({ 
  league, 
  onEdit, 
  onDelete, 
  onRefresh,
  isLoading 
}: LeagueDetailsProps) {
  const [seasons, setSeasons] = useState<ISeason[]>(league.seasons || []);
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<ISeason | null>(null);
  const [isAddingSeason, setIsAddingSeason] = useState(false);

  useEffect(() => {
    setSeasons(league.seasons || []);
  }, [league]);

  const fetchSeasons = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${league._id}/seasons`);
      if (response.ok) {
        const data = await response.json();
        setSeasons(data || []);
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
    }
  };

  const handleAddSeason = async (seasonData: any) => {
    setIsAddingSeason(true);
    try {
      const response = await fetch(`/api/admin/leagues/${league._id}/seasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seasonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add season');
      }

      await fetchSeasons();
      setIsSeasonDialogOpen(false);
    } catch (error) {
      console.error('Failed to add season:', error);
      alert(error instanceof Error ? error.message : 'Failed to add season');
    } finally {
      setIsAddingSeason(false);
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    if (!confirm('Are you sure you want to delete this season? This will also remove all clubs from the season.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/leagues/${league._id}/seasons/${seasonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete season');
      }

      await fetchSeasons();
    } catch (error) {
      console.error('Failed to delete season:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete season');
    }
  };

  const handleAddClubToSeason = async (seasonId: string, clubId: string) => {
    try {
      const response = await fetch(`/api/admin/leagues/${league._id}/seasons/${seasonId}/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clubId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add club to season');
      }

      await fetchSeasons();
    } catch (error) {
      console.error('Failed to add club to season:', error);
      alert(error instanceof Error ? error.message : 'Failed to add club to season');
    }
  };

  const handleRemoveClubFromSeason = async (seasonId: string, clubId: string) => {
    try {
      const response = await fetch(`/api/admin/leagues/${league._id}/seasons/${seasonId}/clubs/${clubId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove club from season');
      }

      await fetchSeasons();
    } catch (error) {
      console.error('Failed to remove club from season:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove club from season');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>{league.name}</span>
                <Badge className={league.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                  {league.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{league.type}</Badge>
              </CardTitle>
              {league.description && (
                <CardDescription className="mt-2">{league.description}</CardDescription>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(league._id!.toString())}
                disabled={isLoading}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {safeFormatDate(league.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {safeFormatDate(league.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seasons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seasons</CardTitle>
              <CardDescription>
                Manage seasons within this league
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setSelectedSeason(null);
                setIsSeasonDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Season
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {seasons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No seasons yet</p>
              <p className="text-sm">Add a season to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {seasons.map((season) => (
                <Card key={season._id?.toString()} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{season.name}</CardTitle>
                        {season.description && (
                          <CardDescription className="mt-1">{season.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={season.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                          {season.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteSeason(season._id!.toString())}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {safeFormatDate(season.startDate, 'PP')}
                          {season.endDate && ` - ${safeFormatDate(season.endDate, 'PP')}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{season.clubs?.length || 0} clubs</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Season Dialog */}
      <Dialog open={isSeasonDialogOpen} onOpenChange={setIsSeasonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Season</DialogTitle>
            <DialogDescription>
              Create a new season for this league
            </DialogDescription>
          </DialogHeader>
          <SeasonForm
            onSubmit={handleAddSeason}
            onCancel={() => setIsSeasonDialogOpen(false)}
            isLoading={isAddingSeason}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

