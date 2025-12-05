import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { GAMES_BY_CATEGORY } from '../gamelist/GameListScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TeamLobbyRouteProp = RouteProp<RootStackParamList, 'TeamLobby'>;

interface Player {
  id: string;
  name: string;
  isCaptain: boolean;
  isReady: boolean;
}

interface TeamData {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
}

export function TeamLobbyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TeamLobbyRouteProp>();
  const { gameId, categoryId, myTeamId, myTeamName, opponentTeamId, opponentTeamName } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [myTeam, setMyTeam] = useState<TeamData | null>(null);
  const [opponentTeam, setOpponentTeam] = useState<TeamData | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);

  const category = GAMES_BY_CATEGORY[categoryId];
  const game = category?.games.find((g) => g.id === gameId);

  useEffect(() => {
    loadLobbyData();
    // TODO: Subscribe to WebSocket for real-time updates
  }, []);

  const loadLobbyData = async () => {
    setIsLoading(true);
    // TODO: Call API to get lobby data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data - in production this comes from the backend
    setMyTeam({
      id: myTeamId,
      name: myTeamName,
      players: [
        { id: 'me', name: 'Moi (Capitaine)', isCaptain: true, isReady: true },
        { id: 'player2', name: 'Joueur2', isCaptain: false, isReady: true },
      ],
      maxPlayers: 5,
    });

    setOpponentTeam({
      id: opponentTeamId,
      name: opponentTeamName,
      players: [
        { id: 'opp1', name: 'Adversaire1 (Cap)', isCaptain: true, isReady: true },
        { id: 'opp2', name: 'Adversaire2', isCaptain: false, isReady: false },
        { id: 'opp3', name: 'Adversaire3', isCaptain: false, isReady: true },
      ],
      maxPlayers: 5,
    });

    setIsCaptain(true); // Mock: current user is captain
    setIsLoading(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLaunchGame = async () => {
    if (!isCaptain) return;

    setIsLaunching(true);
    // TODO: Call API to start the match
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Navigate to game screen
    navigation.replace('Game', { matchId: `match_${Date.now()}` });
  };

  const getWorkflowSteps = () => [
    { step: 1, label: 'Regles', completed: true },
    { step: 2, label: 'Equipe', completed: true },
    { step: 3, label: 'Adversaire', completed: true },
    { step: 4, label: 'Lobby', active: true },
    { step: 5, label: 'Match' },
  ];

  const isLobbyReady = () => {
    if (!myTeam || !opponentTeam) return false;
    // Both teams must have at least 1 player and all must be ready
    const myTeamReady = myTeam.players.length > 0 && myTeam.players.every(p => p.isReady);
    const opponentReady = opponentTeam.players.length > 0 && opponentTeam.players.every(p => p.isReady);
    return myTeamReady && opponentReady;
  };

  const renderTeam = (team: TeamData, isMyTeam: boolean) => (
    <View style={[styles.teamCard, isMyTeam && styles.myTeamCard]}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamCount}>
          {team.players.length}/{team.maxPlayers}
        </Text>
      </View>

      <View style={styles.playersList}>
        {team.players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              {player.isCaptain && (
                <View style={styles.captainBadge}>
                  <Text style={styles.captainText}>CAP</Text>
                </View>
              )}
            </View>
            <View style={[
              styles.readyIndicator,
              player.isReady ? styles.readyYes : styles.readyNo
            ]}>
              <Text style={styles.readyText}>
                {player.isReady ? 'PRET' : 'EN ATTENTE'}
              </Text>
            </View>
          </View>
        ))}

        {/* Empty slots */}
        {Array(Math.max(0, team.maxPlayers - team.players.length))
          .fill(null)
          .map((_, i) => (
            <View key={`empty-${i}`} style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Slot disponible</Text>
            </View>
          ))}
      </View>
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
            <ActivityIndicator size="large" color="#00ff88" />
            <Text style={styles.loadingText}>Connexion au lobby...</Text>
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
            <Text style={styles.backText}>← Quitter le lobby</Text>
          </TouchableOpacity>
          {game && (
            <Text style={styles.gameName}>{game.name}</Text>
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Lobby Title */}
          <Text style={styles.lobbyTitle}>LOBBY COMMUN</Text>
          <Text style={styles.lobbySubtitle}>
            Attente que les 2 equipes soient completes
          </Text>

          {/* Teams Display */}
          <View style={styles.teamsContainer}>
            {myTeam && renderTeam(myTeam, true)}

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {opponentTeam && renderTeam(opponentTeam, false)}
          </View>

          {/* Status */}
          <View style={styles.statusSection}>
            {isLobbyReady() ? (
              <View style={styles.readyStatus}>
                <Text style={styles.readyStatusText}>TOUS LES JOUEURS SONT PRETS !</Text>
              </View>
            ) : (
              <View style={styles.waitingStatus}>
                <ActivityIndicator color="#ffaa00" size="small" />
                <Text style={styles.waitingStatusText}>En attente des joueurs...</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer with Launch Button */}
        <View style={styles.footer}>
          {isCaptain ? (
            <TouchableOpacity
              style={[
                styles.launchButton,
                !isLobbyReady() && styles.launchButtonDisabled
              ]}
              onPress={handleLaunchGame}
              disabled={!isLobbyReady() || isLaunching}
              activeOpacity={0.8}
            >
              {isLaunching ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.launchButtonText}>
                  {isLobbyReady() ? 'LANCER LE JEU' : 'EN ATTENTE...'}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingForCaptain}>
              <Text style={styles.waitingForCaptainText}>
                En attente du capitaine pour lancer le jeu...
              </Text>
            </View>
          )}
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
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  workflowSection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  sectionTitle: {
    color: '#00ff88',
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
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(0, 255, 136, 0.3)',
    borderColor: '#00ff88',
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
    color: '#00ff88',
  },
  stepLabel: {
    color: '#666',
    fontSize: 10,
    marginLeft: 4,
    marginRight: 4,
  },
  stepLabelActive: {
    color: '#00ff88',
  },
  stepLabelCompleted: {
    color: '#00ff88',
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
    marginBottom: 8,
  },
  lobbySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  teamsContainer: {
    gap: 16,
  },
  teamCard: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  myTeamCard: {
    borderColor: 'rgba(0, 255, 136, 0.5)',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamCount: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playersList: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 14,
  },
  captainBadge: {
    backgroundColor: '#ffaa00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  captainText: {
    color: '#1a1a2e',
    fontSize: 10,
    fontWeight: 'bold',
  },
  readyIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readyYes: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  readyNo: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
  },
  readyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  emptySlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  vsText: {
    color: '#ffaa00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  readyStatus: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  readyStatusText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
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
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  launchButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  launchButtonDisabled: {
    backgroundColor: '#333',
  },
  launchButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  waitingForCaptain: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  waitingForCaptainText: {
    color: '#ffaa00',
    fontSize: 14,
  },
});
