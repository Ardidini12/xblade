/**
 * League List Component
 * 
 * This component displays a list of leagues with their current status
 * and provides actions to edit and delete them.
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Trash2, 
  Trophy,
  Calendar,
  Users,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ILeague } from '@/lib/models/league.model';

interface LeagueListProps {
  leagues: ILeague[];
  selectedLeague: ILeague | null;
  onSelectLeague: (league: ILeague) => void;
  onEditLeague: (league: ILeague) => void;
  onDeleteLeague: (leagueId: string) => void;
  isLoading: boolean;
}

export function LeagueList({
  leagues,
  selectedLeague,
  onSelectLeague,
  onEditLeague,
  onDeleteLeague,
  isLoading
}: LeagueListProps) {
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">
        {type === '3v3+1' ? '3v3+1' : '6v6+1'}
      </Badge>
    );
  };

  const getCreatedDisplay = (createdAt?: Date) => {
    if (!createdAt) return 'Unknown';
    
    try {
      const date = new Date(createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (leagues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No leagues found</p>
        <p className="text-sm">Create a new league to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leagues.map((league) => {
        const isSelected = selectedLeague?._id === league._id;
        const seasonCount = league.seasons?.length || 0;
        
        return (
          <div
            key={league._id?.toString()}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all
              ${isSelected 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }
            `}
            onClick={() => onSelectLeague(league)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-semibold text-lg truncate">
                    {league.name}
                  </h3>
                  {getStatusBadge(league.isActive)}
                  {getTypeBadge(league.type)}
                </div>
                
                {league.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {league.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{seasonCount} {seasonCount === 1 ? 'season' : 'seasons'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {league.seasons?.reduce((sum, season) => sum + (season.clubs?.length || 0), 0) || 0} clubs
                    </span>
                  </div>
                  <span>Created {getCreatedDisplay(league.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLeague(league);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLeague(league._id!.toString());
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {isSelected && (
                  <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {isLoading && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

