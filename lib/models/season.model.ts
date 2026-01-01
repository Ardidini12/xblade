/**
 * Season Model
 * 
 * This model represents a season within a league in the xblade platform.
 * It stores season information including:
 * - Basic season details (name, description)
 * - Time period (start date, end date)
 * - Associated league reference
 * - Clubs participating in the season
 * - Active status
 * 
 * This model enables tracking of club performance and match data
 * within specific time periods, allowing for historical analysis
 * and season-based statistics.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

// Main season interface
export interface ISeason extends Document {
  name: string;
  description?: string;
  leagueId: string; // Reference to the League this season belongs to
  startDate: Date;
  endDate?: Date;
  clubs: string[]; // Array of club IDs participating in this season
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeasonSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  leagueId: { type: String, required: true, ref: 'League' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  clubs: [{ type: String, required: true }], // Array of club IDs
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create index for leagueId to support finding seasons by league
SeasonSchema.index({ leagueId: 1 });

// Create index for startDate to support time-based queries
SeasonSchema.index({ startDate: -1 });

// Create index for isActive to support filtering active seasons
SeasonSchema.index({ isActive: 1 });

// Create compound index for leagueId and isActive to support active seasons in a league
SeasonSchema.index({ leagueId: 1, isActive: 1 });

// Create compound index for leagueId and startDate to support chronological season queries
SeasonSchema.index({ leagueId: 1, startDate: -1 });

// Create index for clubs to support finding seasons containing specific clubs
SeasonSchema.index({ clubs: 1 });

export default mongoose.models.Season || mongoose.model<ISeason>('Season', SeasonSchema);