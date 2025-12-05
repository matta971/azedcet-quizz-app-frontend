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
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useMatchStore, useAuthStore, useGameStore } from '../../stores';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { MatchResponse, TeamSide } from '../../types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Lobby'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function LobbyScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const {
    waitingMatches,
    isLoading,
    error,
    fetchWaitingMatches,
    joinMatch,
    joinMatchByCode,
  } = useMatchStore();
  const { startGame } = useGameStore();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchWaitingMatches();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWaitingMatches();
    setIsRefreshing(false);
  };

  const handleCreateMatch = () => {
    // Navigate to game modes selection instead of creating directly
    navigation.navigate('GameModes');
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
            {item.ranked && <Text style={styles.matchRanked}>{t('lobby.ranked').toUpperCase()}</Text>}
            {item.duo && <Text style={styles.matchDuo}>1v1</Text>}
          </View>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchPlayers}>
            {totalPlayers}/{maxPlayers} {t('games.players')} ({item.maxPlayersPerTeam}v{item.maxPlayersPerTeam})
          </Text>
        </View>
        <View style={styles.teamsPreview}>
          <Text style={styles.teamText}>
            A: {item.teamA.playerCount}/{item.maxPlayersPerTeam} {item.teamA.isFull ? '✓' : ''} - {item.teamA.players.map((p) => p.handle).join(', ') || t('match.waitingForPlayers')}
          </Text>
          <Text style={styles.teamText}>
            B: {item.teamB.playerCount}/{item.maxPlayersPerTeam} {item.teamB.isFull ? '✓' : ''} - {item.teamB.players.map((p) => p.handle).join(', ') || t('match.waitingForPlayers')}
          </Text>
        </View>
        {item.canStart && (
          <Text style={styles.matchReady}>{t('match.canStart')}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.welcome')}, {user?.handle}!</Text>
        <Text style={styles.title}>{t('lobby.title')}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreateMatch}
        >
          <Text style={styles.actionButtonText}>{t('lobby.createMatch')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => setShowJoinModal(true)}
        >
          <Text style={styles.actionButtonTextSecondary}>{t('lobby.joinByCode')}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('lobby.waitingMatches')}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#00ff88" />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={waitingMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#00ff88" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('lobby.noMatches')}</Text>
            <Text style={styles.emptySubtext}>{t('lobby.createMatch')}!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Join by Code Modal */}
      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('lobby.joinByCode')}</Text>
            <TextInput
              style={styles.codeInput}
              placeholder={t('lobby.matchCode').toUpperCase()}
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
                <Text style={styles.modalButtonText}>{t('lobby.joinMatch')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowJoinModal(false);
                setJoinCode('');
              }}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
});
