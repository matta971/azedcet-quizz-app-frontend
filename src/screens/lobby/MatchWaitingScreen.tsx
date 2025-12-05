import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMatchStore, useGameStore, useAuthStore } from '../../stores';
import { wsService } from '../../services';
import { RootStackParamList } from '../../navigation/types';
import { LobbyUpdatedPayload, RoundStartedPayload } from '../../types/websocket';
import { TeamSide } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'MatchWaiting'>;

export function MatchWaitingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { matchId } = route.params;

  const { currentMatch, leaveMatch, startMatch, isLoading, fetchMatch, updateLobbyStatus } = useMatchStore();
  const { startGame } = useGameStore();
  const { user } = useAuthStore();
  const [isStarting, setIsStarting] = useState(false);

  const refreshMatch = useCallback(() => {
    fetchMatch(matchId);
  }, [matchId, fetchMatch]);

  const handleLobbyUpdate = useCallback((payload: LobbyUpdatedPayload) => {
    console.log('[MatchWaiting] Lobby updated:', payload);
    updateLobbyStatus(payload);
  }, [updateLobbyStatus]);

  useEffect(() => {
    // Connect to WebSocket and subscribe to match
    const setupWebSocket = async () => {
      try {
        if (!wsService.isConnected) {
          await wsService.connect();
        }
        wsService.subscribeToMatch(matchId);

        // Listen for match start
        const unsubMatchStarted = wsService.on('MATCH_STARTED', () => {
          startGame(matchId);
          // Get fresh match data from store
          const match = useMatchStore.getState().currentMatch;
          const currentUser = useAuthStore.getState().user;

          console.log('[MatchWaiting] ========== MATCH_STARTED ==========');
          console.log('[MatchWaiting] currentUser:', JSON.stringify(currentUser, null, 2));
          console.log('[MatchWaiting] match:', JSON.stringify(match, null, 2));
          console.log('[MatchWaiting] User ID:', currentUser?.id);
          console.log('[MatchWaiting] Team A players:', JSON.stringify(match?.teamA.players));
          console.log('[MatchWaiting] Team B players:', JSON.stringify(match?.teamB.players));

          // Determine which team the user is on (use userId, not id - id is the membership ID)
          const isInTeamA = match?.teamA.players.some(
            (p) => p.userId === currentUser?.id
          );
          const isInTeamB = match?.teamB.players.some(
            (p) => p.userId === currentUser?.id
          );

          console.log('[MatchWaiting] isInTeamA:', isInTeamA, 'isInTeamB:', isInTeamB);

          // Fallback to checking captainId if players array doesn't have the user
          let myTeam: TeamSide;
          if (isInTeamA) {
            myTeam = 'A';
          } else if (isInTeamB) {
            myTeam = 'B';
          } else {
            // Fallback: check captainId
            const isCaptainA = match?.teamA.captainId === currentUser?.id;
            const isCaptainB = match?.teamB.captainId === currentUser?.id;
            console.log('[MatchWaiting] Fallback - isCaptainA:', isCaptainA, 'isCaptainB:', isCaptainB);
            myTeam = isCaptainA ? 'A' : 'B';
          }

          console.log('[MatchWaiting] Final myTeam:', myTeam);
          console.log('[MatchWaiting] =====================================');

          // Navigate to SmashGame for SMASH rounds (default in MVP)
          navigation.replace('SmashGame', { matchId, myTeam });
        });

        // Listen for player joined - refresh match data
        const unsubPlayerJoined = wsService.on('PLAYER_JOINED', () => {
          console.log('[MatchWaiting] Player joined, refreshing match data');
          refreshMatch();
        });

        // Listen for player left - refresh match data
        const unsubPlayerLeft = wsService.on('PLAYER_LEFT', () => {
          console.log('[MatchWaiting] Player left, refreshing match data');
          refreshMatch();
        });

        // Listen for lobby updates (team status, player counts, canStart)
        const unsubLobbyUpdated = wsService.on('LOBBY_UPDATED', (message) => {
          handleLobbyUpdate(message.payload as LobbyUpdatedPayload);
        });

        return () => {
          unsubMatchStarted();
          unsubPlayerJoined();
          unsubPlayerLeft();
          unsubLobbyUpdated();
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    const unsubscribePromise = setupWebSocket();

    return () => {
      unsubscribePromise.then((unsub) => unsub?.());
    };
  }, [matchId, refreshMatch, startGame, navigation, handleLobbyUpdate]);

  const handleLeave = async () => {
    await leaveMatch();
    wsService.unsubscribeFromMatch();
    navigation.goBack();
  };

  const handleStartMatch = async () => {
    setIsStarting(true);
    const result = await startMatch(matchId);
    setIsStarting(false);
    if (result) {
      // Match started - the MATCH_STARTED WebSocket event will handle navigation
      console.log('[MatchWaiting] Match started successfully');
    }
  };

  if (!currentMatch) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  const maxPlayersPerTeam = currentMatch.maxPlayersPerTeam;
  const totalPlayers = currentMatch.teamA.playerCount + currentMatch.teamB.playerCount;
  const maxPlayers = maxPlayersPerTeam * 2;
  const canStart = currentMatch.canStart;

  // Check if current user is a captain
  const isCaptainA = user?.id === currentMatch.teamA.captainId;
  const isCaptainB = user?.id === currentMatch.teamB.captainId;
  const isCaptain = isCaptainA || isCaptainB;

  // Calculate empty slots for each team
  const emptySlotCountA = Math.max(0, maxPlayersPerTeam - currentMatch.teamA.playerCount);
  const emptySlotCountB = Math.max(0, maxPlayersPerTeam - currentMatch.teamB.playerCount);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salle d'attente</Text>
        <Text style={styles.matchType}>
          {maxPlayersPerTeam}v{maxPlayersPerTeam} {currentMatch.ranked ? '• Ranked' : '• Casual'}
        </Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code</Text>
          <Text style={styles.code}>{currentMatch.code}</Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        {/* Team A */}
        <View style={styles.team}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamTitle}>Équipe A</Text>
            <Text style={[styles.teamCount, currentMatch.teamA.isFull && styles.teamCountFull]}>
              {currentMatch.teamA.playerCount}/{maxPlayersPerTeam}
              {currentMatch.teamA.isFull && ' ✓'}
            </Text>
          </View>
          {currentMatch.teamA.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.handle}</Text>
              {currentMatch.teamA.captainId === player.id && (
                <Text style={styles.captainBadge}>👑 Capitaine</Text>
              )}
            </View>
          ))}
          {Array(emptySlotCountA)
            .fill(null)
            .map((_, i) => (
              <View key={`empty-a-${i}`} style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>En attente...</Text>
              </View>
            ))}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vs}>VS</Text>
        </View>

        {/* Team B */}
        <View style={styles.team}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamTitle}>Équipe B</Text>
            <Text style={[styles.teamCount, currentMatch.teamB.isFull && styles.teamCountFull]}>
              {currentMatch.teamB.playerCount}/{maxPlayersPerTeam}
              {currentMatch.teamB.isFull && ' ✓'}
            </Text>
          </View>
          {currentMatch.teamB.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.handle}</Text>
              {currentMatch.teamB.captainId === player.id && (
                <Text style={styles.captainBadge}>👑 Capitaine</Text>
              )}
            </View>
          ))}
          {Array(emptySlotCountB)
            .fill(null)
            .map((_, i) => (
              <View key={`empty-b-${i}`} style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>En attente...</Text>
              </View>
            ))}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {canStart ? (
          <View style={styles.readyContainer}>
            <Text style={styles.readyText}>Match pret a demarrer !</Text>
            <Text style={styles.readySubtext}>Les deux equipes sont completes</Text>
            {isCaptain ? (
              <TouchableOpacity
                style={[styles.startButton, isStarting && styles.startButtonDisabled]}
                onPress={handleStartMatch}
                disabled={isStarting}
              >
                {isStarting ? (
                  <ActivityIndicator color="#1a1a2e" />
                ) : (
                  <Text style={styles.startButtonText}>LANCER LE MATCH</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.readySubtext}>En attente du capitaine...</Text>
                <ActivityIndicator color="#00ff88" style={{ marginTop: 12 }} />
              </>
            )}
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              En attente de joueurs ({totalPlayers}/{maxPlayers})
            </Text>
            <Text style={styles.waitingSubtext}>
              {!currentMatch.teamA.isFull && !currentMatch.teamB.isFull
                ? 'Les deux equipes ont besoin de joueurs'
                : !currentMatch.teamA.isFull
                ? "L'equipe A a besoin de joueurs"
                : "L'equipe B a besoin de joueurs"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.leaveButton}
        onPress={handleLeave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ff4444" />
        ) : (
          <Text style={styles.leaveButtonText}>Quitter le match</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchType: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  code: {
    color: '#00ff88',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  team: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  teamCount: {
    color: '#888',
    fontSize: 14,
  },
  teamCountFull: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  playerCard: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  captainBadge: {
    color: '#00ff88',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  emptySlot: {
    backgroundColor: '#0f3460',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#16213e',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  vsContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vs: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingContainer: {
    alignItems: 'center',
  },
  waitingText: {
    color: '#888',
    fontSize: 16,
  },
  waitingSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  readyContainer: {
    alignItems: 'center',
  },
  readyText: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
  },
  readySubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  startButtonDisabled: {
    backgroundColor: '#333',
  },
  startButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
