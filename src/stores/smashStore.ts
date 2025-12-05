import { create } from 'zustand';
import { wsService } from '../services';
import {
  WsMessage,
  RoundType,
  TeamSide,
  SmashPhase,
  SmashTurnPayload,
  SmashQuestionSubmitPayload,
  SmashValidationPayload,
  SmashAnswerSubmitPayload,
  SmashResultPayload,
  SmashTimeoutPayload,
  ScoreUpdatePayload,
} from '../types';

interface SmashState {
  // Match state
  matchId: string | null;
  isPlaying: boolean;
  roundType: RoundType | null;

  // Score
  scoreA: number;
  scoreB: number;

  // Turn state
  turnNumber: number;
  attackerTeam: TeamSide | null;
  defenderTeam: TeamSide | null;
  currentPhase: SmashPhase;
  hasConcertation: boolean;

  // Question state
  currentQuestion: string | null;
  currentAnswer: string | null;

  // Timer state
  remainingTimeMs: number;
  timerStartTime: number | null;
  timerDurationMs: number;

  // Result state
  lastResult: {
    type: 'correct' | 'incorrect' | 'timeout' | 'invalid';
    message: string;
    points: number;
    winner?: TeamSide;
  } | null;

  // My team (set from match context)
  myTeam: TeamSide | null;

  // Actions
  startSmashGame: (matchId: string, myTeam: TeamSide) => void;
  endSmashGame: () => void;

  // Player actions
  sendTop: () => void;
  sendQuestion: (questionText: string) => void;
  sendValidation: (valid: boolean, reason?: string) => void;
  sendAnswer: (answer: string) => void;
  sendResult: (correct: boolean) => void;

  // Timer
  updateTimer: () => void;

  reset: () => void;
}

