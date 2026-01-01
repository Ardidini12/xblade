/**
 * Redis Configuration
 * 
 * This file exports the Redis connection configuration
 * for use throughout the application.
 */

// Validate required environment variables
const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD', 'REDIS_DB'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!)
  },
  username: 'default',
  password: process.env.REDIS_PASSWORD!,
  database: parseInt(process.env.REDIS_DB!),
  // Connection options
  connectTimeout: 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3
};