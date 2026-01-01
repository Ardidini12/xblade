/**
 * Player Model
 * 
 * This model represents a hockey player in the xblade platform.
 * It stores player information including:
 * - Basic player details (name, player ID, platform)
 * - Player statistics from matches
 * - Match history and performance data
 * - Club associations
 * 
 * This model enables tracking of individual player performance over time,
 * regardless of whether they register on the platform. It stores the
 * complete statistical data from EA's NHL Pro Clubs API, allowing for
 * detailed analysis and player improvement features.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for player statistics (from EA API)
export interface IPlayerStats {
  class: string;
  glbrksavepct: string;
  glbrksaves: string;
  glbrkshots: string;
  gldsaves: string;
  glga: string;
  glgaa: string;
  glpensavepct: string;
  glpensaves: string;
  glpenshots: string;
  glpkclearzone: string;
  glpokechecks: string;
  glsavepct: string;
  glsaves: string;
  glshots: string;
  glsoperiods: string;
  isGuest: string;
  opponentClubId: string;
  opponentScore: string;
  opponentTeamId: string;
  player_dnf: string;
  playerLevel: string;
  pNhlOnlineGameType: string;
  position: string;
  posSorted: string;
  ratingDefense: string;
  ratingOffense: string;
  ratingTeamplay: string;
  score: string;
  skassists: string;
  skbs: string;
  skdeflections: string;
  skfol: string;
  skfopct: string;
  skfow: string;
  skgiveaways: string;
  skgoals: string;
  skgwg: string;
  skhits: string;
  skinterceptions: string;
  skpassattempts: string;
  skpasses: string;
  skpasspct: string;
  skpenaltiesdrawn: string;
  skpim: string;
  skpkclearzone: string;
  skplusmin: string;
  skpossession: string;
  skppg: string;
  sksaucerpasses: string;
  skshg: string;
  skshotattempts: string;
  skshotonnetpct: string;
  skshotpct: string;
  skshots: string;
  sktakeaways: string;
  teamId: string;
  teamSide: string;
  toi: string;
  toiseconds: string;
  playername: string;
  clientPlatform: string;
}

// Interface for match history entry
export interface IMatchHistory {
  matchId: string;
  timestamp: number;
  clubId: string;
  stats: IPlayerStats;
}

// Main player interface
export interface IPlayer extends Document {
  playerId: string; // EA player ID
  playerName: string;
  clientPlatform: string;
  position: string;
  isRegistered: boolean; // Whether the player has registered on the platform
  userId?: string; // Reference to User model if registered
  clubs: string[]; // Array of club IDs the player has been associated with
  matchHistory: IMatchHistory[]; // Recent match history with stats
  careerStats: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalPoints: number; // Goals + Assists
    totalShots: number;
    shotPercentage: number;
    totalHits: number;
    totalPIM: number;
    plusMinus: number;
    avgRating: {
      offense: number;
      defense: number;
      teamplay: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const MatchHistorySchema: Schema = new Schema({
  matchId: { type: String, required: true },
  timestamp: { type: Number, required: true },
  clubId: { type: String, required: true },
  stats: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const PlayerSchema: Schema = new Schema({
  playerId: { type: String, required: true, unique: true },
  playerName: { type: String, required: true },
  clientPlatform: { type: String, required: true },
  position: { type: String, required: true },
  isRegistered: { type: Boolean, default: false },
  userId: { type: String }, // Reference to User model if registered
  clubs: [{ type: String }], // Array of club IDs
  matchHistory: [MatchHistorySchema],
  careerStats: {
    totalMatches: { type: Number, default: 0 },
    totalGoals: { type: Number, default: 0 },
    totalAssists: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    totalShots: { type: Number, default: 0 },
    shotPercentage: { type: Number, default: 0 },
    totalHits: { type: Number, default: 0 },
    totalPIM: { type: Number, default: 0 },
    plusMinus: { type: Number, default: 0 },
    avgRating: {
      offense: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      teamplay: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// Create index for playerName to support searching by name
PlayerSchema.index({ playerName: 1 });

// Create index for isRegistered to support filtering registered vs unregistered players
PlayerSchema.index({ isRegistered: 1 });

// Create index for clubs to support finding players by club
PlayerSchema.index({ clubs: 1 });

// Create compound index for playerName and clientPlatform to support unique players across platforms
PlayerSchema.index({ playerName: 1, clientPlatform: 1 });

// Create index for matchHistory.timestamp to support time-based queries
PlayerSchema.index({ "matchHistory.timestamp": -1 });

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
