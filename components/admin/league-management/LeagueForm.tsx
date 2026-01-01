/**
 * League Form Component
 * 
 * This component provides a form for creating and editing leagues.
 * It includes fields for basic information and league type.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ILeague } from '@/lib/models/league.model';

interface LeagueFormProps {
  league?: ILeague;
  onSubmit: (data: Partial<ILeague>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  userId?: string; // Add userId prop
}

export function LeagueForm({ league, onSubmit, onCancel, isLoading = false, userId }: LeagueFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '6v6+1' as '3v3+1' | '6v6+1',
    isActive: true,
    createdBy: userId || '', // Use userId from props
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (league) {
      setFormData({
        name: league.name || '',
        description: league.description || '',
        type: league.type || '6v6+1',
        isActive: league.isActive !== undefined ? league.isActive : true,
        createdBy: league.createdBy || '',
      });
    } else {
      // For new leagues, use the current user ID
      setFormData({
        name: '',
        description: '',
        type: '6v6+1',
        isActive: true,
        createdBy: userId || '',
      });
    }
    setErrors({});
  }, [league, userId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'League name is required';
    }

    if (!formData.type || !['3v3+1', '6v6+1'].includes(formData.type)) {
      newErrors.type = 'League type must be either "3v3+1" or "6v6+1"';
    }

    if (!formData.createdBy && !league) {
      newErrors.createdBy = 'CreatedBy is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Configure the basic details for your league
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">League Name *</Label>
            <Input
              id="name"
              placeholder="Enter league name"
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
              placeholder="Describe the league"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">League Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: '3v3+1' | '6v6+1') => {
                setFormData({ ...formData, type: value });
                if (errors.type) setErrors({ ...errors, type: '' });
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select league type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6v6+1">6v6+1 (Standard)</SelectItem>
                <SelectItem value="3v3+1">3v3+1 (Small Format)</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Select the format for this league. +1 represents the goalie.
            </p>
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
              Enable this league to be active
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
          {isLoading ? 'Saving...' : league ? 'Update League' : 'Create League'}
        </Button>
      </div>
    </form>
  );
}
