import { TeamSide } from './api';

// WebSocket message types
export type WsEventType =
  | 'CONNECTED'
  | 'MATCH_STARTED'
  | 'MATCH_ENDED'
  | 'ROUND_STARTED'
  | 'ROUND_ENDED'
  | 'QUESTION'
  | 'ANSWER_RESULT'
  | 'QUESTION_TIMEOUT'
  | 'BUZZER'
  | 'SCORE_UPDATED'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PENALTY'
  | 'PLAYER_SUSPENDED'
  | 'SUSPENSION_ENDED'
  | 'TIMER_TICK'
  | 'ERROR';

export interface WsMessage<T = unknown> {
  type: WsEventType;
  payload: T;
  timestamp: number;
}

// Payload types
export interface MatchStartedPayload {
  matchId: string;
  startTime: number;
}

export interface MatchEndedPayload {
  matchId: string;
  winnerId?: string;
  scoreA: number;
  scoreB: number;
}

export interface RoundStartedPayload {
  roundId: string;
  type: RoundType;
  roundIndex: number;
  instruction?: string;
  totalQuestions: number;
  durationMs: number;
}

export interface RoundEndedPayload {
  type: RoundType;
  teamAPoints: number;
  teamBPoints: number;
}

export interface QuestionPayload {
  questionId: string;
  text: string;
  choices?: string[];
  timeLimitMs: number;
  targetTeam?: TeamSide;
  questionIndex: number;
}

export interface AnswerResultPayload {
  questionId: string;
  playerId: string;
  playerHandle: string;
  team: TeamSide;
  correct: boolean;
  givenAnswer?: string;
  expectedAnswer: string;
  pointsAwarded: number;
  responseTimeMs: number;
  newTeamScore: number;
  hasReplyRight: boolean;
}

export interface BuzzerPayload {
  playerId: string;
  team: TeamSide;
  timestamp: number;
}

export interface ScoreUpdatePayload {
  scoreA: number;
  scoreB: number;
}

export interface PlayerJoinedPayload {
  playerId: string;
  handle: string;
  team: TeamSide;
}

export interface PenaltyPayload {
  playerId: string;
  playerHandle: string;
  team: TeamSide;
  reason: string;
  penaltyCount: number;
  suspended: boolean;
  suspensionPointsRemaining: number;
  bonusQuestionForOpponent: boolean;
}

export interface TimerTickPayload {
  remainingMs: number;
  serverTime: number;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export type RoundType =
  | 'SMASH_A'
  | 'SMASH_B'
  | 'RELAIS_A'
  | 'RELAIS_B'
  | 'CASCADE_A'
  | 'CASCADE_B'
  | 'CHOIX_A'
  | 'CHOIX_B'
  | 'DUEL'
  | 'FINALE';
