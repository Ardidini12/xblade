/**
 * Scheduler Server Actions
 * 
 * These server actions handle CRUD operations for scheduler data.
 * They provide the server-side functions that components can call
 * to interact with the database, following Next.js best practices
 * for data mutations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import Scheduler, { IScheduler, IExecutionHistory } from '@/lib/models/scheduler.model';
import Club from '@/lib/models/club.model';
import { importMatchesFromEA } from '@/lib/actions/match.actions';

/**
 * Creates a new scheduler in the database
 * @param schedulerData - The scheduler data to create
 * @returns The created scheduler or null if error
 */
export async function createScheduler(schedulerData: Partial<IScheduler>) {
  try {
    await connectToDatabase();
    
    // Calculate next run time based on schedule
    const nextRun = calculateNextRun(schedulerData.scheduleConfig!);
    
    const newScheduler = new Scheduler({
      ...schedulerData,
      nextRun
    });
    await newScheduler.save();
    
    // Revalidate the schedulers page to show the new scheduler
    revalidatePath('/admin/schedulers');
    
    return JSON.parse(JSON.stringify(newScheduler));
  } catch (error) {
    console.error('Error creating scheduler:', error);
    return null;
  }
}

/**
 * Gets a scheduler by its ID
 * @param schedulerId - The ID of the scheduler to retrieve
 * @returns The scheduler or null if not found
 */
export async function getSchedulerById(schedulerId: string) {
  try {
    await connectToDatabase();
    
    const scheduler = await Scheduler.findById(schedulerId);
    
    if (!scheduler) return null;
    
    return JSON.parse(JSON.stringify(scheduler));
  } catch (error) {
    console.error('Error fetching scheduler:', error);
    return null;
  }
}

/**
 * Gets schedulers with optional filtering and pagination
 * @param page - The page number (default: 1)
 * @param limit - The number of schedulers per page (default: 10)
 * @param search - Optional search term for scheduler names
 * @param createdBy - Optional admin user ID to filter schedulers
 * @param isActive - Optional filter for active schedulers
 * @returns Object with schedulers array and pagination info
 */
export async function getSchedulers(
  page = 1, 
  limit = 10, 
  search = '', 
  createdBy = '', 
  isActive = true
) {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (createdBy) {
      query.createdBy = createdBy;
    }
    
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    
    // Get total count for pagination
    const total = await Scheduler.countDocuments(query);
    
    // Get schedulers with pagination
    const schedulers = await Scheduler.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      schedulers: JSON.parse(JSON.stringify(schedulers)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching schedulers:', error);
    return {
      schedulers: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };
  }
}

/**
 * Updates a scheduler in the database
 * @param schedulerId - The ID of the scheduler to update
 * @param updateData - The data to update
 * @returns The updated scheduler or null if error
 */
export async function updateScheduler(schedulerId: string, updateData: Partial<IScheduler>) {
  try {
    await connectToDatabase();
    
    // If schedule config is updated, recalculate next run time
    if (updateData.scheduleConfig) {
      updateData.nextRun = calculateNextRun(updateData.scheduleConfig);
    }
    
    const updatedScheduler = await Scheduler.findByIdAndUpdate(
      schedulerId,
      updateData,
      { new: true }
    );
    
    if (!updatedScheduler) return null;
    
    // Revalidate the schedulers page to show the updated scheduler
    revalidatePath('/admin/schedulers');
    revalidatePath(`/admin/schedulers/${schedulerId}`);
    
    return JSON.parse(JSON.stringify(updatedScheduler));
  } catch (error) {
    console.error('Error updating scheduler:', error);
    return null;
  }
}

/**
 * Deletes a scheduler from the database
 * @param schedulerId - The ID of the scheduler to delete
 * @returns True if successful, false otherwise
 */
export async function deleteScheduler(schedulerId: string) {
  try {
    await connectToDatabase();
    
    const result = await Scheduler.findByIdAndDelete(schedulerId);
    
    if (!result) return false;
    
    // Revalidate the schedulers page to reflect the deletion
    revalidatePath('/admin/schedulers');
    
    return true;
  } catch (error) {
    console.error('Error deleting scheduler:', error);
    return false;
  }
}

/**
 * Starts a scheduler
 * @param schedulerId - The ID of the scheduler to start
 * @returns The updated scheduler or null if error
 */
export async function startScheduler(schedulerId: string) {
  try {
    await connectToDatabase();
    
    const scheduler = await Scheduler.findByIdAndUpdate(
      schedulerId,
      { 
        isActive: true,
        nextRun: calculateNextRun() // Calculate next run time for now
      },
      { new: true }
    );
    
    if (!scheduler) return null;
    
    // Revalidate paths
    revalidatePath('/admin/schedulers');
    revalidatePath(`/admin/schedulers/${schedulerId}`);
    
    return JSON.parse(JSON.stringify(scheduler));
  } catch (error) {
    console.error('Error starting scheduler:', error);
    return null;
  }
}

/**
 * Stops a scheduler
 * @param schedulerId - The ID of the scheduler to stop
 * @returns The updated scheduler or null if error
 */
export async function stopScheduler(schedulerId: string) {
  try {
    await connectToDatabase();
    
    const scheduler = await Scheduler.findByIdAndUpdate(
      schedulerId,
      { 
        isActive: false,
        nextRun: undefined
      },
      { new: true }
    );
    
    if (!scheduler) return null;
    
    // Revalidate paths
    revalidatePath('/admin/schedulers');
    revalidatePath(`/admin/schedulers/${schedulerId}`);
    
    return JSON.parse(JSON.stringify(scheduler));
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    return null;
  }
}

