import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { GAMES_BY_CATEGORY, GameType } from '../gamelist/GameListScreen';
import { useMatchStore } from '../../stores';
import { MatchResponse } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OpponentSelectRouteProp = RouteProp<RootStackParamList, 'OpponentSelect'>;

export function OpponentSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OpponentSelectRouteProp>();
  const { gameId, categoryId, gameType, teamId, teamName, maxPlayersPerTeam, isRanked } = route.params;

  const { waitingMatches, fetchWaitingMatches, joinMatch, createMatch, isLoading: storeLoading } = useMatchStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoiningMatch, setIsJoiningMatch] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const category = GAMES_BY_CATEGORY[categoryId];
  const game = category?.games.find((g) => g.id === gameId);

  const isTeamGame = gameType === 'A';

  useEffect(() => {
    fetchWaitingMatches();
  }, []);

  // Filter matches based on game type and maxPlayersPerTeam
  const filteredMatches = waitingMatches.filter((match) => {
    if (isTeamGame) {
      // For team games, show matches with same maxPlayersPerTeam (or all if not specified)
      return maxPlayersPerTeam ? match.maxPlayersPerTeam === maxPlayersPerTeam : match.maxPlayersPerTeam > 1;
    } else {
      // For duels (1v1), show only 1v1 matches
      return match.maxPlayersPerTeam === 1;
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWaitingMatches();
    setIsRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleJoinExistingMatch = async () => {
    if (!selectedMatchId) return;

    setIsJoiningMatch(true);

    // Join the selected match (will be placed in Team B)
    const match = await joinMatch(selectedMatchId, 'B');

    setIsJoiningMatch(false);

    if (match) {
      navigation.navigate('MatchWaiting', {
        matchId: match.id,
      });
    }
  };

  const handleCreateNewMatch = async () => {
    setIsJoiningMatch(true);

    // Create a new match with the configured parameters
    const match = await createMatch({
      mode: 'CLASSIC',
      maxPlayersPerTeam: maxPlayersPerTeam || 3,
      ranked: isRanked ?? true,
    });

    setIsJoiningMatch(false);

    if (match) {
      navigation.navigate('MatchWaiting', {
        matchId: match.id,
      });
    }
  };

  const getWorkflowSteps = () => {
    if (gameType === 'A') {
      return [
        { step: 1, label: 'Regles', completed: true },
        { step: 2, label: 'Equipe', completed: true },
        { step: 3, label: 'Adversaire', active: true },
        { step: 4, label: 'Lobby' },
        { step: 5, label: 'Match' },
      ];
    } else {
      return [
        { step: 1, label: 'Regles', completed: true },
        { step: 2, label: 'Adversaire', active: true },
        { step: 3, label: 'Lobby duel' },
        { step: 4, label: 'Match' },
      ];
    }
  };

  const getMatchStatus = (match: MatchResponse) => {
    if (match.teamA.isFull) return 'full';
    return 'waiting';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return '#00ff88';
      case 'full':
        return '#ffaa00';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'En attente';
      case 'full': return 'Equipe A complete';
      default: return status;
    }
  };

  const workflowSteps = getWorkflowSteps();

  const renderMatchCard = (match: MatchResponse) => {
    const isSelected = selectedMatchId === match.id;
    const status = getMatchStatus(match);
    const captainName = match.teamA.players.length > 0
      ? match.teamA.players.find(p => p.id === match.teamA.captainId)?.handle || match.teamA.players[0].handle
      : 'Inconnu';

    return (
      <TouchableOpacity
        key={match.id}
        style={[
          styles.opponentCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => setSelectedMatchId(match.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.opponentName}>
              Equipe de {captainName}
            </Text>
            <Text style={styles.opponentDetail}>
              {match.teamA.playerCount}/{match.maxPlayersPerTeam} joueurs • {match.maxPlayersPerTeam}v{match.maxPlayersPerTeam} • {match.ranked ? 'Ranked' : 'Casual'}
            </Text>
            <Text style={styles.matchCode}>
              Code: {match.code}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20', borderColor: getStatusColor(status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {getStatusLabel(status)}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓ Selectionne</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          {game && (
            <Text style={styles.gameName}>{game.name}</Text>
          )}
          {isTeamGame && teamName && (
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>Votre equipe: {teamName}</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00ff88"
            />
          }
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

          {/* Title with refresh button */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {isTeamGame ? 'MATCHS EN ATTENTE' : 'DUELS DISPONIBLES'}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isRefreshing || storeLoading}
              activeOpacity={0.7}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#00ff88" />
              ) : (
                <Text style={styles.refreshIcon}>↻</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {isTeamGame
              ? `Rejoignez un match existant ou creez le votre (${maxPlayersPerTeam || 3}v${maxPlayersPerTeam || 3})`
              : 'Rejoignez un duel existant ou creez le votre'
            }
          </Text>

          {/* Create New Match Button */}
          <TouchableOpacity
            style={styles.createMatchButton}
            onPress={handleCreateNewMatch}
            disabled={isJoiningMatch}
            activeOpacity={0.8}
          >
            <Text style={styles.createMatchIcon}>+</Text>
            <View style={styles.createMatchText}>
              <Text style={styles.createMatchTitle}>CREER UN NOUVEAU MATCH</Text>
              <Text style={styles.createMatchDesc}>
                {isTeamGame
                  ? `Match ${maxPlayersPerTeam || 3}v${maxPlayersPerTeam || 3} ${isRanked ? 'Ranked' : 'Casual'}`
                  : `Duel 1v1 ${isRanked ? 'Ranked' : 'Casual'}`
                }
              </Text>
            </View>
          </TouchableOpacity>

          {/* Matches List */}
          {storeLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingText}>Chargement des matchs...</Text>
            </View>
          ) : filteredMatches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun match en attente</Text>
              <Text style={styles.emptySubtext}>Creez le votre ci-dessus !</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>OU REJOIGNEZ UN MATCH EXISTANT</Text>
              {filteredMatches.map(match => renderMatchCard(match))}
            </View>
          )}
        </ScrollView>

        {/* Join Match Button - only show when a match is selected */}
        {selectedMatchId && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.challengeButton, isJoiningMatch && styles.challengeButtonDisabled]}
              onPress={handleJoinExistingMatch}
              disabled={isJoiningMatch}
              activeOpacity={0.8}
            >
              {isJoiningMatch ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.challengeButtonText}>
                  REJOINDRE CE MATCH
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#00ff88',
    fontSize: 14,
  },
  gameName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  teamBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  teamBadgeText: {
    color: '#00ff88',
    fontSize: 12,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderWidth: 1,
    borderColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    color: '#00ff88',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
  listContainer: {
    gap: 12,
  },
  opponentCard: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  selectedCard: {
    borderColor: '#00ff88',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  unavailableCard: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  opponentName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unavailableText: {
    color: '#888',
  },
  opponentDetail: {
    color: '#888',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 136, 0.3)',
  },
  selectedText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  challengeButton: {
    backgroundColor: '#ffaa00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  challengeButtonDisabled: {
    backgroundColor: '#333',
  },
  challengeButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#00ff88',
    borderStyle: 'dashed',
  },
  createMatchIcon: {
    color: '#00ff88',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  createMatchText: {
    flex: 1,
  },
  createMatchTitle: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  createMatchDesc: {
    color: '#888',
    fontSize: 12,
  },
  matchCode: {
    color: '#00ff88',
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  listTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
});
