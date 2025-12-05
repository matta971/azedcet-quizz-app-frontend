import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { LogoHeader } from '../../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface GameCategory {
  id: string;
  title: string;
  icon: string;
  games: string[];
  color: string;
}

const GAME_CATEGORIES: GameCategory[] = [
  {
    id: 'reflexe',
    title: 'REFLEXE & PRESSION',
    icon: 'bolt',
    games: ['Smash A / Smash B', 'Duel', 'Marathon', 'Sprint Final'],
    color: '#00ff88',
  },
  {
    id: 'strategie',
    title: 'STRATEGIE & THEMES',
    icon: 'target',
    games: ['Panier', 'Relais', 'Saut Patriotique', 'Cappeira', 'CIME'],
    color: '#00ff88',
  },
  {
    id: 'enigmes',
    title: 'ENIGMES & INDICES',
    icon: 'question',
    games: ['Jackpot', 'Identification', 'Estocade', 'Tirs au But'],
    color: '#00ff88',
  },
  {
    id: 'parcours',
    title: 'PARCOURS & EXPLORATION',
    icon: 'compass',
    games: ['Randonnee Lexicale', 'Echappee'],
    color: '#00ff88',
  },
];

export function GameModesScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleCategoryPress = (category: GameCategory) => {
    // Navigate to game list for this category
    navigation.navigate('GameList', { categoryId: category.id });
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'bolt':
        return <Text style={styles.iconText}>⚡</Text>;
      case 'target':
        return <Text style={styles.iconText}>◎</Text>;
      case 'question':
        return <Text style={styles.iconText}>?</Text>;
      case 'compass':
        return <Text style={styles.iconText}>◉</Text>;
      default:
        return <Text style={styles.iconText}>●</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.navBar}>
            <LogoHeader size="small" />
            <View style={styles.navLinks}>
              <Text style={styles.navLink}>Accueil</Text>
              <Text style={[styles.navLink, styles.navLinkActive]}>Modes</Text>
              <Text style={styles.navLink}>Classement</Text>
              <Text style={styles.navLink}>Mon Equipe</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>CHOISISSEZ VOTRE MODE DE JEU</Text>

          <View style={styles.categoriesGrid}>
            {GAME_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.iconContainer}>
                    {renderIcon(category.icon)}
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                <View style={styles.gamesList}>
                  {category.games.map((game, index) => (
                    <Text key={index} style={styles.gameName}>
                      {game}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2;

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
    paddingBottom: 16,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  navLink: {
    color: '#888',
    fontSize: 12,
  },
  navLinkActive: {
    color: '#00ff88',
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 24,
    letterSpacing: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: cardWidth,
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    color: '#00ff88',
    fontSize: 20,
  },
  categoryTitle: {
    color: '#00ff88',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    letterSpacing: 0.5,
  },
  gamesList: {
    gap: 4,
  },
  gameName: {
    color: '#ccc',
    fontSize: 12,
  },
});
