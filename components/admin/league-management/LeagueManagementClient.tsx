/**
 * League Management Client Component
 * 
 * This component is the main orchestrator for all league-related
 * UI components. It provides the interface for admins to create,
 * edit, and manage leagues, seasons, and clubs.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trophy, Users, Calendar, Settings, Trash2 } from 'lucide-react';
import { LeagueForm } from '@/components/admin/league-management/LeagueForm';
import { LeagueList } from '@/components/admin/league-management/LeagueList';
import { LeagueDetails } from '@/components/admin/league-management/LeagueDetails';
import { ILeague } from '@/lib/models/league.model';

interface LeagueManagementClientProps {
  initialLeagues?: ILeague[];
}

export function LeagueManagementClient({ initialLeagues = [] }: LeagueManagementClientProps) {
  const [leagues, setLeagues] = useState<ILeague[]>(initialLeagues);
  const [selectedLeague, setSelectedLeague] = useState<ILeague | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>();

  // Fetch leagues and user session on component mount
  useEffect(() => {
    fetchLeagues();
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user?.id);
      }
    } catch (err) {
      console.error('Failed to fetch user ID:', err);
    }
  };

  const fetchLeagues = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/leagues');
      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }
      
      const data = await response.json();
      setLeagues(data.leagues || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLeague = async (leagueData: Partial<ILeague>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leagueData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create league');
      }
      
      const newLeague = await response.json();
      setLeagues(prev => [...prev, newLeague]);
      setIsCreateDialogOpen(false);
      setSelectedLeague(newLeague);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLeague = async (leagueId: string, updateData: Partial<ILeague>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update league');
      }

      const updatedLeague = await response.json();
      setLeagues(prev => prev.map(l => String(l._id) === String(leagueId) ? updatedLeague : l));
      setSelectedLeague(updatedLeague);
      setIsEditDialogOpen(false);

    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLeague = async (leagueId: string) => {
    if (!confirm('Are you sure you want to delete this league? This will also delete all associated seasons.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete league');
      }
      
      setLeagues(prev => prev.filter(l => String(l._id) !== String(leagueId)));
      if (selectedLeague?._id?.toString() === String(leagueId)) {
        setSelectedLeague(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLeague = (league: ILeague) => {
    setSelectedLeague(league);
  };

  const handleEditLeague = (league: ILeague) => {
    setSelectedLeague(league);
    setIsEditDialogOpen(true);
  };

  const activeLeagues = leagues.filter(l => l.isActive);
  const inactiveLeagues = leagues.filter(l => !l.isActive);
  const totalSeasons = leagues.reduce((sum, league) => sum + (league.seasons?.length || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">League Management</h1>
          <p className="text-muted-foreground">
            Manage leagues, seasons, and clubs for the xblade platform
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create League
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New League</DialogTitle>
              <DialogDescription>
                Create a new league to organize seasons and clubs
              </DialogDescription>
            </DialogHeader>
            <LeagueForm
              onSubmit={handleCreateLeague}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={isLoading}
              userId={userId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leagues.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeLeagues.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeLeagues.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeasons}</div>
            <p className="text-xs text-muted-foreground">
              Across all leagues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveLeagues.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* League List */}
        <Card>
          <CardHeader>
            <CardTitle>Leagues</CardTitle>
            <CardDescription>
              Select a league to view details and manage seasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeagueList
              leagues={leagues}
              selectedLeague={selectedLeague}
              onSelectLeague={handleSelectLeague}
              onEditLeague={handleEditLeague}
              onDeleteLeague={handleDeleteLeague}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* League Details */}
        <Card>
          <CardHeader>
            <CardTitle>League Details</CardTitle>
            <CardDescription>
              {selectedLeague ? 'View and manage league details' : 'Select a league to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLeague ? (
              <LeagueDetails
                league={selectedLeague}
                onEdit={() => handleEditLeague(selectedLeague)}
                onDelete={handleDeleteLeague}
                onRefresh={fetchLeagues}
                isLoading={isLoading}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a league to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit League</DialogTitle>
            <DialogDescription>
              Update league information
            </DialogDescription>
          </DialogHeader>
          {selectedLeague && (
            <LeagueForm
              league={selectedLeague}
              onSubmit={(data) => handleUpdateLeague(selectedLeague._id!.toString(), data)}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
