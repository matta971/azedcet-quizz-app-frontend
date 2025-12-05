import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMatchStore, useAuthStore, useGameStore } from '../../stores';
import { RootStackParamList } from '../../navigation/types';
import { MatchResponse, TeamSide } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LobbyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const {
    waitingMatches,
    isLoading,
    error,
    fetchWaitingMatches,
    createMatch,
    joinMatch,
    joinMatchByCode,
  } = useMatchStore();
  const { startGame } = useGameStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedTeamSize, setSelectedTeamSize] = useState(3);
  const [isRanked, setIsRanked] = useState(true);

  useEffect(() => {
    fetchWaitingMatches();
  }, []);

  const handleRefresh = () => {
    fetchWaitingMatches();
  };

  const handleCreateMatch = async () => {
    const match = await createMatch({
      mode: 'CLASSIC',
      maxPlayersPerTeam: selectedTeamSize,
      ranked: isRanked,
    });
    if (match) {
      setShowCreateModal(false);
      navigation.navigate('MatchWaiting', { matchId: match.id });
    }
  };

  const handleJoinMatch = async (matchId: string, preferredSide?: TeamSide) => {
    const match = await joinMatch(matchId, preferredSide);
    if (match) {
      if (match.status === 'PLAYING') {
        await startGame(matchId);
        navigation.navigate('Game', { matchId });
      } else {
        navigation.navigate('MatchWaiting', { matchId });
      }
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    const match = await joinMatchByCode(joinCode.trim().toUpperCase());
    if (match) {
      setShowJoinModal(false);
      setJoinCode('');
      if (match.status === 'PLAYING') {
        await startGame(match.id);
        navigation.navigate('Game', { matchId: match.id });
      } else {
        navigation.navigate('MatchWaiting', { matchId: match.id });
      }
    }
  };

  const renderMatch = ({ item }: { item: MatchResponse }) => {
    const totalPlayers = item.teamA.playerCount + item.teamB.playerCount;
    const maxPlayers = item.maxPlayersPerTeam * 2;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => handleJoinMatch(item.id)}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.matchCode}>{item.code}</Text>
          <View style={styles.matchBadges}>
            {item.ranked && <Text style={styles.matchRanked}>RANKED</Text>}
            {item.duo && <Text style={styles.matchDuo}>1v1</Text>}
          </View>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchPlayers}>
            {totalPlayers}/{maxPlayers} joueurs ({item.maxPlayersPerTeam}v{item.maxPlayersPerTeam})
          </Text>
        </View>
        <View style={styles.teamsPreview}>
          <Text style={styles.teamText}>
            A: {item.teamA.playerCount}/{item.maxPlayersPerTeam} {item.teamA.isFull ? '✓' : ''} - {item.teamA.players.map((p) => p.handle).join(', ') || 'En attente...'}
          </Text>
          <Text style={styles.teamText}>
            B: {item.teamB.playerCount}/{item.maxPlayersPerTeam} {item.teamB.isFull ? '✓' : ''} - {item.teamB.players.map((p) => p.handle).join(', ') || 'En attente...'}
          </Text>
        </View>
        {item.canStart && (
          <Text style={styles.matchReady}>Prêt à démarrer</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Salut, {user?.handle}!</Text>
        <Text style={styles.title}>Lobby</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.actionButtonText}>Créer un match</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => setShowJoinModal(true)}
        >
          <Text style={styles.actionButtonTextSecondary}>Rejoindre par code</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Matchs en attente</Text>

      <FlatList
        data={waitingMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#00ff88" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun match disponible</Text>
            <Text style={styles.emptySubtext}>Créez le vôtre !</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Create Match Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer un match</Text>

            <Text style={styles.modalLabel}>Joueurs par équipe</Text>
            <View style={styles.teamSizeSelector}>
              {[1, 2, 3, 4, 5].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.teamSizeButton,
                    selectedTeamSize === size && styles.teamSizeButtonActive,
                  ]}
                  onPress={() => setSelectedTeamSize(size)}
                >
                  <Text
                    style={[
                      styles.teamSizeButtonText,
                      selectedTeamSize === size && styles.teamSizeButtonTextActive,
                    ]}
                  >
                    {size}v{size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.rankedToggle}
              onPress={() => setIsRanked(!isRanked)}
            >
              <View style={[styles.checkbox, isRanked && styles.checkboxActive]}>
                {isRanked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rankedLabel}>Match classé (Ranked)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreateMatch}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.modalButtonText}>
                  Créer ({selectedTeamSize}v{selectedTeamSize})
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join by Code Modal */}
      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rejoindre par code</Text>
            <TextInput
              style={styles.codeInput}
              placeholder="CODE"
              placeholderTextColor="#666"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.modalButton, !joinCode.trim() && styles.modalButtonDisabled]}
              onPress={handleJoinByCode}
              disabled={!joinCode.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.modalButtonText}>Rejoindre</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowJoinModal(false);
                setJoinCode('');
              }}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  actionButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  actionButtonTextSecondary: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchCode: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  matchRanked: {
    backgroundColor: '#ffd700',
    color: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  matchPlayers: {
    color: '#fff',
    fontSize: 14,
  },
  matchDuo: {
    backgroundColor: '#00ff88',
    color: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchReady: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  teamsPreview: {
    gap: 4,
  },
  teamText: {
    color: '#888',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#00ff88',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  modalCancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#888',
  },
  codeInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  modalLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  teamSizeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamSizeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
    alignItems: 'center',
  },
  teamSizeButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  teamSizeButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamSizeButtonTextActive: {
    color: '#1a1a2e',
  },
  rankedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0f3460',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  checkmark: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  rankedLabel: {
    color: '#fff',
    fontSize: 14,
  },
});
