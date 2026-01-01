/**
 * Season Form Component
 * 
 * This component provides a form for creating and editing seasons.
 * It includes fields for season name, dates, description, and active status.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ISeason } from '@/lib/models/league.model';

interface SeasonFormProps {
  season?: ISeason;
  onSubmit: (data: Partial<ISeason>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SeasonForm({ season, onSubmit, onCancel, isLoading = false }: SeasonFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (season) {
      setFormData({
        name: season.name || '',
        description: season.description || '',
        startDate: season.startDate 
          ? new Date(season.startDate).toISOString().split('T')[0]
          : '',
        endDate: season.endDate 
          ? new Date(season.endDate).toISOString().split('T')[0]
          : '',
        isActive: season.isActive !== undefined ? season.isActive : true,
      });
    } else {
      // Default to today's date for start date
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        description: '',
        startDate: today,
        endDate: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [season]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Season name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        newErrors.startDate = 'Invalid start date';
      }
    }

    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      const startDate = new Date(formData.startDate);
      
      if (isNaN(endDate.getTime())) {
        newErrors.endDate = 'Invalid end date';
      } else if (endDate < startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData: Partial<ISeason> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      isActive: formData.isActive,
      clubs: season?.clubs || [],
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Season Information</CardTitle>
          <CardDescription>
            Configure the details for this season
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Season Name *</Label>
            <Input
              id="name"
              placeholder="Enter season name (e.g., Spring 2024)"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the season"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  if (errors.startDate) setErrors({ ...errors, startDate: '' });
                }}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  if (errors.endDate) setErrors({ ...errors, endDate: '' });
                }}
                disabled={isLoading}
                min={formData.startDate || undefined}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Optional - leave blank for ongoing season
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, isActive: checked as boolean });
              }}
              disabled={isLoading}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable this season to be active
            </p>
          </div>
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
          {isLoading ? 'Saving...' : season ? 'Update Season' : 'Create Season'}
        </Button>
      </div>
    </form>
  );
}

