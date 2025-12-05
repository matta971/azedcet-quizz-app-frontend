import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type FilterType = 'monde' | 'pays' | 'equipes' | 'joueurs' | 'amis';

interface LeaderboardEntry {
  rank: number;
  name: string;
  team: string;
  scoreGlobal: number;
  scoreSaison: number;
  winrate: string;
  tier: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Marc Lefevre', team: 'Noctis', scoreGlobal: 13250, scoreSaison: 1390, winrate: '5.5', tier: 'A1' },
  { rank: 2, name: 'Kaori Tanaka', team: 'Nepronix', scoreGlobal: 12650, scoreSaison: 1390, winrate: '4.9', tier: 'A3' },
  { rank: 3, name: 'Jean Boussetu', team: 'Thunderwave', scoreGlobal: 12250, scoreSaison: 1320, winrate: '4.6', tier: 'A3' },
  { rank: 4, name: 'Robert Brennan', team: 'Celestials', scoreGlobal: 11600, scoreSaison: 1310, winrate: '4.8', tier: 'A5' },
  { rank: 5, name: 'Jurgen Bernheim', team: 'Phantom', scoreGlobal: 11300, scoreSaison: 1310, winrate: '5.2', tier: 'A3' },
  { rank: 6, name: 'Emma Moreau', team: 'Astral', scoreGlobal: 11200, scoreSaison: 1310, winrate: '5.6', tier: 'A4' },
  { rank: 7, name: 'Benoit Bernard', team: 'Oceanus', scoreGlobal: 11200, scoreSaison: 1310, winrate: '5.8', tier: 'A4' },
  { rank: 8, name: 'Sophie Martin', team: 'Bernhardt', scoreGlobal: 11100, scoreSaison: 1210, winrate: '5.3', tier: 'A4' },
];

export function LeaderboardScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('monde');
  const userRank = 138;
  const userProgression = +12;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'monde', label: 'MONDE' },
    { key: 'pays', label: 'PAYS' },
    { key: 'equipes', label: 'EQUIPES' },
    { key: 'joueurs', label: 'JOUEURS' },
    { key: 'amis', label: 'AMIS' },
  ];

  const renderHeader = () => (
    <>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <Text style={styles.logoText}>MINDSOCCER</Text>
        <View style={styles.navLinks}>
          <Text style={styles.navLink}>ACCUEIL</Text>
          <Text style={styles.navLink}>MODES</Text>
          <Text style={[styles.navLink, styles.navLinkActive]}>CLASSEMENT</Text>
          <Text style={styles.navLink}>MON EQUIPE</Text>
          <Text style={styles.navLink}>PROFIL</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>CLASSEMENT GLOBAL</Text>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User Position */}
      <View style={styles.userPositionCard}>
        <Text style={styles.userPositionText}>
          VOTRE POSITION: RANG {userRank}, PROGRESSION{' '}
          <Text style={styles.progressionPositive}>+{userProgression}</Text>
        </Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colRank]}>RANG</Text>
        <Text style={[styles.tableHeaderText, styles.colAvatar]}>AVATAR</Text>
        <Text style={[styles.tableHeaderText, styles.colName]}>NOM</Text>
        <Text style={[styles.tableHeaderText, styles.colTeam]}>EQUIPE</Text>
        <Text style={[styles.tableHeaderText, styles.colScore]}>SCORE GLOBAL</Text>
        <Text style={[styles.tableHeaderText, styles.colSeason]}>SCORE SAISON</Text>
        <Text style={[styles.tableHeaderText, styles.colWinrate]}>VICTOIRES</Text>
      </View>
    </>
  );

  const renderItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.colRank, styles.rankText]}>
        {item.rank}
      </Text>
      <View style={[styles.colAvatar, styles.avatarContainer]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.teamBadge}>
          <Text style={styles.teamBadgeText}>
            {item.team.charAt(0)}
          </Text>
        </View>
      </View>
      <Text style={[styles.tableCell, styles.colName, styles.nameText]}>
        {item.name}
      </Text>
      <Text style={[styles.tableCell, styles.colTeam, styles.teamText]}>
        {item.team}
      </Text>
      <Text style={[styles.tableCell, styles.colScore]}>
        {item.scoreGlobal.toLocaleString()}
      </Text>
      <Text style={[styles.tableCell, styles.colSeason, styles.seasonScoreText]}>
        {item.scoreSaison}
      </Text>
      <View style={[styles.colWinrate, styles.winrateContainer]}>
        <Text style={styles.winrateText}>{item.winrate}</Text>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{item.tier}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
        style={styles.gradient}
      >
        <FlatList
          data={MOCK_LEADERBOARD}
          renderItem={renderItem}
          keyExtractor={(item) => item.rank.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 32,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  navLink: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  navLinkActive: {
    color: '#00ff88',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00ff88',
  },
  filterText: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  userPositionCard: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  userPositionText: {
    color: '#00ff88',
    fontSize: 13,
    letterSpacing: 1,
  },
  progressionPositive: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  tableHeaderText: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    color: '#ffffff',
    fontSize: 12,
  },
  colRank: {
    width: 40,
    textAlign: 'center',
  },
  colAvatar: {
    width: 50,
    alignItems: 'center',
  },
  colName: {
    flex: 1.5,
  },
  colTeam: {
    flex: 1,
  },
  colScore: {
    flex: 1,
    textAlign: 'center',
  },
  colSeason: {
    flex: 1,
    textAlign: 'center',
  },
  colWinrate: {
    width: 60,
    alignItems: 'center',
  },
  rankText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  avatarText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamBadgeText: {
    color: '#1a1a2e',
    fontSize: 8,
    fontWeight: 'bold',
  },
  nameText: {
    fontWeight: '600',
  },
  teamText: {
    color: '#00ff88',
  },
  seasonScoreText: {
    color: '#ffd700',
  },
  winrateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winrateText: {
    color: '#ffffff',
    fontSize: 12,
  },
  tierBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: {
    color: '#1a1a2e',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
