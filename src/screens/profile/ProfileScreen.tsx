import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TeamInfo {
  name: string;
  role: string;
  level: number;
  icon: string;
}

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuthStore();

  // Mock data - would come from user profile API
  const profileData = {
    handle: user?.handle || 'NovaPrime',
    level: 42,
    season: 1,
    scoreGlobal: 13250,
    scoreSaison: 1420,
    winrate: '33.4',
    favoriteModes: 'Reflexe',
    teams: [
      { name: 'Excellence', role: 'Stratege', level: 30, icon: 'E' },
      { name: 'Phantom', role: 'Membre', level: 25, icon: 'P' },
      { name: 'Astral', role: 'Capitaine', level: 28, icon: 'A' },
    ] as TeamInfo[],
    recentStats: {
      wins: ['+14', '+20'],
      matches: ['144', '110'],
      ranking: ['138 -> 118', '103 -> 113'],
    },
  };

  const handleEditProfile = () => {
    navigation.navigate('Settings' as any);
  };

  const handleChangeAvatar = () => {
    // Navigate to avatar selection
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  const renderTeamCard = (team: TeamInfo, index: number) => (
    <TouchableOpacity key={index} style={styles.teamCard}>
      <View style={styles.teamIcon}>
        <Text style={styles.teamIconText}>{team.icon}</Text>
      </View>
      <Text style={styles.teamName}>{team.name}</Text>
      <Text style={styles.teamRole}>{team.role}</Text>
      <Text style={styles.teamLevel}>Niveau {team.level}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.headerTitle}>MINDSOCCER</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar and Name */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profileData.handle.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.avatarGlow} />
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.playerName}>{profileData.handle}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Niveau {profileData.level}</Text>
                  <View style={styles.seasonBadge}>
                    <Text style={styles.seasonText}>Saison {profileData.season}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Scores */}
            <View style={styles.scoresSection}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>SCORE GLOBAL</Text>
                <Text style={styles.scoreValue}>
                  {profileData.scoreGlobal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>SCORE SAISON</Text>
                <Text style={[styles.scoreValue, styles.scoreValueYellow]}>
                  {profileData.scoreSaison.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <Text style={styles.statText}>Winrate</Text>
              <Text style={styles.statValue}>{profileData.winrate}s</Text>
              <Text style={styles.statText}>Favoref modes</Text>
            </View>

            {/* Teams Section */}
            <View style={styles.teamsSection}>
              {profileData.teams.map((team, index) => renderTeamCard(team, index))}
            </View>

            {/* Recent Stats */}
            <View style={styles.recentStats}>
              <View style={styles.recentStatsColumn}>
                {profileData.recentStats.wins.map((win, i) => (
                  <Text key={i} style={styles.recentStatGreen}>
                    {win}
                  </Text>
                ))}
              </View>
              <View style={styles.recentStatsColumn}>
                {profileData.recentStats.matches.map((match, i) => (
                  <Text key={i} style={styles.recentStatWhite}>
                    {match}
                  </Text>
                ))}
              </View>
              <View style={styles.recentStatsColumn}>
                {profileData.recentStats.ranking.map((rank, i) => (
                  <Text key={i} style={styles.recentStatYellow}>
                    {rank}
                  </Text>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.actionButtonText}>MODIFIER PROFIL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleChangeAvatar}
              >
                <Text style={styles.actionButtonText}>CHANGER AVATAR</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>DECONNEXION</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    color: '#00ff88',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  profileCard: {
    backgroundColor: 'rgba(10, 10, 26, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    padding: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00ff88',
  },
  avatarText: {
    color: '#00ff88',
    fontSize: 32,
    fontWeight: 'bold',
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  nameSection: {
    flex: 1,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    color: '#00ff88',
    fontSize: 14,
    marginRight: 12,
  },
  seasonBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  seasonText: {
    color: '#00ff88',
    fontSize: 12,
  },
  scoresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreBox: {
    flex: 1,
  },
  scoreLabel: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreValueYellow: {
    color: '#ffd700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  statText: {
    color: '#888',
    fontSize: 12,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  teamsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamCard: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamIconText: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamName: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teamRole: {
    color: '#888',
    fontSize: 11,
    marginBottom: 2,
  },
  teamLevel: {
    color: '#666',
    fontSize: 10,
  },
  recentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  recentStatsColumn: {
    alignItems: 'center',
  },
  recentStatGreen: {
    color: '#00ff88',
    fontSize: 14,
    marginBottom: 4,
  },
  recentStatWhite: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  recentStatYellow: {
    color: '#ffd700',
    fontSize: 14,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ff88',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
