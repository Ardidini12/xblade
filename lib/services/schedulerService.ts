/**
 * Scheduler Service
 * 
 * This service manages the execution of schedulers using Bull queues.
 * It handles the automated data collection process, ensuring schedulers
 * run at their configured times without interfering with each other.
 * 
 * This service integrates with Redis for queue management and provides
 * job processing, error handling, and execution tracking.
 */

import Queue from 'bull';
import { redisConfig } from '@/lib/config/redis'; // Import the Redis configuration
import { connectToDatabase } from '@/database/mongoose';
import Scheduler, { IScheduler } from '@/lib/models/scheduler.model';
import { updateSchedulerExecution, getSchedulersToRun } from '@/lib/actions/scheduler.actions';
import { importMatchesFromEA } from '@/lib/actions/match.actions';
import Club from '@/lib/models/club.model';

// Create a new queue for scheduler jobs
const schedulerQueue = new Queue('scheduler processing', {
  redis: redisConfig, // Use the imported Redis configuration
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 20, // Keep last 20 failed jobs
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000 // Initial delay of 2 seconds
    }
  }
});



/**
 * Initializes the scheduler service
 * Sets up job processors and event handlers
 */
export function initializeSchedulerService() {
  // Process scheduler jobs
  schedulerQueue.process('run-scheduler', async (job) => {
    const { schedulerId } = job.data;
    
    try {
      await connectToDatabase();
      
      // Get the scheduler
      const scheduler = await Scheduler.findById(schedulerId);
      if (!scheduler || !scheduler.isActive) {
        throw new Error(`Scheduler ${schedulerId} not found or inactive`);
      }
      
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
          if (!club) {
            console.warn(`Club ${clubId} not found, skipping`);
            continue;
          }
          
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
        await updateSchedulerExecution(schedulerId, {
          status,
          matchesCollected,
          clubsProcessed,
          error: errorMessage,
          duration: Date.now() - startTime
        });
        
        // Calculate next run time
        const nextRun = calculateNextRun(scheduler.scheduleConfig);
        
        // Update scheduler with next run time
        await Scheduler.findByIdAndUpdate(schedulerId, {
          lastRun: new Date(),
          nextRun
        });
        
        // Schedule next run if active
        if (scheduler.isActive) {
          await scheduleNextRun(schedulerId, nextRun);
        }
        
        return {
          status,
          matchesCollected,
          clubsProcessed,
          duration: Date.now() - startTime
        };
        
      } catch (error) {
        status = 'error';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update scheduler with error
        await updateSchedulerExecution(schedulerId, {
          status,
          matchesCollected,
          clubsProcessed,
          error: errorMessage,
          duration: Date.now() - startTime
        });
        
        throw error; // Re-throw to mark job as failed
      }
      
    } catch (error) {
      console.error(`Error processing scheduler job for ${schedulerId}:`, error);
      throw error;
    }
  });
  
  // Handle job completion
  schedulerQueue.on('completed', (job, result) => {
    console.log(`Scheduler job ${job.id} completed with result:`, result);
  });
  
  // Handle job failure
  schedulerQueue.on('failed', (job, err) => {
    console.error(`Scheduler job ${job.id} failed:`, err);
  });
  
  // Handle job stalled
  schedulerQueue.on('stalled', (job) => {
    console.warn(`Scheduler job ${job.id} stalled`);
  });
  
  console.log('Scheduler service initialized');
}

/**
 * Adds a scheduler job to the queue
 * @param schedulerId - The ID of the scheduler to run
 * @param delay - Optional delay in milliseconds before running
 * @returns The created job
 */
