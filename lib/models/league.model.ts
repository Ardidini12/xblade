/**
 * League Model
 * 
 * This model represents a hockey league in the xblade platform.
 * It stores league information including:
 * - Basic league details (name, description, type)
 * - League configuration (3v3+1 or 6v6+1 format)
 * - Seasons within the league
 * - Admin/creator information
 * 
 * This model enables admins to organize leagues and seasons, which will
 * contain clubs and players for tracking match data and player progress.
 * It serves as the organizational structure for the data collected from
 * EA's NHL Pro Clubs API.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for season information
export interface ISeason {
  _id?: Types.ObjectId;
  name: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  clubs: string[]; // Array of club IDs
  description?: string;
}

// Main league interface
export interface ILeague extends Document {
  name: string;
  description?: string;
  type: '3v3+1' | '6v6+1'; // 3v3+1 or 6v6+1, where +1 is the goalie
  createdBy: string; // Admin user ID who created the league
  seasons: ISeason[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeasonSchema: Schema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  clubs: [{ type: String, required: true }], // Array of club IDs
  description: { type: String }
}, { _id: true });

const LeagueSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { 
    type: String, 
    required: true, 
    enum: ['3v3+1', '6v6+1'],
    default: '6v6+1'
  },
  createdBy: { type: String, required: true },
  seasons: [SeasonSchema],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create index for createdBy to support finding leagues by admin
LeagueSchema.index({ createdBy: 1 });

// Create index for type to support filtering by league type
LeagueSchema.index({ type: 1 });

// Create index for isActive to support filtering active leagues
LeagueSchema.index({ isActive: 1 });

// Create compound index for createdBy and isActive to support admin's active leagues
LeagueSchema.index({ createdBy: 1, isActive: 1 });

export default mongoose.models.League || mongoose.model<ILeague>('League', LeagueSchema);
