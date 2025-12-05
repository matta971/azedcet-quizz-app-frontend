import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { TeamSide } from '../types';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Main tab navigator
export type MainTabParamList = {
  Home: undefined;
  GameModes: undefined;
  Lobby: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

// Game type for workflow navigation
export type GameTypeParam = 'A' | 'B' | 'C';

// Root stack
export type RootStackParamList = {
  Landing: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  MatchWaiting: { matchId: string; opponentName?: string };
  Game: { matchId: string };
  SmashGame: { matchId: string; myTeam: TeamSide };
  GameList: { categoryId: string };
  GameRules: { gameId: string; categoryId: string };
  TeamSetup: { gameId: string; categoryId: string };
  OpponentSelect: {
    gameId: string;
    categoryId: string;
    gameType: GameTypeParam;
    teamId?: string;
    teamName?: string;
    maxPlayersPerTeam?: number;
    isRanked?: boolean;
  };
  TeamLobby: {
    gameId: string;
    categoryId: string;
    myTeamId: string;
    myTeamName: string;
    opponentTeamId: string;
    opponentTeamName: string;
  };
  DuelLobby: {
    gameId: string;
    categoryId: string;
    opponentId: string;
    opponentName: string;
  };
  Settings: undefined;
  Tutorial: undefined;
  ProfileEdit: undefined;
};

// Screen props types
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
