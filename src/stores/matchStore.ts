import { create } from 'zustand';
import { apiService } from '../services';
import { MatchResponse, CreateMatchRequest, TeamSide } from '../types';

interface MatchState {
  currentMatch: MatchResponse | null;
  waitingMatches: MatchResponse[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWaitingMatches: () => Promise<void>;
  fetchMatch: (matchId: string) => Promise<void>;
  createMatch: (data: CreateMatchRequest) => Promise<MatchResponse | null>;
  joinMatch: (matchId: string, preferredSide?: TeamSide) => Promise<MatchResponse | null>;
  joinMatchByCode: (code: string, preferredSide?: TeamSide) => Promise<MatchResponse | null>;
  leaveMatch: () => Promise<boolean>;
  setCurrentMatch: (match: MatchResponse | null) => void;
  updateMatch: (match: Partial<MatchResponse>) => void;
  clearError: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  currentMatch: null,
  waitingMatches: [],
  isLoading: false,
  error: null,

  fetchWaitingMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getWaitingMatches();
      if (response.success && response.data) {
        set({ waitingMatches: response.data.content, isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to fetch matches', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch matches', isLoading: false });
    }
  },

  fetchMatch: async (matchId: string) => {
    try {
      const response = await apiService.getMatch(matchId);
      if (response.success && response.data) {
        set({ currentMatch: response.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch match:', error);
    }
  },

  createMatch: async (data: CreateMatchRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createMatch(data);
      if (response.success && response.data) {
        set({ currentMatch: response.data, isLoading: false });
        return response.data;
      } else {
        set({ error: response.error?.message || 'Failed to create match', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create match', isLoading: false });
      return null;
    }
  },

  joinMatch: async (matchId: string, preferredSide?: TeamSide) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.joinMatch(matchId, preferredSide);
      if (response.success && response.data) {
        set({ currentMatch: response.data, isLoading: false });
        return response.data;
      } else {
        set({ error: response.error?.message || 'Failed to join match', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to join match', isLoading: false });
      return null;
    }
  },

  joinMatchByCode: async (code: string, preferredSide?: TeamSide) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.joinMatchByCode(code, preferredSide);
      if (response.success && response.data) {
        set({ currentMatch: response.data, isLoading: false });
        return response.data;
      } else {
        set({ error: response.error?.message || 'Failed to join match', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to join match', isLoading: false });
      return null;
    }
  },

  leaveMatch: async () => {
    const { currentMatch } = get();
    if (!currentMatch) return false;

    set({ isLoading: true, error: null });
    try {
      const response = await apiService.leaveMatch(currentMatch.id);
      if (response.success) {
        set({ currentMatch: null, isLoading: false });
        return true;
      } else {
        set({ error: response.error?.message || 'Failed to leave match', isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to leave match', isLoading: false });
      return false;
    }
  },

  setCurrentMatch: (match: MatchResponse | null) => set({ currentMatch: match }),

  updateMatch: (updates: Partial<MatchResponse>) => {
    const { currentMatch } = get();
    if (currentMatch) {
      set({ currentMatch: { ...currentMatch, ...updates } });
    }
  },

  clearError: () => set({ error: null }),
}));
