/**
 * Match Model
 * 
 * This model represents a hockey match from EA's NHL Pro Clubs API.
 * It stores comprehensive match data including:
 * - Basic match information (ID, timestamp, time ago)
 * - Club details and statistics for both teams
 * - Individual player performance data
 * - Aggregate statistics for each team
 * 
 * This model is the core of the data collection system, preserving match data
 * that would otherwise be deleted by EA after 5 matches. Each match is stored
 * once but can be accessed from either club's perspective, enabling complete
 * historical tracking and analysis capabilities.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for player statistics
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

// Interface for club details
export interface IClubDetails {
  name: string;
  clubId: number;
  regionId: number;
  teamId: number;
  customKit: {
    isCustomTeam: string;
    crestAssetId: string;
    useBaseAsset: string;
  };
}

// Interface for club statistics
export interface IClubStats {
  clubDivision: string;
  cNhlOnlineGameType: string;
  garaw: string;
  gfraw: string;
  losses: string;
  memberString: string;
  opponentClubId: string;
  opponentScore: string;
  opponentTeamArtAbbr: string;
  passa: string;
  passc: string;
  ppg: string;
  ppo: string;
  result: string;
  score: string;
  scoreString: string;
  shots: string;
  teamArtAbbr: string;
  teamSide: string;
  toa: string;
  winnerByDnf: string;
  winnerByGoalieDnf: string;
  details: IClubDetails;
  goals: string;
  goalsAgainst: string;
}

// Interface for aggregate statistics
export interface IAggregateStats {
  class: number;
  glbrksavepct: number;
  glbrksaves: number;
  glbrkshots: number;
  gldsaves: number;
  glga: number;
  glgaa: number;
  glpensavepct: number;
  glpensaves: number;
  glpenshots: number;
  glpkclearzone: number;
  glpokechecks: number;
  glsavepct: number;
  glsaves: number;
  glshots: number;
  glsoperiods: number;
  isGuest: number;
  opponentClubId: number;
  opponentScore: number;
  opponentTeamId: number;
  player_dnf: number;
  playerLevel: number;
  pNhlOnlineGameType: number;
  position: number;
  posSorted: number;
  ratingDefense: number;
  ratingOffense: number;
  ratingTeamplay: number;
  score: number;
  skassists: number;
  skbs: number;
  skdeflections: number;
  skfol: number;
  skfopct: number;
  skfow: number;
  skgiveaways: number;
  skgoals: number;
  skgwg: number;
  skhits: number;
  skinterceptions: number;
  skpassattempts: number;
  skpasses: number;
  skpasspct: number;
  skpenaltiesdrawn: number;
  skpim: number;
  skpkclearzone: number;
  skplusmin: number;
  skpossession: number;
  skppg: number;
  sksaucerpasses: number;
  skshg: number;
  skshotattempts: number;
  skshotonnetpct: number;
  skshotpct: number;
  skshots: number;
  sktakeaways: number;
  teamId: number;
  teamSide: number;
  toi: number;
  toiseconds: number;
}

// Interface for time ago information
export interface ITimeAgo {
  number: number;
  unit: string;
}

// Main match interface
export interface IMatch extends Document {
  matchId: string;
  timestamp: number;
  timeAgo: ITimeAgo;
  clubs: Record<string, IClubStats>;
  players: Record<string, Record<string, IPlayerStats>>;
  aggregate: Record<string, IAggregateStats>;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema({
  matchId: { type: String, required: true, unique: true },
  timestamp: { type: Number, required: true },
  timeAgo: {
    number: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  clubs: { type: Schema.Types.Mixed, required: true },
  players: { type: Schema.Types.Mixed, required: true },
  aggregate: { type: Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

// Create index for matchId to ensure fast lookups and prevent duplicates
MatchSchema.index({ matchId: 1 }, { unique: true });

// Create index for timestamp to support time-based queries
MatchSchema.index({ timestamp: -1 });

// Create a sparse wildcard index on clubs to support dynamic club-existence queries
MatchSchema.index({ "clubs.$**": 1 }, { sparse: true });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);