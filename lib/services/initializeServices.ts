/**
 * Service Initialization
 * 
 * This file handles the initialization of all required services
 * for the application, ensuring dependencies are available
 * before starting up critical components.
 */

import { checkRedisHealth } from '@/lib/utils/redisHealthCheck';
import { initializeSchedulerService } from '@/lib/services/schedulerService';
import { startSchedulerCron, stopSchedulerCron, getSchedulerCronStatus } from '@/lib/services/schedulerCronService';

/**
 * Initializes all services required for the application
 * @returns True if all services initialized successfully, false otherwise
 */
export async function initializeServices(): Promise<boolean> {
  try {
    console.log('Initializing services...');
    
    // Check Redis connection first
    console.log('Checking Redis connection...');
    const redisHealthy = await checkRedisHealth();
    
    if (!redisHealthy) {
      console.error('❌ Redis is not accessible. Scheduler service will not be initialized.');
      console.error('Please check your Redis configuration and connection.');
      return false;
    }
    
    console.log('✅ Redis connection verified');
    
    // Initialize scheduler service
    console.log('Initializing scheduler service...');
    initializeSchedulerService();
    console.log('✅ Scheduler service initialized');
    
    // Start scheduler cron service
    console.log('Starting scheduler cron service...');
    const cronStarted = startSchedulerCron();
    if (!cronStarted) {
      console.error('❌ Failed to start scheduler cron service');
      // Don't fail initialization if cron fails, but log the error
      // The scheduler can still be run manually
    } else {
      console.log('✅ Scheduler cron service started');
    }
    
    console.log('✅ All services initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    return false;
  }
}

/**
 * Gracefully shuts down all services
 * Called when the application is stopping
 */
export async function shutdownServices(): Promise<void> {
    try {
      console.log('Shutting down services...');
      
      // Stop scheduler cron service
      console.log('Stopping scheduler cron service...');
      const cronStopped = stopSchedulerCron();
      if (cronStopped) {
        console.log('✅ Scheduler cron service stopped');
      } else {
        console.warn('⚠️  Scheduler cron service was not running');
      }
      
      // Import and close scheduler service queues
      const schedulerServiceModule = await import('./schedulerService');
      
      // Call the scheduler service shutdown function
      if (schedulerServiceModule.shutdownServices) {
        await schedulerServiceModule.shutdownServices();
      }
      
      console.log('✅ Services shut down successfully');
    } catch (error) {
      console.error('❌ Error shutting down services:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  
/**
 * Health check for all services
 * @returns Object with health status of each service
 */
export async function getServicesHealth(): Promise<{
    redis: boolean;
    scheduler: boolean;
    cron: boolean;
    cronStatus?: {
      isRunning: boolean;
      lastCheckTime: Date | null;
      errorCount: number;
      nextCheckIn?: number;
    };
    overall: boolean;
  }> {
    try {
      const redisHealthy = await checkRedisHealth();
      
      // Check scheduler service health
      let schedulerHealthy = false;
      try {
        const schedulerServiceModule = await import('./schedulerService');
        const status = await schedulerServiceModule.getSchedulerJobStatus();
        schedulerHealthy = status !== null;
      } catch (error) {
        schedulerHealthy = false;
      }
      
      // Check cron service health
      let cronHealthy = false;
      let cronStatus;
      try {
        cronStatus = getSchedulerCronStatus();
        cronHealthy = cronStatus.isRunning && cronStatus.errorCount < 5;
      } catch (error) {
        cronHealthy = false;
      }
      
      return {
        redis: redisHealthy,
        scheduler: schedulerHealthy,
        cron: cronHealthy,
        cronStatus: cronStatus ? {
          ...cronStatus,
          lastCheckTime: cronStatus.lastCheckTime || null
        } : undefined,
        overall: redisHealthy && schedulerHealthy && cronHealthy
      };
    } catch (error) {
      console.error('Error checking services health:', error);
      return {
        redis: false,
        scheduler: false,
        cron: false,
        overall: false
      };
    }
  }