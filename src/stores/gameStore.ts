import { create } from 'zustand';
import { wsService } from '../services';
import {
  WsMessage,
  QuestionPayload,
  RoundStartedPayload,
  AnswerResultPayload,
  ScoreUpdatePayload,
  TimerTickPayload,
  RoundType,
  TeamSide,
} from '../types';

interface GameState {
  // Match state
  matchId: string | null;
  isPlaying: boolean;
  scoreA: number;
  scoreB: number;

  // Round state
  currentRound: RoundType | null;
  roundIndex: number;

  // Question state
  currentQuestion: QuestionPayload | null;
  remainingTimeMs: number;
  canBuzz: boolean;
  hasBuzzed: boolean;

  // Results
  lastResult: AnswerResultPayload | null;

  // Actions
  startGame: (matchId: string) => void;
  endGame: () => void;
  buzz: () => void;
  submitAnswer: (answer: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  matchId: null,
  isPlaying: false,
  scoreA: 0,
  scoreB: 0,
  currentRound: null,
  roundIndex: 0,
  currentQuestion: null,
  remainingTimeMs: 0,
  canBuzz: false,
  hasBuzzed: false,
  lastResult: null,

  startGame: (matchId: string) => {
    set({ matchId, isPlaying: true });

    // Subscribe to match events
    wsService.subscribeToMatch(matchId);

    // Set up event handlers
    wsService.on('MATCH_STARTED', () => {
      set({ isPlaying: true });
    });

    wsService.on('MATCH_ENDED', (msg: WsMessage) => {
      set({ isPlaying: false });
    });

    wsService.on('ROUND_STARTED', (msg: WsMessage) => {
      const payload = msg.payload as RoundStartedPayload;
      set({
        currentRound: payload.type,
        roundIndex: payload.roundIndex,
        currentQuestion: null,
        hasBuzzed: false,
      });
    });

    wsService.on('QUESTION', (msg: WsMessage) => {
      const payload = msg.payload as QuestionPayload;
      set({
        currentQuestion: payload,
        remainingTimeMs: payload.timeLimitMs,
        canBuzz: true,
        hasBuzzed: false,
        lastResult: null,
      });
    });

    wsService.on('ANSWER_RESULT', (msg: WsMessage) => {
      const payload = msg.payload as AnswerResultPayload;
      set({
        lastResult: payload,
        canBuzz: payload.hasReplyRight,
      });
    });

    wsService.on('QUESTION_TIMEOUT', () => {
      set({
        canBuzz: false,
        remainingTimeMs: 0,
      });
    });

    wsService.on('SCORE_UPDATED', (msg: WsMessage) => {
      const payload = msg.payload as ScoreUpdatePayload;
      set({
        scoreA: payload.scoreA,
        scoreB: payload.scoreB,
      });
    });

    wsService.on('TIMER_TICK', (msg: WsMessage) => {
      const payload = msg.payload as TimerTickPayload;
      set({ remainingTimeMs: payload.remainingMs });
    });

    wsService.on('BUZZER', (msg: WsMessage) => {
      // Someone else buzzed
      set({ canBuzz: false });
    });
  },

  endGame: () => {
    const { matchId } = get();
    if (matchId) {
      wsService.unsubscribeFromMatch();
    }
    set({
      matchId: null,
      isPlaying: false,
      currentRound: null,
      currentQuestion: null,
    });
  },

  buzz: () => {
    const { matchId, canBuzz, hasBuzzed } = get();
    if (!matchId || !canBuzz || hasBuzzed) return;

    wsService.sendBuzzer(matchId);
    set({ hasBuzzed: true, canBuzz: false });
  },

  submitAnswer: (answer: string) => {
    const { matchId, currentQuestion } = get();
    if (!matchId || !currentQuestion) return;

    wsService.sendAnswer(matchId, currentQuestion.questionId, answer);
  },

  reset: () => {
    set({
      matchId: null,
      isPlaying: false,
      scoreA: 0,
      scoreB: 0,
      currentRound: null,
      roundIndex: 0,
      currentQuestion: null,
      remainingTimeMs: 0,
      canBuzz: false,
      hasBuzzed: false,
      lastResult: null,
    });
  },
}));
