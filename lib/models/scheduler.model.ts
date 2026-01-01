/**
 * Scheduler Model
 * 
 * This model represents a data collection scheduler in the xblade platform.
 * It stores scheduler configuration including:
 * - Basic scheduler details (name, description)
 * - Schedule configuration (hours, days of operation)
 * - Clubs to monitor for data collection
 * - Collection settings (frequency, platform)
 * - Status and history information
 * 
 * This model enables admins to create multiple parallel schedulers that
 * run during specific time windows (e.g., 8:30 PM - 11:00 PM EST on
 * Tuesday and Wednesday) to collect match data from EA's API without
 * interfering with each other.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for schedule configuration
export interface IScheduleConfig {
  startHour: number; // 0-23
  endHour: number; // 0-23
  daysOfWeek: number[]; // 0-6, where 0 is Sunday
  timezone: string; // e.g., "EST", "UTC"
}

// Interface for collection settings
export interface ICollectionSettings {
  platform: string; // e.g., "common-gen5"
  matchType: string; // e.g., "club_private"
  frequencyMinutes: number; // How often to run during active hours
  retryAttempts: number; // Number of retry attempts on failure
  retryDelayMinutes: number; // Delay between retries
}

// Interface for execution history
export interface IExecutionHistory {
  timestamp: Date;
  status: 'success' | 'error' | 'partial';
  matchesCollected: number;
  clubsProcessed: number;
  error?: string;
  duration: number; // Execution time in milliseconds
}

// Main scheduler interface
export interface IScheduler extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string; // Admin user ID who created the scheduler
  scheduleConfig: IScheduleConfig;
  collectionSettings: ICollectionSettings;
  clubs: string[]; // Array of club IDs to monitor
  lastRun?: Date;
  nextRun?: Date;
  executionHistory: IExecutionHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleConfigSchema: Schema = new Schema({
  startHour: { type: Number, required: true, min: 0, max: 23 },
  endHour: { type: Number, required: true, min: 0, max: 23 },
  daysOfWeek: [{ type: Number, required: true, min: 0, max: 6 }],
  timezone: { type: String, required: true, default: "EST" }
}, { _id: false });

const CollectionSettingsSchema: Schema = new Schema({
  platform: { type: String, required: true, default: "common-gen5" },
  matchType: { type: String, required: true, default: "club_private" },
  frequencyMinutes: { type: Number, required: true, default: 30, min: 5 },
  retryAttempts: { type: Number, required: true, default: 3, min: 0 },
  retryDelayMinutes: { type: Number, required: true, default: 5, min: 1 }
}, { _id: false });

const ExecutionHistorySchema: Schema = new Schema({
  timestamp: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['success', 'error', 'partial'],
    default: 'success'
  },
  matchesCollected: { type: Number, required: true, default: 0 },
  clubsProcessed: { type: Number, required: true, default: 0 },
  error: { type: String },
  duration: { type: Number, required: true }
}, { _id: false });

const SchedulerSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  scheduleConfig: { type: ScheduleConfigSchema, required: true },
  collectionSettings: { type: CollectionSettingsSchema, required: true },
  clubs: [{ type: String, required: true }],
  lastRun: { type: Date },
  nextRun: { type: Date },
  executionHistory: [ExecutionHistorySchema]
}, {
  timestamps: true
});

// Create index for createdBy to support finding schedulers by admin
SchedulerSchema.index({ createdBy: 1 });

// Create index for isActive to support filtering active schedulers
SchedulerSchema.index({ isActive: 1 });

// Create index for nextRun to support finding schedulers that need to run
SchedulerSchema.index({ nextRun: 1 });

// Create compound index for createdBy and isActive to support admin's active schedulers
SchedulerSchema.index({ createdBy: 1, isActive: 1 });

// Create index for executionHistory.timestamp to support history queries
SchedulerSchema.index({ "executionHistory.timestamp": -1 });

export default mongoose.models.Scheduler || mongoose.model<IScheduler>('Scheduler', SchedulerSchema);