export async function addSchedulerJob(schedulerId: string, delay = 0) {
  try {
    const job = await schedulerQueue.add(
      'run-scheduler',
      { schedulerId },
      { 
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );
    
    console.log(`Added scheduler job ${job.id} for scheduler ${schedulerId}`);
    return job;
  } catch (error) {
    console.error(`Error adding scheduler job for ${schedulerId}:`, error);
    throw error;
  }
}

/**
 * Schedules the next run for a scheduler
 * @param schedulerId - The ID of the scheduler
 * @param nextRun - The next run date
 * @returns The created job
 */
export async function scheduleNextRun(schedulerId: string, nextRun: Date) {
  const delay = nextRun.getTime() - Date.now();
  
  if (delay <= 0) {
    // If next run is in the past, run immediately
    return addSchedulerJob(schedulerId);
  }
  
  return addSchedulerJob(schedulerId, delay);
}

/**
 * Checks for schedulers that need to run and adds them to the queue
 * This function should be called periodically (e.g., every minute)
 */
export async function checkAndScheduleSchedulers() {
  try {
    const schedulers = await getSchedulersToRun();
    
    for (const scheduler of schedulers) {
      // Add to queue if not already queued
      const waitingJobs = await schedulerQueue.getWaiting();
      const activeJobs = await schedulerQueue.getActive();
      
      const isAlreadyQueued = [...waitingJobs, ...activeJobs].some(
        job => job.data.schedulerId === scheduler._id.toString()
      );
      
      if (!isAlreadyQueued) {
        await addSchedulerJob(scheduler._id.toString());
      }
    }
  } catch (error) {
    console.error('Error checking and scheduling schedulers:', error);
  }
}

/**
 * Gets the status of all scheduler jobs
 * @returns Object with job counts and recent jobs
 */
export async function getSchedulerJobStatus() {
  try {
    const waiting = await schedulerQueue.getWaiting();
    const active = await schedulerQueue.getActive();
    const completed = await schedulerQueue.getCompleted();
    const failed = await schedulerQueue.getFailed();
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      recentJobs: {
        waiting: waiting.slice(0, 5).map(job => ({
          id: job.id,
          schedulerId: job.data.schedulerId,
          timestamp: job.timestamp
        })),
        active: active.map(job => ({
          id: job.id,
          schedulerId: job.data.schedulerId,
          timestamp: job.timestamp,
          progress: job.progress()
        })),
        completed: completed.slice(0, 5).map(job => ({
          id: job.id,
          schedulerId: job.data.schedulerId,
          timestamp: job.timestamp,
          result: job.returnvalue
        })),
        failed: failed.slice(0, 5).map(job => ({
          id: job.id,
          schedulerId: job.data.schedulerId,
          timestamp: job.timestamp,
          error: job.failedReason
        }))
      }
    };
  } catch (error) {
    console.error('Error getting scheduler job status:', error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      recentJobs: {
        waiting: [],
        active: [],
        completed: [],
        failed: []
      }
    };
  }
}

/**
 * Removes all jobs from the queue
 * Used for maintenance or debugging
 */
export async function clearSchedulerQueue() {
    try {
      // Get all jobs in different states
      const waitingJobs = await schedulerQueue.getWaiting();
      const activeJobs = await schedulerQueue.getActive();
      const completedJobs = await schedulerQueue.getCompleted();
      const failedJobs = await schedulerQueue.getFailed();
      
      // Remove all jobs
      for (const job of [...waitingJobs, ...activeJobs, ...completedJobs, ...failedJobs]) {
        await job.remove();
      }
      
      console.log('Scheduler queue cleared');
    } catch (error) {
      console.error('Error clearing scheduler queue:', error);
      throw error;
    }
  }

/**
 * Helper function to calculate next run time based on schedule
 * @param scheduleConfig - Schedule configuration
 * @returns Next run date
 */
function calculateNextRun(scheduleConfig: any): Date {
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

/**
 * Gracefully shuts down the scheduler service
 * Called when the application is stopping
 */
export async function shutdownServices(): Promise<void> {
    try {
      console.log('Shutting down scheduler service...');
      await schedulerQueue.close();
      console.log('✅ Scheduler queue closed');
    } catch (error) {
      console.error('❌ Error shutting down scheduler service:', error);
    }
  }

  // Export the queue for use in other modules
export { schedulerQueue };