export const useSmashStore = create<SmashState>((set, get) => {
  let timerInterval: NodeJS.Timeout | null = null;

  const clearTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const startTimer = (durationMs: number) => {
    clearTimer();
    set({
      timerStartTime: Date.now(),
      timerDurationMs: durationMs,
      remainingTimeMs: durationMs,
    });

    timerInterval = setInterval(() => {
      const { timerStartTime, timerDurationMs } = get();
      if (timerStartTime) {
        const elapsed = Date.now() - timerStartTime;
        const remaining = Math.max(0, timerDurationMs - elapsed);
        set({ remainingTimeMs: remaining });

        if (remaining <= 0) {
          clearTimer();
        }
      }
    }, 100);
  };

  return {
    matchId: null,
    isPlaying: false,
    roundType: null,
    scoreA: 0,
    scoreB: 0,
    turnNumber: 0,
    attackerTeam: null,
    defenderTeam: null,
    currentPhase: 'TURN_START',
    hasConcertation: false,
    currentQuestion: null,
    currentAnswer: null,
    remainingTimeMs: 0,
    timerStartTime: null,
    timerDurationMs: 0,
    lastResult: null,
    myTeam: null,

    startSmashGame: (matchId: string, myTeam: TeamSide) => {
      console.log('[SmashStore] Starting SMASH game:', { matchId, myTeam });
      set({ matchId, myTeam, isPlaying: true });

      // Subscribe to match events
      wsService.subscribeToMatch(matchId);

      // SMASH Turn Start
      wsService.on('SMASH_TURN_START', (msg: WsMessage) => {
        const payload = msg.payload as SmashTurnPayload;
        console.log('[SmashStore] SMASH_TURN_START received:', payload);
        clearTimer();
        set({
          turnNumber: payload.turnNumber,
          attackerTeam: payload.attackerTeam,
          defenderTeam: payload.defenderTeam,
          roundType: payload.roundType,
          hasConcertation: payload.hasConcertation,
          currentPhase: 'TURN_START',
          currentQuestion: null,
          currentAnswer: null,
          lastResult: null,
        });
      });

      // SMASH Concertation (SMASH A only)
      wsService.on('SMASH_CONCERTATION', (msg: WsMessage) => {
        console.log('[SmashStore] SMASH_CONCERTATION received:', msg);
        const currentState = get();
        console.log('[SmashStore] Current state at CONCERTATION:', {
          attackerTeam: currentState.attackerTeam,
          myTeam: currentState.myTeam,
        });
        set({ currentPhase: 'CONCERTATION' });
      });

      // SMASH TOP pressed
      wsService.on('SMASH_TOP', (msg: WsMessage) => {
        const payload = msg.payload as { timeoutMs: number };
        set({ currentPhase: 'QUESTION' });
        startTimer(payload.timeoutMs);
      });

      // Question submitted
      wsService.on('SMASH_QUESTION_SUBMIT', (msg: WsMessage) => {
        const payload = msg.payload as SmashQuestionSubmitPayload;
        clearTimer();
        set({
          currentQuestion: payload.questionText,
          currentPhase: 'VALIDATE',
        });
        startTimer(payload.timeoutMs);
      });

      // Validate prompt
      wsService.on('SMASH_VALIDATE_PROMPT', (msg: WsMessage) => {
        const payload = msg.payload as { questionText: string; timeoutMs: number };
        set({
          currentQuestion: payload.questionText,
          currentPhase: 'VALIDATE',
        });
        startTimer(payload.timeoutMs);
      });

      // Question validated
      wsService.on('SMASH_QUESTION_VALID', () => {
        clearTimer();
        set({ currentPhase: 'ANSWER' });
      });

      // Question invalidated
      wsService.on('SMASH_QUESTION_INVALID', (msg: WsMessage) => {
        const payload = msg.payload as SmashValidationPayload;
        clearTimer();
        set({
          lastResult: {
            type: 'invalid',
            message: `Question invalide: ${payload.reason || 'Non spécifié'}`,
            points: payload.pointsAwarded,
            winner: payload.validatorTeam,
          },
        });
      });

      // Answer prompt
      wsService.on('SMASH_ANSWER_PROMPT', (msg: WsMessage) => {
        const payload = msg.payload as { timeoutMs: number };
        set({ currentPhase: 'ANSWER' });
        startTimer(payload.timeoutMs);
      });

      // Answer submitted
      wsService.on('SMASH_ANSWER_SUBMIT', (msg: WsMessage) => {
        const payload = msg.payload as SmashAnswerSubmitPayload;
        clearTimer();
        set({
          currentAnswer: payload.answerText,
          currentPhase: 'RESULT',
        });
      });

      // Result prompt
      wsService.on('SMASH_RESULT_PROMPT', (msg: WsMessage) => {
        const payload = msg.payload as { answerText: string };
        set({
          currentAnswer: payload.answerText,
          currentPhase: 'RESULT',
        });
      });

      // Answer correct
      wsService.on('SMASH_ANSWER_CORRECT', (msg: WsMessage) => {
        const payload = msg.payload as SmashResultPayload;
        clearTimer();
        set({
          scoreA: payload.scoreTeamA,
          scoreB: payload.scoreTeamB,
          lastResult: {
            type: 'correct',
            message: 'Bonne reponse !',
            points: payload.pointsAwarded,
            winner: payload.winnerTeam,
          },
        });
      });

      // Answer incorrect
      wsService.on('SMASH_ANSWER_INCORRECT', (msg: WsMessage) => {
        const payload = msg.payload as SmashResultPayload;
        clearTimer();
        set({
          scoreA: payload.scoreTeamA,
          scoreB: payload.scoreTeamB,
          lastResult: {
            type: 'incorrect',
            message: 'Mauvaise reponse',
            points: 0,
          },
        });
      });

      // Timeout
      wsService.on('SMASH_TIMEOUT', (msg: WsMessage) => {
        const payload = msg.payload as SmashTimeoutPayload;
        clearTimer();
        set({
          scoreA: payload.scoreTeamA,
          scoreB: payload.scoreTeamB,
          lastResult: {
            type: 'timeout',
            message: `Temps ecoule (${payload.phase})`,
            points: payload.pointsAwarded,
            winner: payload.winnerTeam,
          },
        });
      });

      // Score update
      wsService.on('SCORE_UPDATED', (msg: WsMessage) => {
        const payload = msg.payload as ScoreUpdatePayload;
        set({
          scoreA: payload.scoreA,
          scoreB: payload.scoreB,
        });
      });

      // Round ended
      wsService.on('ROUND_ENDED', () => {
        clearTimer();
        set({ isPlaying: false });
      });

      // Match ended
      wsService.on('MATCH_ENDED', () => {
        clearTimer();
        set({ isPlaying: false });
      });
    },

    endSmashGame: () => {
      clearTimer();
      const { matchId } = get();
      if (matchId) {
        wsService.unsubscribeFromMatch();
      }
      get().reset();
    },

    sendTop: () => {
      const { matchId, currentPhase, attackerTeam, myTeam } = get();
      console.log('[SmashStore] sendTop called:', { matchId, currentPhase, attackerTeam, myTeam });
      if (!matchId) {
        console.log('[SmashStore] sendTop blocked: no matchId');
        return;
      }
      if (currentPhase !== 'CONCERTATION') {
        console.log('[SmashStore] sendTop blocked: currentPhase is', currentPhase, 'expected CONCERTATION');
        return;
      }
      if (attackerTeam !== myTeam) {
        console.log('[SmashStore] sendTop blocked: attackerTeam', attackerTeam, '!== myTeam', myTeam);
        return;
      }
      console.log('[SmashStore] sendTop sending to backend...');
      wsService.sendSmashTop(matchId);
    },

    sendQuestion: (questionText: string) => {
      const { matchId, currentPhase, attackerTeam, myTeam } = get();
      if (!matchId || currentPhase !== 'QUESTION' || attackerTeam !== myTeam) return;
      wsService.sendSmashQuestion(matchId, questionText);
    },

    sendValidation: (valid: boolean, reason?: string) => {
      const { matchId, currentPhase, defenderTeam, myTeam } = get();
      if (!matchId || currentPhase !== 'VALIDATE' || defenderTeam !== myTeam) return;
      wsService.sendSmashValidate(matchId, valid, reason);
    },

    sendAnswer: (answer: string) => {
      const { matchId, currentPhase, defenderTeam, myTeam } = get();
      if (!matchId || currentPhase !== 'ANSWER' || defenderTeam !== myTeam) return;
      wsService.sendSmashAnswer(matchId, answer);
    },

    sendResult: (correct: boolean) => {
      const { matchId, currentPhase, attackerTeam, myTeam } = get();
      if (!matchId || currentPhase !== 'RESULT' || attackerTeam !== myTeam) return;
      wsService.sendSmashResult(matchId, correct);
    },

    updateTimer: () => {
      const { timerStartTime, timerDurationMs } = get();
      if (timerStartTime) {
        const elapsed = Date.now() - timerStartTime;
        const remaining = Math.max(0, timerDurationMs - elapsed);
        set({ remainingTimeMs: remaining });
      }
    },

    reset: () => {
      clearTimer();
      set({
        matchId: null,
        isPlaying: false,
        roundType: null,
        scoreA: 0,
        scoreB: 0,
        turnNumber: 0,
        attackerTeam: null,
        defenderTeam: null,
        currentPhase: 'TURN_START',
        hasConcertation: false,
        currentQuestion: null,
        currentAnswer: null,
        remainingTimeMs: 0,
        timerStartTime: null,
        timerDurationMs: 0,
        lastResult: null,
        myTeam: null,
      });
    },
  };
});
