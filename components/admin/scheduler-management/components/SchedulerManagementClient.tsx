/**
 * Scheduler Management Client Component
 * 
 * This component is the main orchestrator for all scheduler-related
 * UI components. It provides the interface for admins to create,
 * edit, start, stop, and monitor data collection schedulers.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Pause, Settings, Trash2, Activity, Clock, Calendar } from 'lucide-react';
import { SchedulerForm } from '@/components/admin/scheduler-management/components/SchedulerForm';
import { SchedulerList } from '@/components/admin/scheduler-management/components/SchedulerList';
import { SchedulerDetails } from '@/components/admin/scheduler-management/components/SchedulerDetails';
import { IScheduler } from '@/lib/models/scheduler.model';

interface SchedulerManagementClientProps {
  initialSchedulers?: IScheduler[];
}

export function SchedulerManagementClient({ initialSchedulers = [] }: SchedulerManagementClientProps) {
  const [schedulers, setSchedulers] = useState<IScheduler[]>(initialSchedulers);
  const [selectedScheduler, setSelectedScheduler] = useState<IScheduler | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedulers on component mount
  useEffect(() => {
    fetchSchedulers();
  }, []);

  const fetchSchedulers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/schedulers');
      if (!response.ok) {
        throw new Error('Failed to fetch schedulers');
      }
      
      const data = await response.json();
      setSchedulers(data.schedulers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScheduler = async (schedulerData: Partial<IScheduler>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/schedulers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedulerData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create scheduler');
      }
      
      const newScheduler = await response.json();
      setSchedulers(prev => [...prev, newScheduler]);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScheduler = async (schedulerId: string, updateData: Partial<IScheduler>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/schedulers/${schedulerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update scheduler');
      }
      
      const updatedScheduler = await response.json();
      setSchedulers(prev => 
        prev.map(s => (s._id?.toString() || '') === schedulerId ? updatedScheduler : s)
      );
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScheduler = async (schedulerId: string) => {
    if (!confirm('Are you sure you want to delete this scheduler?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/schedulers/${schedulerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete scheduler');
      }
      
      setSchedulers(prev => prev.filter(s => (s._id?.toString() || '') !== schedulerId));
      if (selectedScheduler?._id?.toString() === schedulerId) {
        setSelectedScheduler(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScheduler = async (schedulerId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/schedulers/${schedulerId}/start`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start scheduler');
      }
      
      const updatedScheduler = await response.json();
      setSchedulers(prev => 
        prev.map(s => (s._id?.toString() || '') === schedulerId ? updatedScheduler : s)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopScheduler = async (schedulerId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/schedulers/${schedulerId}/stop`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop scheduler');
      }
      
      const updatedScheduler = await response.json();
      setSchedulers(prev => 
        prev.map(s => (s._id?.toString() || '') === schedulerId ? updatedScheduler : s)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSchedulerManually = async (schedulerId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/schedulers/${schedulerId}/run`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to run scheduler');
      }
      
      const result = await response.json();
      alert(`Scheduler executed successfully:\nMatches collected: ${result.matchesCollected}\nClubs processed: ${result.clubsProcessed}`);
      
      // Refresh schedulers to get updated execution history
      await fetchSchedulers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const activeSchedulers = schedulers.filter(s => s.isActive);
  const inactiveSchedulers = schedulers.filter(s => !s.isActive);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduler Management</h1>
          <p className="text-muted-foreground">
            Manage data collection schedulers for EA NHL Pro Clubs API
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Scheduler
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Scheduler</DialogTitle>
              <DialogDescription>
                Configure a new scheduler to automatically collect match data
              </DialogDescription>
            </DialogHeader>
            <SchedulerForm
              onSubmit={handleCreateScheduler}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={isLoading}
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
            <CardTitle className="text-sm font-medium">Total Schedulers</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSchedulers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveSchedulers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedulers.length > 0 ? 
                new Date(Math.max(...schedulers.map(s => new Date(s.lastRun || 0).getTime()))).toLocaleDateString() : 
                'Never'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler List */}
        <div className="lg:col-span-1">
          <SchedulerList
            schedulers={schedulers}
            selectedScheduler={selectedScheduler}
            onSelectScheduler={setSelectedScheduler}
            onEditScheduler={(scheduler) => {
              setSelectedScheduler(scheduler);
              setIsEditDialogOpen(true);
            }}
            onDeleteScheduler={handleDeleteScheduler}
            onStartScheduler={handleStartScheduler}
            onStopScheduler={handleStopScheduler}
            onRunScheduler={handleRunSchedulerManually}
            isLoading={isLoading}
          />
        </div>

        {/* Scheduler Details */}
        <div className="lg:col-span-2">
          {selectedScheduler ? (
            <SchedulerDetails
              scheduler={selectedScheduler}
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={handleDeleteScheduler}
              onStart={handleStartScheduler}
              onStop={handleStopScheduler}
              onRun={handleRunSchedulerManually}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Scheduler</CardTitle>
                <CardDescription>
                  Choose a scheduler from the list to view its details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No scheduler selected
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Scheduler</DialogTitle>
            <DialogDescription>
              Update the scheduler configuration
            </DialogDescription>
          </DialogHeader>
          {selectedScheduler && (
            <SchedulerForm
              scheduler={selectedScheduler}
              onSubmit={(data) => handleUpdateScheduler(selectedScheduler._id?.toString() || '', data)}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}