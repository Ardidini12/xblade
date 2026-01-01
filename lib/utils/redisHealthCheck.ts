/**
 * Redis Health Check Utility
 * 
 * This utility provides functions to check the health and connectivity
 * of the Redis instance used by the application.
 */

import { createClient } from 'redis';
import { redisConfig } from '@/lib/config/redis';


/**
 * Checks if Redis is healthy and accessible
 * @returns True if Redis is healthy, false otherwise
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = createClient(redisConfig);
    
    await client.connect();
    await client.ping();
    await client.quit();
    
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Gets Redis connection information
 * @returns Object with connection details
 */
export async function getRedisInfo(): Promise<{
  connected: boolean;
  host: string;
  port: number;
  memory?: string;
  clients?: number;
}> {
  try {
    const client = createClient(redisConfig);
    
    await client.connect();
    
    const info = await client.info();
    await client.quit();
    
    // Parse memory usage
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memory = memoryMatch ? memoryMatch[1].trim() : undefined;
    
    // Parse client connections
    const clientMatch = info.match(/connected_clients:(.+)/);
    const clients = clientMatch ? parseInt(clientMatch[1].trim()) : undefined;
    
    return {
      connected: true,
      host: redisConfig.socket.host,
      port: redisConfig.socket.port,
      memory,
      clients
    };
  } catch (error) {
    console.error('Error getting Redis info:', error);
    return {
      connected: false,
      host: redisConfig.socket.host,
      port: redisConfig.socket.port
    };
  }
}

/**
 * Tests Redis connection with a simple set/get operation
 * @returns True if test passes, false otherwise
 */
export async function testRedisOperations(): Promise<boolean> {
  try {
    const client = createClient(redisConfig);
    
    await client.connect();
    
    // Test set operation
    await client.set('health_check_test', 'test_value');
    
    // Test get operation
    const value = await client.get('health_check_test');
    
    // Clean up
    await client.del('health_check_test');
    await client.quit();
    
    return value === 'test_value';
  } catch (error) {
    console.error('Redis operations test failed:', error);
    return false;
  }
}

