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
  | 'LOBBY_UPDATED'
  | 'PENALTY'
  | 'PLAYER_SUSPENDED'
  | 'SUSPENSION_ENDED'
  | 'TIMER_TICK'
  | 'ERROR'
  // SMASH-specific events
  | 'SMASH_TURN_START'
  | 'SMASH_CONCERTATION'
  | 'SMASH_TOP'
  | 'SMASH_QUESTION_SUBMIT'
  | 'SMASH_VALIDATE_PROMPT'
  | 'SMASH_QUESTION_VALID'
  | 'SMASH_QUESTION_INVALID'
  | 'SMASH_ANSWER_PROMPT'
  | 'SMASH_ANSWER_SUBMIT'
  | 'SMASH_RESULT_PROMPT'
  | 'SMASH_ANSWER_CORRECT'
  | 'SMASH_ANSWER_INCORRECT'
  | 'SMASH_TIMEOUT';

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

export interface PlayerLeftPayload {
  playerId: string;
  team: TeamSide;
}

export interface LobbyUpdatedPayload {
  matchId: string;
  maxPlayersPerTeam: number;
  teamA: LobbyTeamStatus;
  teamB: LobbyTeamStatus;
  canStart: boolean;
}

export interface LobbyTeamStatus {
  playerCount: number;
  isFull: boolean;
  captainId: string | null;
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
  | 'CASCADE'
  | 'CHOIX_A'
  | 'CHOIX_B'
  | 'DUEL'
  | 'FINALE';

// === SMASH-specific payloads ===

export interface SmashTurnPayload {
  matchId: string;
  turnNumber: number;
  attackerTeam: TeamSide;
  defenderTeam: TeamSide;
  roundType: RoundType;
  hasConcertation: boolean;
  timestamp: number;
}

export interface SmashConcertationPayload {
  matchId: string;
  attackerTeam: TeamSide;
  message: string;
  timestamp: number;
}

export interface SmashTopPayload {
  matchId: string;
  attackerTeam: TeamSide;
  timeoutMs: number;
  timestamp: number;
}

export interface SmashQuestionSubmitPayload {
  matchId: string;
  questionText: string;
  attackerTeam: TeamSide;
  defenderTeam: TeamSide;
  timeoutMs: number;
  timestamp: number;
}

export interface SmashValidatePromptPayload {
  matchId: string;
  questionText: string;
  defenderTeam: TeamSide;
  timeoutMs: number;
  timestamp: number;
}

export interface SmashValidationPayload {
  matchId: string;
  valid: boolean;
  reason?: string;
  validatorTeam: TeamSide;
  pointsAwarded: number;
  timestamp: number;
}

export interface SmashAnswerPromptPayload {
  matchId: string;
  questionText: string;
  defenderTeam: TeamSide;
  timeoutMs: number;
  timestamp: number;
}

export interface SmashAnswerSubmitPayload {
  matchId: string;
  answerText: string;
  defenderTeam: TeamSide;
  timestamp: number;
}

export interface SmashResultPromptPayload {
  matchId: string;
  answerText: string;
  attackerTeam: TeamSide;
  timestamp: number;
}

export interface SmashResultPayload {
  matchId: string;
  correct: boolean;
  winnerTeam?: TeamSide;
  pointsAwarded: number;
  scoreTeamA: number;
  scoreTeamB: number;
  timestamp: number;
}

export interface SmashTimeoutPayload {
  matchId: string;
  phase: 'QUESTION' | 'VALIDATE' | 'ANSWER';
  faultTeam: TeamSide;
  winnerTeam?: TeamSide;
  pointsAwarded: number;
  scoreTeamA: number;
  scoreTeamB: number;
  timestamp: number;
}

// SMASH phase type for UI state management
export type SmashPhase =
  | 'TURN_START'
  | 'CONCERTATION'
  | 'QUESTION'
  | 'VALIDATE'
  | 'ANSWER'
  | 'RESULT';
