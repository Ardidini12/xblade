/**
 * App Initialization
 * 
 * This file handles the initialization and graceful shutdown of the application.
 * It ensures all services (Redis, scheduler, etc.) are properly started and
 * can be cleanly shut down when needed.
 */

import { initializeServices, shutdownServices } from '@/lib/services/initializeServices';

let isInitialized = false;
let isShuttingDown = false;

/**
 * Initializes the application and all required services
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeApp(): Promise<void> {
  if (isInitialized) {
    console.log('⚠️  App is already initialized');
    return;
  }

  if (isShuttingDown) {
    console.error('❌ Cannot initialize app while shutting down');
    return;
  }

  try {
    console.log('🚀 Starting application initialization...');
    
    const success = await initializeServices();
    
    if (!success) {
      console.error('❌ Application initialization failed');
      console.error('Exiting process...');
      process.exit(1);
    }
    
    isInitialized = true;
    console.log('✅ Application initialized successfully');
    
  } catch (error) {
    console.error('❌ Fatal error during application initialization:', error);
    console.error('Exiting process...');
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the application
 * @returns Promise that resolves when shutdown is complete
 */
export async function shutdownApp(): Promise<void> {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress');
    return;
  }

  if (!isInitialized) {
    console.log('⚠️  App was not initialized, nothing to shut down');
    return;
  }

  isShuttingDown = true;
  
  try {
    console.log('🛑 Starting graceful shutdown...');
    
    await shutdownServices();
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Sets up signal handlers for graceful shutdown
 */
function setupSignalHandlers(): void {
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('\n📡 Received SIGINT signal, initiating graceful shutdown...');
    await shutdownApp();
  });

  // Handle SIGTERM (termination signal)
  process.on('SIGTERM', async () => {
    console.log('\n📡 Received SIGTERM signal, initiating graceful shutdown...');
    await shutdownApp();
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    shutdownApp().finally(() => {
      process.exit(1);
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdownApp().finally(() => {
      process.exit(1);
    });
  });
}

// Set up signal handlers when this module is loaded
setupSignalHandlers();

// Export initialization status
export { isInitialized, isShuttingDown };

