import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMatchStore, useGameStore } from '../../stores';
import { wsService } from '../../services';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'MatchWaiting'>;

export function MatchWaitingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { matchId } = route.params;

  const { currentMatch, leaveMatch, isLoading, fetchMatch } = useMatchStore();
  const { startGame } = useGameStore();

  const refreshMatch = useCallback(() => {
    fetchMatch(matchId);
  }, [matchId, fetchMatch]);

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
          navigation.replace('Game', { matchId });
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

        return () => {
          unsubMatchStarted();
          unsubPlayerJoined();
          unsubPlayerLeft();
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    const unsubscribePromise = setupWebSocket();

    return () => {
      unsubscribePromise.then((unsub) => unsub?.());
    };
  }, [matchId, refreshMatch, startGame, navigation]);

  const handleLeave = async () => {
    await leaveMatch();
    wsService.unsubscribeFromMatch();
    navigation.goBack();
  };

  if (!currentMatch) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  const totalPlayers = currentMatch.teamA.players.length + currentMatch.teamB.players.length;
  const maxPlayers = currentMatch.duo ? 2 : 4;
  const isFull = totalPlayers >= maxPlayers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salle d'attente</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code</Text>
          <Text style={styles.code}>{currentMatch.code}</Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        {/* Team A */}
        <View style={styles.team}>
          <Text style={styles.teamTitle}>Équipe A</Text>
          {currentMatch.teamA.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.handle}</Text>
              {currentMatch.teamA.captainId === player.id && (
                <Text style={styles.captainBadge}>Capitaine</Text>
              )}
            </View>
          ))}
          {Array(Math.max(0, (currentMatch.duo ? 1 : 2) - currentMatch.teamA.players.length))
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
          <Text style={styles.teamTitle}>Équipe B</Text>
          {currentMatch.teamB.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.handle}</Text>
              {currentMatch.teamB.captainId === player.id && (
                <Text style={styles.captainBadge}>Capitaine</Text>
              )}
            </View>
          ))}
          {Array(Math.max(0, (currentMatch.duo ? 1 : 2) - currentMatch.teamB.players.length))
            .fill(null)
            .map((_, i) => (
              <View key={`empty-b-${i}`} style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>En attente...</Text>
              </View>
            ))}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {isFull ? (
          <View style={styles.readyContainer}>
            <Text style={styles.readyText}>Match prêt !</Text>
            <Text style={styles.readySubtext}>Le match va bientôt commencer...</Text>
            <ActivityIndicator color="#00ff88" style={{ marginTop: 12 }} />
          </View>
        ) : (
          <Text style={styles.waitingText}>
            En attente de joueurs ({totalPlayers}/{maxPlayers})
          </Text>
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
    marginBottom: 20,
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
  teamTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
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
  waitingText: {
    color: '#888',
    fontSize: 16,
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
});
