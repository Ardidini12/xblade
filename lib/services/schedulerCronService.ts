/**
 * Scheduler Cron Service
 * 
 * This service runs a cron job that checks every minute for schedulers
 * that need to run and adds them to the Bull queue for processing.
 * 
 * The cron job ensures that schedulers are automatically executed at their
 * configured times without manual intervention.
 */

import { checkAndScheduleSchedulers } from '@/lib/services/schedulerService';

let cronInterval: NodeJS.Timeout | null = null;
let isRunning = false;
let lastCheckTime: Date | null = null;
let errorCount = 0;
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Starts the scheduler cron service
 * Checks for schedulers to run every minute
 * @returns True if started successfully, false otherwise
 */
export function startSchedulerCron(): boolean {
  if (isRunning) {
    console.warn('⚠️  Scheduler cron is already running');
    return false;
  }

  try {
    console.log('🕐 Starting scheduler cron service...');
    
    // Run immediately on start
    runSchedulerCheck().catch((error) => {
      console.error('❌ Error in initial scheduler check:', error);
    });

    // Then run every minute (60000 milliseconds)
    cronInterval = setInterval(() => {
      runSchedulerCheck().catch((error) => {
        console.error('❌ Error in scheduled check:', error);
      });
    }, 60000); // 1 minute

    isRunning = true;
    lastCheckTime = new Date();
    errorCount = 0;
    
    console.log('✅ Scheduler cron service started (checking every minute)');
    return true;
  } catch (error) {
    console.error('❌ Error starting scheduler cron service:', error);
    isRunning = false;
    return false;
  }
}

/**
 * Stops the scheduler cron service
 * @returns True if stopped successfully, false otherwise
 */
export function stopSchedulerCron(): boolean {
  if (!isRunning) {
    console.warn('⚠️  Scheduler cron is not running');
    return false;
  }

  try {
    console.log('🛑 Stopping scheduler cron service...');
    
    if (cronInterval) {
      clearInterval(cronInterval);
      cronInterval = null;
    }
    
    isRunning = false;
    console.log('✅ Scheduler cron service stopped');
    return true;
  } catch (error) {
    console.error('❌ Error stopping scheduler cron service:', error);
    return false;
  }
}

/**
 * Runs a single check for schedulers that need to run
 * This is called by the cron job and can also be called manually
 */
async function runSchedulerCheck(): Promise<void> {
  const checkStartTime = Date.now();
  
  try {
    await checkAndScheduleSchedulers();
    
    const duration = Date.now() - checkStartTime;
    lastCheckTime = new Date();
    errorCount = 0; // Reset error count on success
    
    // Log only if there was significant processing time or if debugging
    if (duration > 1000) {
      console.log(`✓ Scheduler check completed in ${duration}ms`);
    }
  } catch (error) {
    errorCount++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error in scheduler check (attempt ${errorCount}/${MAX_CONSECUTIVE_ERRORS}):`, errorMessage);
    
    // If we have too many consecutive errors, stop the cron to prevent spam
    if (errorCount >= MAX_CONSECUTIVE_ERRORS) {
      console.error(`❌ Too many consecutive errors (${errorCount}). Stopping cron service.`);
      stopSchedulerCron();
      
      // Log the issue for monitoring
      console.error('⚠️  Scheduler cron service stopped due to repeated errors.');
      console.error('⚠️  Please check the system logs and restart the service when the issue is resolved.');
    }
    
    throw error;
  }
}

/**
 * Gets the status of the scheduler cron service
 * @returns Object with cron service status information
 */
export function getSchedulerCronStatus(): {
  isRunning: boolean;
  lastCheckTime: Date | null;
  errorCount: number;
  nextCheckIn?: number;
} {
  const status: {
    isRunning: boolean;
    lastCheckTime: Date | null;
    errorCount: number;
    nextCheckIn?: number;
  } = {
    isRunning,
    lastCheckTime,
    errorCount
  };

  // Calculate next check time (approximately 1 minute from last check)
  if (isRunning && lastCheckTime) {
    const timeSinceLastCheck = Date.now() - lastCheckTime.getTime();
    const nextCheckIn = Math.max(0, 60000 - timeSinceLastCheck);
    status.nextCheckIn = nextCheckIn;
  }

  return status;
}

/**
 * Manually triggers a scheduler check
 * Useful for testing or manual execution
 * @returns Promise that resolves when check is complete
 */
export async function triggerManualCheck(): Promise<void> {
  console.log('🔍 Triggering manual scheduler check...');
  await runSchedulerCheck();
  console.log('✅ Manual scheduler check completed');
}

