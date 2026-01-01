/**
 * Scheduler Details Component
 * 
 * This component displays detailed information about a selected scheduler,
 * including its configuration, execution history, and performance metrics.
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Activity, 
  Clock, 
  Calendar,
  Users,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { IScheduler } from '@/lib/models/scheduler.model';

interface SchedulerDetailsProps {
  scheduler: IScheduler;
  onEdit: () => void;
  onDelete: (schedulerId: string) => void;
  onStart: (schedulerId: string) => void;
  onStop: (schedulerId: string) => void;
  onRun: (schedulerId: string) => void;
  isLoading: boolean;
}

export function SchedulerDetails({ 
  scheduler, 
  onEdit, 
  onDelete, 
  onStart, 
  onStop, 
  onRun, 
  isLoading 
}: SchedulerDetailsProps) {
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchExecutionHistory();
  }, [scheduler._id]);

  const fetchExecutionHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/admin/schedulers/${scheduler._id}/history`);
      if (response.ok) {
        const data = await response.json();
        setExecutionHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch execution history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const successRate = executionHistory.length > 0 
    ? (executionHistory.filter(h => h.status === 'success').length / executionHistory.length * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{scheduler.name}</span>
                <Badge className={scheduler.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                  {scheduler.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
              {scheduler.description && (
                <CardDescription>{scheduler.description}</CardDescription>
              )}
            </div>
            
            <div className="flex space-x-2">
              {scheduler.isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStop(scheduler._id?.toString() || '')}
                  disabled={isLoading}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStart(scheduler._id?.toString() || '')}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRun(scheduler._id?.toString() || '')}
                disabled={isLoading}
              >
                <Activity className="h-4 w-4 mr-2" />
                Run Now
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(scheduler._id?.toString() || '')}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last {executionHistory.length} executions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executionHistory.reduce((sum, h) => sum + (h.matchesCollected || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Collected overall
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executionHistory.length > 0 
                ? formatDuration(executionHistory.reduce((sum, h) => sum + h.duration, 0) / executionHistory.length)
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per execution
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduler.nextRun 
                ? format(scheduler.nextRun, 'MMM d, HH:mm')
                : 'Not scheduled'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {scheduler.lastRun 
                ? `Last: ${format(scheduler.lastRun, 'MMM d, HH:mm')}`
                : 'Never run'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Time Window</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.scheduleConfig.startHour}:00 - {scheduler.scheduleConfig.endHour}:00
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timezone</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.scheduleConfig.timezone}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Days of Week</p>
                <div className="flex flex-wrap gap-2">
                  {scheduler.scheduleConfig.daysOfWeek.map((day) => (
                    <Badge key={day} variant="secondary">
                      {getDayName(day)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Platform</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.collectionSettings.platform}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Match Type</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.collectionSettings.matchType}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Frequency</p>
                  <p className="text-sm text-muted-foreground">
                    Every {scheduler.collectionSettings.frequencyMinutes} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Retry Attempts</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.collectionSettings.retryAttempts} times
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Retry Delay</p>
                  <p className="text-sm text-muted-foreground">
                    {scheduler.collectionSettings.retryDelayMinutes} minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Monitored Clubs</span>
                <Badge variant="outline">{scheduler.clubs.length}</Badge>
              </CardTitle>
              <CardDescription>
                Clubs that this scheduler monitors for match data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scheduler.clubs.map((clubId) => (
                  <div key={clubId} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{clubId}</span>
                    <Badge variant="secondary">ID</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Recent execution results and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <p>Loading history...</p>
              ) : executionHistory.length === 0 ? (
                <p>No execution history available</p>
              ) : (
                <div className="space-y-3">
                  {executionHistory.map((execution, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="font-medium">
                            {format(new Date(execution.timestamp), 'MMM d, HH:mm:ss')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {execution.matchesCollected} matches • {execution.clubsProcessed} clubs • {formatDuration(execution.duration)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={execution.status === 'success' ? 'default' : 
                                   execution.status === 'error' ? 'destructive' : 'secondary'}>
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}