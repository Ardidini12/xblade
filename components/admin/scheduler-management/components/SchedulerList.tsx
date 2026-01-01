/**
 * Scheduler List Component
 * 
 * This component displays a list of schedulers with their current status
 * and provides actions to start, stop, edit, delete, and run them manually.
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Activity, 
  Clock, 
  Calendar,
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
import { IScheduler } from '@/lib/models/scheduler.model';

interface SchedulerListProps {
  schedulers: IScheduler[];
  selectedScheduler: IScheduler | null;
  onSelectScheduler: (scheduler: IScheduler) => void;
  onEditScheduler: (scheduler: IScheduler) => void;
  onDeleteScheduler: (schedulerId: string) => void;
  onStartScheduler: (schedulerId: string) => void;
  onStopScheduler: (schedulerId: string) => void;
  onRunScheduler: (schedulerId: string) => void;
  isLoading: boolean;
}

export function SchedulerList({
  schedulers,
  selectedScheduler,
  onSelectScheduler,
  onEditScheduler,
  onDeleteScheduler,
  onStartScheduler,
  onStopScheduler,
  onRunScheduler,
  isLoading
}: SchedulerListProps) {
  const getStatusBadge = (isActive: boolean, lastRun?: Date) => {
    if (isActive) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getNextRunDisplay = (nextRun?: Date) => {
    if (!nextRun) return 'Not scheduled';
    
    const now = new Date();
    if (nextRun < now) return 'Overdue';
    
    return formatDistanceToNow(nextRun, { addSuffix: true });
  };

  const getLastRunDisplay = (lastRun?: Date) => {
    if (!lastRun) return 'Never';
    
    return formatDistanceToNow(lastRun, { addSuffix: true });
  };

  const getExecutionStatus = (scheduler: IScheduler) => {
    if (!scheduler.executionHistory || scheduler.executionHistory.length === 0) {
      return { status: 'info', message: 'No execution history' };
    }

    const lastExecution = scheduler.executionHistory[0];
    
    switch (lastExecution.status) {
      case 'success':
        return { 
          status: 'success', 
          message: `Last run: ${lastExecution.matchesCollected} matches collected` 
        };
      case 'error':
        return { 
          status: 'error', 
          message: `Last run failed: ${lastExecution.error || 'Unknown error'}` 
        };
      case 'partial':
        return { 
          status: 'warning', 
          message: `Partial success: ${lastExecution.matchesCollected} matches collected` 
        };
      default:
        return { status: 'info', message: 'Unknown status' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Schedulers</h2>
        <Badge variant="outline">{schedulers.length} total</Badge>
      </div>

      {schedulers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">No schedulers configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {schedulers.map((scheduler) => {
            const executionStatus = getExecutionStatus(scheduler);
            const isSelected = selectedScheduler?._id?.toString() === scheduler._id?.toString();
            
            return (
              <Card 
                key={scheduler._id?.toString() || ''} 
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => onSelectScheduler(scheduler)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{scheduler.name}</CardTitle>
                      {getStatusBadge(scheduler.isActive)}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {scheduler.isActive ? (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onStopScheduler(scheduler._id?.toString() || '');
                            }}
                            disabled={isLoading}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Stop
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartScheduler(scheduler._id?.toString() || '');
                            }}
                            disabled={isLoading}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onRunScheduler(scheduler._id?.toString() || '');
                          }}
                          disabled={isLoading}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Run Now
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditScheduler(scheduler);
                          }}
                          disabled={isLoading}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteScheduler(scheduler._id?.toString() || '');
                          }}
                          disabled={isLoading}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {scheduler.description && (
                    <CardDescription className="text-sm">
                      {scheduler.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next run:</span>
                      <span>{getNextRunDisplay(scheduler.nextRun)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last run:</span>
                      <span>{getLastRunDisplay(scheduler.lastRun)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge 
                      variant={executionStatus.status === 'success' ? 'default' : 
                                executionStatus.status === 'error' ? 'destructive' : 
                                executionStatus.status === 'warning' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {executionStatus.message}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}