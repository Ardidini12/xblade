/**
 * Scheduler Form Component
 * 
 * This component provides a form for creating and editing schedulers.
 * It includes fields for basic information, schedule configuration,
 * collection settings, and club selection.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm, type FieldValues, type ControllerRenderProps } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IScheduler } from '@/lib/models/scheduler.model';
import { getClubs } from '@/lib/actions/club.actions';

// Form data type
type SchedulerFormData = {
  name: string;
  description?: string;
  scheduleConfig: {
    startHour: number;
    endHour: number;
    daysOfWeek: number[];
    timezone: string;
  };
  collectionSettings: {
    platform: string;
    matchType: string;
    frequencyMinutes: number;
    retryAttempts: number;
    retryDelayMinutes: number;
  };
  clubs: string[];
  isActive: boolean;
};

interface SchedulerFormProps {
  scheduler?: IScheduler;
  onSubmit: (data: SchedulerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const platforms = [
  { value: 'common-gen5', label: 'Current Gen (PS5/Xbox Series X)' },
  { value: 'common-gen4', label: 'Last Gen (PS4/Xbox One)' },
];

const matchTypes = [
  { value: 'club_private', label: 'Club Private' },
  { value: 'club_public', label: 'Club Public' },
];

const timezones = [
  { value: 'EST', label: 'Eastern Time (EST)' },
  { value: 'CST', label: 'Central Time (CST)' },
  { value: 'MST', label: 'Mountain Time (MST)' },
  { value: 'PST', label: 'Pacific Time (PST)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export function SchedulerForm({ scheduler, onSubmit, onCancel, isLoading = false }: SchedulerFormProps) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>(scheduler?.clubs || []);
  const [loadingClubs, setLoadingClubs] = useState(false);

  const form = useForm<SchedulerFormData>({
    defaultValues: scheduler ? {
      name: scheduler.name,
      description: scheduler.description || '',
      scheduleConfig: {
        startHour: scheduler.scheduleConfig.startHour,
        endHour: scheduler.scheduleConfig.endHour,
        daysOfWeek: scheduler.scheduleConfig.daysOfWeek,
        timezone: scheduler.scheduleConfig.timezone,
      },
      collectionSettings: {
        platform: scheduler.collectionSettings.platform,
        matchType: scheduler.collectionSettings.matchType,
        frequencyMinutes: scheduler.collectionSettings.frequencyMinutes,
        retryAttempts: scheduler.collectionSettings.retryAttempts,
        retryDelayMinutes: scheduler.collectionSettings.retryDelayMinutes,
      },
      clubs: selectedClubs,
      isActive: scheduler.isActive,
    } : {
      name: '',
      description: '',
      scheduleConfig: {
        startHour: 20, // 8 PM
        endHour: 23, // 11 PM
        daysOfWeek: [2, 3], // Tuesday and Wednesday
        timezone: 'EST',
      },
      collectionSettings: {
        platform: 'common-gen5',
        matchType: 'club_private',
        frequencyMinutes: 30,
        retryAttempts: 3,
        retryDelayMinutes: 5,
      },
      clubs: [],
      isActive: true,
    },
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoadingClubs(true);
    try {
      const response = await getClubs(1, 100); // Get up to 100 clubs
      setClubs(response.clubs || []);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleClubToggle = (clubId: string) => {
    setSelectedClubs(prev => {
      const newSelection = prev.includes(clubId)
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId];
      
      // Update form value
      form.setValue('clubs', newSelection);
      
      return newSelection;
    });
  };

  const handleSubmit = (data: SchedulerFormData) => {
    onSubmit({
      ...data,
      clubs: selectedClubs,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic details for your scheduler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduler Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter scheduler name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this scheduler does" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable this scheduler to run automatically
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Schedule Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Configuration</CardTitle>
            <CardDescription>
              Set when this scheduler should run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduleConfig.startHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Hour</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start hour" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduleConfig.endHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Hour</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end hour" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scheduleConfig.timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduleConfig.daysOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days of Week</FormLabel>
                  <FormDescription>
                    Select the days when this scheduler should run
                  </FormDescription>
                  <div className="grid grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="scheduleConfig.daysOfWeek"
                        render={() => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(day.value)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    field.onChange([...field.value, day.value]);
                                  } else {
                                    field.onChange(field.value.filter((value: number) => value !== day.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Collection Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Settings</CardTitle>
            <CardDescription>
              Configure how data is collected from EA's API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="collectionSettings.platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collectionSettings.matchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select match type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {matchTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="collectionSettings.frequencyMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="5"
                        placeholder="30" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      How often to run during active hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collectionSettings.retryAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retry Attempts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="3" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collectionSettings.retryDelayMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retry Delay (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="5" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Club Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Club Selection</CardTitle>
            <CardDescription>
              Select the clubs to monitor for data collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClubs ? (
              <p>Loading clubs...</p>
            ) : clubs.length === 0 ? (
              <p>No clubs available. Please import clubs first.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedClubs.length} clubs
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClubs(clubs.map(c => c.clubId));
                      form.setValue('clubs', clubs.map(c => c.clubId));
                    }}
                  >
                    Select All
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                  {clubs.map((club) => (
                    <div
                      key={club.clubId}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedClubs.includes(club.clubId)}
                          onCheckedChange={() => handleClubToggle(club.clubId)}
                        />
                        <div>
                          <p className="font-medium">{club.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {club.clubId} • Platform: {club.platform}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{club.currentDivision}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : scheduler ? 'Update Scheduler' : 'Create Scheduler'}
          </Button>
        </div>
      </form>
    </Form>
  );
}