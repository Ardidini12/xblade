/**
 * Club Model
 * 
 * This model represents a hockey club/team from EA's NHL Pro Clubs API.
 * It stores comprehensive club statistics and information including:
 * - Basic club details (name, ID, platform)
 * - Performance metrics (wins, losses, goals, etc.)
 * - Division and league history
 * - Recent match results and opponents
 * - Custom team appearance settings
 * 
 * This model serves as the foundation for collecting match data and establishing
 * relationships between clubs, players, and matches in the xblade platform.
 * It enables the scheduler system to track club information and retrieve match
 * data for analysis and player improvement features.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  clubId: string;
  name: string;
  rank: string;
  clubname: string;
  seasons: string;
  divGroupsWon: string;
  leaguesWon: string;
  divGroupsWon1: string;
  divGroupsWon2: string;
  divGroupsWon3: string;
  divGroupsWon4: string;
  cupsWon1: string;
  cupsWon2: string;
  cupsWon3: string;
  cupsWon4: string;
  cupsWon5: string;
  cupsElim1: string;
  cupsElim2: string;
  cupsElim3: string;
  cupsElim4: string;
  cupsElim5: string;
  promotions: string;
  holds: string;
  relegations: string;
  rankingPoints: string;
  curCompetition: string;
  prevDivision: string;
  prevGameDivision: string;
  bestDivision: number;
  bestPoints: string;
  curSeasonMov: string;
  recentResult0: string;
  recentResult1: string;
  recentResult2: string;
  recentResult3: string;
  recentResult4: string;
  recentResult5: string;
  recentResult6: string;
  recentResult7: string;
  recentResult8: string;
  recentResult9: string;
  recentOpponent0: string;
  recentOpponent1: string;
  recentOpponent2: string;
  recentOpponent3: string;
  recentOpponent4: string;
  recentOpponent5: string;
  recentOpponent6: string;
  recentOpponent7: string;
  recentOpponent8: string;
  recentOpponent9: string;
  recentScore0: string;
  recentScore1: string;
  recentScore2: string;
  recentScore3: string;
  recentScore4: string;
  recentScore5: string;
  recentScore6: string;
  recentScore7: string;
  recentScore8: string;
  recentScore9: string;
  wins: string;
  losses: string;
  ties: string;
  otl: string;
  prevSeasonWins: string;
  prevSeasonLosses: string;
  prevSeasonTies: string;
  prevSeasonOtl: string;
  goals: string;
  goalsAgainst: string;
  starLevel: string;
  totalCupsWon: number;
  cupsEntered: string;
  cupWinPercent: string;
  titlesWon: string;
  prevGameWonTitle: string;
  record: string;
  clubfinalsplayed: string;
  divsWon1: number;
  divsWon2: number;
  divsWon3: number;
  divsWon4: number;
  currentDivision: string;
  clubInfo: {
    name: string;
    clubId: number;
    regionId: number;
    teamId: number;
    customKit: {
      isCustomTeam: string;
      crestAssetId: string;
      useBaseAsset: string;
    };
  };
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema: Schema = new Schema({
  clubId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rank: { type: String, default: "0" },
  clubname: { type: String, default: "" },
  seasons: { type: String, default: "0" },
  divGroupsWon: { type: String, default: "0" },
  leaguesWon: { type: String, default: "0" },
  divGroupsWon1: { type: String, default: "0" },
  divGroupsWon2: { type: String, default: "0" },
  divGroupsWon3: { type: String, default: "0" },
  divGroupsWon4: { type: String, default: "0" },
  cupsWon1: { type: String, default: "0" },
  cupsWon2: { type: String, default: "0" },
  cupsWon3: { type: String, default: "0" },
  cupsWon4: { type: String, default: "0" },
  cupsWon5: { type: String, default: "0" },
  cupsElim1: { type: String, default: "0" },
  cupsElim2: { type: String, default: "0" },
  cupsElim3: { type: String, default: "0" },
  cupsElim4: { type: String, default: "0" },
  cupsElim5: { type: String, default: "0" },
  promotions: { type: String, default: "0" },
  holds: { type: String, default: "0" },
  relegations: { type: String, default: "0" },
  rankingPoints: { type: String, default: "0" },
  curCompetition: { type: String, default: "-1" },
  prevDivision: { type: String, default: "10" },
  prevGameDivision: { type: String, default: "10" },
  bestDivision: { type: Number, default: 10 },
  bestPoints: { type: String, default: "0" },
  curSeasonMov: { type: String, default: "0" },
  recentResult0: { type: String, default: "0" },
  recentResult1: { type: String, default: "0" },
  recentResult2: { type: String, default: "0" },
  recentResult3: { type: String, default: "0" },
  recentResult4: { type: String, default: "0" },
  recentResult5: { type: String, default: "0" },
  recentResult6: { type: String, default: "0" },
  recentResult7: { type: String, default: "0" },
  recentResult8: { type: String, default: "0" },
  recentResult9: { type: String, default: "0" },
  recentOpponent0: { type: String, default: "0" },
  recentOpponent1: { type: String, default: "0" },
  recentOpponent2: { type: String, default: "0" },
  recentOpponent3: { type: String, default: "0" },
  recentOpponent4: { type: String, default: "0" },
  recentOpponent5: { type: String, default: "0" },
  recentOpponent6: { type: String, default: "0" },
  recentOpponent7: { type: String, default: "0" },
  recentOpponent8: { type: String, default: "0" },
  recentOpponent9: { type: String, default: "0" },
  recentScore0: { type: String, default: "0-0" },
  recentScore1: { type: String, default: "0-0" },
  recentScore2: { type: String, default: "0-0" },
  recentScore3: { type: String, default: "0-0" },
  recentScore4: { type: String, default: "0-0" },
  recentScore5: { type: String, default: "0-0" },
  recentScore6: { type: String, default: "0-0" },
  recentScore7: { type: String, default: "0-0" },
  recentScore8: { type: String, default: "0-0" },
  recentScore9: { type: String, default: "0-0" },
  wins: { type: String, default: "0" },
  losses: { type: String, default: "0" },
  ties: { type: String, default: "0" },
  otl: { type: String, default: "0" },
  prevSeasonWins: { type: String, default: "0" },
  prevSeasonLosses: { type: String, default: "0" },
  prevSeasonTies: { type: String, default: "0" },
  prevSeasonOtl: { type: String, default: "0" },
  goals: { type: String, default: "0" },
  goalsAgainst: { type: String, default: "0" },
  starLevel: { type: String, default: "0" },
  totalCupsWon: { type: Number, default: 0 },
  cupsEntered: { type: String, default: "0" },
  cupWinPercent: { type: String, default: "0" },
  titlesWon: { type: String, default: "0" },
  prevGameWonTitle: { type: String, default: "0" },
  record: { type: String, default: "0-0-0" },
  clubfinalsplayed: { type: String, default: "0" },
  divsWon1: { type: Number, default: 10 },
  divsWon2: { type: Number, default: 10 },
  divsWon3: { type: Number, default: 10 },
  divsWon4: { type: Number, default: 10 },
  currentDivision: { type: String, default: "10" },
  clubInfo: {
    name: { type: String },
    clubId: { type: Number },
    regionId: { type: Number },
    teamId: { type: Number },
    customKit: {
      isCustomTeam: { type: String, default: "0" },
      crestAssetId: { type: String, default: "0" },
      useBaseAsset: { type: String, default: "1" }
    }
  },
  platform: { type: String, default: "common-gen5" }
}, {
  timestamps: true
});

// Create compound index for name and platform to support searching
ClubSchema.index({ name: 1, platform: 1 });

export default mongoose.models.Club || mongoose.model<IClub>('Club', ClubSchema);
