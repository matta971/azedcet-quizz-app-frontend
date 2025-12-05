import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { GAMES_BY_CATEGORY } from '../gamelist/GameListScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuelLobbyRouteProp = RouteProp<RootStackParamList, 'DuelLobby'>;

interface Player {
  id: string;
  name: string;
  level: number;
  isReady: boolean;
}

export function DuelLobbyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DuelLobbyRouteProp>();
  const { gameId, categoryId, opponentId, opponentName } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const category = GAMES_BY_CATEGORY[categoryId];
  const game = category?.games.find((g) => g.id === gameId);

  useEffect(() => {
    loadDuelData();
  }, []);

  // Auto-start when both players are ready
  useEffect(() => {
    if (me?.isReady && opponent?.isReady && countdown === null) {
      startCountdown();
    }
  }, [me?.isReady, opponent?.isReady]);

  const loadDuelData = async () => {
    setIsLoading(true);
    // TODO: Call API / WebSocket to get duel data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data
    setMe({
      id: 'me',
      name: 'Moi',
      level: 12,
      isReady: true,
    });

    setOpponent({
      id: opponentId,
      name: opponentName,
      level: 15,
      isReady: true, // Simulating opponent is ready
    });

    setIsLoading(false);
  };

  const startCountdown = () => {
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Launch the game
          navigation.replace('Game', { matchId: `duel_${Date.now()}` });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getWorkflowSteps = () => [
    { step: 1, label: 'Regles', completed: true },
    { step: 2, label: 'Adversaire', completed: true },
    { step: 3, label: 'Lobby duel', active: true },
    { step: 4, label: 'Match' },
  ];

  const renderPlayerSlot = (player: Player | null, isMe: boolean, label: string) => (
    <View style={[styles.playerSlot, isMe && styles.mySlot]}>
      {player ? (
        <>
          <View style={styles.playerAvatar}>
            <Text style={styles.avatarText}>{player.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerLevel}>Niveau {player.level}</Text>
          <View style={[
            styles.readyBadge,
            player.isReady ? styles.readyBadgeYes : styles.readyBadgeNo
          ]}>
            <Text style={[
              styles.readyBadgeText,
              player.isReady ? styles.readyTextYes : styles.readyTextNo
            ]}>
              {player.isReady ? 'PRET' : 'EN ATTENTE'}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.emptyAvatar}>
            <ActivityIndicator color="#666" />
          </View>
          <Text style={styles.waitingText}>{label}</Text>
        </>
      )}
    </View>
  );

  const workflowSteps = getWorkflowSteps();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffaa00" />
            <Text style={styles.loadingText}>Connexion au duel...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Quitter le duel</Text>
          </TouchableOpacity>
          {game && (
            <Text style={styles.gameName}>{game.name}</Text>
          )}
        </View>

        <View style={styles.content}>
          {/* Workflow Steps */}
          <View style={styles.workflowSection}>
            <Text style={styles.sectionTitle}>PARCOURS</Text>
            <View style={styles.workflowSteps}>
              {workflowSteps.map((step, index) => (
                <View key={step.step} style={styles.stepContainer}>
                  <View style={[
                    styles.stepCircle,
                    step.active && styles.stepCircleActive,
                    step.completed && styles.stepCircleCompleted,
                  ]}>
                    <Text style={[
                      styles.stepNumber,
                      step.active && styles.stepNumberActive,
                      step.completed && styles.stepNumberCompleted,
                    ]}>
                      {step.completed ? '✓' : step.step}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    step.active && styles.stepLabelActive,
                    step.completed && styles.stepLabelCompleted,
                  ]}>
                    {step.label}
                  </Text>
                  {index < workflowSteps.length - 1 && <View style={styles.stepConnector} />}
                </View>
              ))}
            </View>
          </View>

          {/* Duel Arena */}
          <Text style={styles.lobbyTitle}>LOBBY DUEL</Text>

          <View style={styles.duelArena}>
            {renderPlayerSlot(me, true, 'Vous')}

            <View style={styles.vsContainer}>
              {countdown !== null ? (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownNumber}>{countdown}</Text>
                </View>
              ) : (
                <Text style={styles.vsText}>VS</Text>
              )}
            </View>

            {renderPlayerSlot(opponent, false, 'Adversaire')}
          </View>

          {/* Status */}
          <View style={styles.statusSection}>
            {countdown !== null ? (
              <View style={styles.startingStatus}>
                <Text style={styles.startingText}>LE DUEL COMMENCE...</Text>
              </View>
            ) : me?.isReady && opponent?.isReady ? (
              <View style={styles.readyStatus}>
                <Text style={styles.readyStatusText}>LES 2 JOUEURS SONT PRETS !</Text>
                <Text style={styles.readySubtext}>Lancement automatique...</Text>
              </View>
            ) : (
              <View style={styles.waitingStatus}>
                <ActivityIndicator color="#ffaa00" size="small" />
                <Text style={styles.waitingStatusText}>
                  En attente que les 2 joueurs soient prets...
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 16,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#ff6666',
    fontSize: 14,
  },
  gameName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  workflowSection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.2)',
  },
  sectionTitle: {
    color: '#ffaa00',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  workflowSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#ffaa00',
    borderColor: '#ffaa00',
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(255, 170, 0, 0.3)',
    borderColor: '#ffaa00',
  },
  stepNumber: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#1a1a2e',
  },
  stepNumberCompleted: {
    color: '#ffaa00',
  },
  stepLabel: {
    color: '#666',
    fontSize: 10,
    marginLeft: 4,
    marginRight: 4,
  },
  stepLabelActive: {
    color: '#ffaa00',
  },
  stepLabelCompleted: {
    color: '#ffaa00',
    opacity: 0.7,
  },
  stepConnector: {
    width: 16,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 2,
  },
  lobbyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  duelArena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  playerSlot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  mySlot: {
    borderColor: 'rgba(0, 170, 255, 0.5)',
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffaa00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#1a1a2e',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerLevel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  readyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readyBadgeYes: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  readyBadgeNo: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  readyTextYes: {
    color: '#00ff88',
  },
  readyTextNo: {
    color: '#ffaa00',
  },
  emptyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  waitingText: {
    color: '#666',
    fontSize: 14,
  },
  vsContainer: {
    width: 60,
    alignItems: 'center',
  },
  vsText: {
    color: '#ffaa00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  countdownContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffaa00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    color: '#1a1a2e',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusSection: {
    alignItems: 'center',
  },
  startingStatus: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffaa00',
  },
  startingText: {
    color: '#ffaa00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  readyStatus: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  readyStatusText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
  },
  readySubtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  waitingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waitingStatusText: {
    color: '#ffaa00',
    fontSize: 14,
  },
});