/**
 * Manually runs a scheduler
 * @param schedulerId - The ID of the scheduler to run
 * @returns Execution result or null if error
 */
export async function runSchedulerManually(schedulerId: string) {
  try {
    await connectToDatabase();
    
    const scheduler = await Scheduler.findById(schedulerId);
    if (!scheduler || !scheduler.isActive) return null;
    
    const startTime = Date.now();
    let matchesCollected = 0;
    let clubsProcessed = 0;
    let status: 'success' | 'error' | 'partial' = 'success';
    let errorMessage: string | undefined;
    
    try {
      // Process each club in the scheduler
      for (const clubId of scheduler.clubs) {
        // Verify club exists
        const club = await Club.findOne({ clubId });
        if (!club) continue;
        
        clubsProcessed++;
        
        // Import matches for this club
        const matches = await importMatchesFromEA(
          clubId,
          scheduler.collectionSettings.platform,
          scheduler.collectionSettings.matchType
        );
        
        if (matches) {
          matchesCollected += matches.length;
        }
      }
      
      // Update scheduler with execution details
      await Scheduler.findByIdAndUpdate(schedulerId, {
        lastRun: new Date(),
        nextRun: calculateNextRun(scheduler.scheduleConfig),
        $push: {
          executionHistory: {
            timestamp: new Date(),
            status,
            matchesCollected,
            clubsProcessed,
            error: errorMessage,
            duration: Date.now() - startTime
          }
        }
      });
      
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update scheduler with error
      await Scheduler.findByIdAndUpdate(schedulerId, {
        lastRun: new Date(),
        $push: {
          executionHistory: {
            timestamp: new Date(),
            status,
            matchesCollected,
            clubsProcessed,
            error: errorMessage,
            duration: Date.now() - startTime
          }
        }
      });
    }
    
    // Revalidate paths
    revalidatePath('/admin/schedulers');
    revalidatePath(`/admin/schedulers/${schedulerId}`);
    
    return {
      status,
      matchesCollected,
      clubsProcessed,
      duration: Date.now() - startTime,
      error: errorMessage
    };
  } catch (error) {
    console.error('Error running scheduler manually:', error);
    return null;
  }
}

/**
 * Gets schedulers that need to run
 * @returns Array of schedulers that are due to run
 */
export async function getSchedulersToRun() {
  try {
    await connectToDatabase();
    
    const now = new Date();
    
    const schedulers = await Scheduler.find({
      isActive: true,
      nextRun: { $lte: now }
    });
    
    return JSON.parse(JSON.stringify(schedulers));
  } catch (error) {
    console.error('Error fetching schedulers to run:', error);
    return [];
  }
}

/**
 * Updates scheduler execution history
 * @param schedulerId - The ID of the scheduler
 * @param executionData - The execution data to add
 * @returns True if successful, false otherwise
 */
export async function updateSchedulerExecution(
  schedulerId: string, 
  executionData: {
    status: 'success' | 'error' | 'partial';
    matchesCollected: number;
    clubsProcessed: number;
    error?: string;
    duration: number;
  }
) {
  try {
    await connectToDatabase();
    
    // Update scheduler with execution details
    await Scheduler.findByIdAndUpdate(schedulerId, {
      lastRun: new Date(),
      nextRun: calculateNextRun(),
      $push: {
        executionHistory: {
          timestamp: new Date(),
          ...executionData
        }
      }
    });
    
    // Revalidate paths
    revalidatePath('/admin/schedulers');
    revalidatePath(`/admin/schedulers/${schedulerId}`);
    
    return true;
  } catch (error) {
    console.error('Error updating scheduler execution:', error);
    return false;
  }
}

/**
 * Gets execution history for a scheduler
 * @param schedulerId - The ID of the scheduler
 * @param limit - Number of history entries to return (default: 50)
 * @returns Array of execution history entries
 */
export async function getSchedulerExecutionHistory(schedulerId: string, limit = 50) {
  try {
    await connectToDatabase();
    
    const scheduler = await Scheduler.findById(schedulerId)
      .select('executionHistory')
      .lean();
    
    if (!scheduler || !scheduler.executionHistory) return [];
    
    // Return the most recent entries
    return scheduler.executionHistory
    .sort((a: IExecutionHistory, b: IExecutionHistory) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching scheduler execution history:', error);
    return [];
  }
}

/**
 * Helper function to calculate next run time based on schedule
 * @param scheduleConfig - Schedule configuration
 * @returns Next run date
 */
function calculateNextRun(scheduleConfig?: any): Date {
  const now = new Date();
  const nextRun = new Date(now);
  
  if (!scheduleConfig) {
    // Default to next hour if no schedule config
    nextRun.setHours(nextRun.getHours() + 1);
    nextRun.setMinutes(0);
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    return nextRun;
  }
  
  // Simple implementation - in production, you'd want more sophisticated scheduling
  // This just sets the next run to the next occurrence of the configured time
  const { startHour, endHour, daysOfWeek } = scheduleConfig;
  
  // Find the next valid day and time
  let daysToAdd = 0;
  let found = false;
  
  while (!found && daysToAdd < 7) {
    const testDate = new Date(now);
    testDate.setDate(testDate.getDate() + daysToAdd);
    testDate.setHours(startHour, 0, 0, 0);
    
    if (daysOfWeek.includes(testDate.getDay()) && testDate > now) {
      nextRun.setTime(testDate.getTime());
      found = true;
    } else {
      daysToAdd++;
    }
  }
  
  // If no valid time found in the next week, set to next week's first valid day
  if (!found) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(startHour, 0, 0, 0);
    nextRun.setTime(nextWeek.getTime());
  }
  
  return nextRun;
}