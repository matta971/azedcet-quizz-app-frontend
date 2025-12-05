// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

// Auth types
export interface RegisterRequest {
  handle: string;
  email: string;
  password: string;
  country?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  handle: string;
  email: string;
  role: UserRole;
  rating: number;
  country?: string;
}

export type UserRole = 'PLAYER' | 'REFEREE' | 'AUTHOR' | 'ADMIN';

// Match types
export interface CreateMatchRequest {
  mode: GameMode;
  maxPlayersPerTeam: number;
  region?: string;
  ranked: boolean;
  customRounds?: string[];
}

export interface JoinMatchRequest {
  matchId: string;
  preferredSide?: TeamSide;
  inviteCode?: string;
}

export interface MatchResponse {
  id: string;
  code: string;
  status: MatchStatus;
  ranked: boolean;
  duo: boolean;
  maxPlayersPerTeam: number;
  teamA: TeamResponse;
  teamB: TeamResponse;
  scoreTeamA: number;
  scoreTeamB: number;
  currentRound?: number;
  currentRoundType?: string;
  canStart: boolean;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface TeamResponse {
  id: string;
  side: TeamSide;
  name?: string;
  captainId?: string;
  players: PlayerResponse[];
  playerCount: number;
  isFull: boolean;
}

export interface PlayerResponse {
  id: string;
  userId: string;
  handle: string;
  rating?: number;
  penalties?: number;
  suspended: boolean;
}

export type MatchStatus = 'WAITING' | 'PLAYING' | 'PAUSED' | 'FINISHED' | 'CANCELLED';
export type GameMode = 'CLASSIC' | 'RANKED' | 'QUICK';
export type TeamSide = 'A' | 'B';

// Pagination
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
