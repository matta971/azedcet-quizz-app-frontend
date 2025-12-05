import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameListRouteProp = RouteProp<RootStackParamList, 'GameList'>;

// Game types according to specs
export type GameType = 'A' | 'B' | 'C';
// A = Team vs Team
// B = 1v1 Duel
// C = Solo

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  type: GameType;
  players: string;
  duration: string;
  rules: string[];
  victory: string;
}

const GAMES_BY_CATEGORY: Record<string, { title: string; icon: string; games: GameInfo[] }> = {
  reflexe: {
    title: 'REFLEXE & PRESSION',
    icon: '⚡',
    games: [
      {
        id: 'smash_a',
        name: 'Smash A',
        description: 'Collez l\'equipe adverse avec une question verifiable',
        type: 'A',
        players: '1-5 vs 1-5',
        duration: '3-5 min',
        rules: [
          'Concertation autorisee (chat interne)',
          'Pas de limite de temps pour se concerter',
          '3 secondes apres "Top!" pour annoncer la question',
          'Depassement = +10 points adverse',
        ],
        victory: 'L\'equipe totalisant le plus de points',
      },
      {
        id: 'smash_b',
        name: 'Smash B',
        description: 'Mode pression pure sans concertation',
        type: 'A',
        players: '1-5 vs 1-5',
        duration: '3-5 min',
        rules: [
          'Pas de concertation',
          'Chrono strict',
          '3 secondes pour annoncer la question',
          'Depassement = +10 points adverse',
        ],
        victory: 'L\'equipe la plus rapide',
      },
      {
        id: 'duel',
        name: 'Duel Linguistique',
        description: 'Face-a-face base sur vitesse et connaissances',
        type: 'B',
        players: '1v1',
        duration: '3-5 min',
        rules: [
          '1 question par round',
          '3 a 10 rounds',
          'Le plus rapide marque des points',
          'Bonne = +10 | Mauvaise = -5',
        ],
        victory: 'Le joueur avec le plus de points',
      },
      {
        id: 'marathon',
        name: 'Marathon Solo',
        description: 'Endurance mentale',
        type: 'C',
        players: 'Solo',
        duration: '10+ min',
        rules: [
          '10 questions',
          'Pas de chrono',
          'Score cumule',
        ],
        victory: 'Score personnel',
      },
      {
        id: 'sprint',
        name: 'Sprint Final',
        description: 'Phase finale ultra-rapide',
        type: 'A',
        players: '1-5 vs 1-5',
        duration: '2-3 min',
        rules: [
          '20 questions eclair',
          'Temps ultra court',
          'Bonne = +2 | Mauvaise = -1',
        ],
        victory: 'L\'equipe avec le meilleur score',
      },
    ],
  },
  strategie: {
    title: 'STRATEGIE & THEMES',
    icon: '◎',
    games: [
      {
        id: 'panier',
        name: 'Panier',
        description: '4 questions, un tireur unique',
        type: 'A',
        players: '2-4 vs 2-4',
        duration: '5-10 min',
        rules: [
          'L\'equipe en tete choisit le theme',
          '1 seul joueur repond',
          'Pas d\'aide',
          '10 pts par bonne reponse',
          '4/4 = +10 bonus',
        ],
        victory: 'L\'equipe avec le plus de points',
      },
      {
        id: 'relais',
        name: 'Relais',
        description: 'Repondre sans faute en equipe',
        type: 'A',
        players: '2v2',
        duration: '5-8 min',
        rules: [
          'L\'equipe menee choisit le theme',
          'Reponses en chaine par differents joueurs',
          'Temps total ≤40s pour bonus',
          '+20 bonus si sans faute + rapide',
        ],
        victory: 'L\'equipe la plus rapide sans erreur',
      },
      {
        id: 'saut',
        name: 'Saut Patriotique',
        description: 'Serie de questions sur le pays de l\'equipe en tete',
        type: 'A',
        players: '1-5 vs 1-5',
        duration: '5 min',
        rules: [
          'Apres lecture du theme: "En voulez-vous?" Oui/Non',
          'Mauvaise reponse = annule la precedente bonne',
        ],
        victory: 'L\'equipe avec le plus de bonnes reponses',
      },
      {
        id: 'capoeira',
        name: 'Capoeira',
        description: 'Esquive et riposte',
        type: 'A',
        players: '1-5 vs 1-5',
        duration: '3-5 min',
        rules: [
          'Questions alternees',
          'Esquive = passer la question',
          'Riposte = renvoyer a l\'adversaire',
        ],
        victory: 'L\'equipe avec le meilleur score',
      },
      {
        id: 'cime',
        name: 'CIME',
        description: '10 questions de difficulte croissante',
        type: 'C',
        players: 'Solo',
        duration: '8-12 min',
        rules: [
          '3 jokers disponibles',
          'Choix entre quitter ou doubler',
          'Difficulte croissante',
        ],
        victory: 'Atteindre le sommet',
      },
    ],
  },
  enigmes: {
    title: 'ENIGMES & INDICES',
    icon: '?',
    games: [
      {
        id: 'jackpot',
        name: 'Jackpot',
        description: 'Jeu d\'encheres avec indices',
        type: 'B',
        players: '1v1',
        duration: '5-10 min',
        rules: [
          'Mise de 100 points par equipe',
          '3 indices progressifs',
          'Mauvaise reponse = perte totale',
        ],
        victory: 'Le joueur qui remporte la mise',
      },
      {
        id: 'identification',
        name: 'Identification',
        description: 'Trouvez la reponse avec un minimum d\'indices',
        type: 'B',
        players: '1v1',
        duration: '3-5 min',
        rules: [
          '4 indices: 40 / 30 / 20 / 10 points',
          'Une seule tentative par indice',
        ],
        victory: 'Le joueur avec le plus de points',
      },
      {
        id: 'estocade',
        name: 'Estocade',
        description: '3 questions tres difficiles',
        type: 'A',
        players: '1-5 vs 1-5',
        duration: '3-5 min',
        rules: [
          '3 questions difficiles',
          '1 indice max par question',
          '40 points par question',
        ],
        victory: 'L\'equipe avec le plus de bonnes reponses',
      },
      {
        id: 'tirs',
        name: 'Tirs au But',
        description: 'Devinez un mot secret',
        type: 'B',
        players: '1v1',
        duration: '2-3 min',
        rules: [
          'L\'adversaire joue le role de gardien',
          '3 essais pour marquer',
          'Reussite = +40 points',
        ],
        victory: 'Le joueur qui marque',
      },
    ],
  },
  parcours: {
    title: 'PARCOURS & EXPLORATION',
    icon: '◉',
    games: [
      {
        id: 'randonnee',
        name: 'Randonnee Lexicale',
        description: 'Parcourir l\'alphabet de A a Z',
        type: 'C',
        players: 'Solo',
        duration: '10-15 min',
        rules: [
          '10 questions',
          'Mauvaise reponse = arret',
          'Progression alphabetique',
        ],
        victory: 'Atteindre Z',
      },
      {
        id: 'echappee',
        name: 'Echappee',
        description: 'Reussir la cle du continent',
        type: 'A',
        players: '2-4 vs 2-4',
        duration: '8-12 min',
        rules: [
          '3 a 5 questions geographiques',
          'Progression vers un objectif',
          'Course poursuite',
        ],
        victory: 'L\'equipe qui atteint l\'objectif',
      },
    ],
  },
};

export function GameListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameListRouteProp>();
  const { categoryId } = route.params;

  const category = GAMES_BY_CATEGORY[categoryId] || GAMES_BY_CATEGORY.reflexe;

  const handleGamePress = (game: GameInfo) => {
    // Navigate to game rules screen
    navigation.navigate('GameRules', { gameId: game.id, categoryId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getTypeLabel = (type: GameType) => {
    switch (type) {
      case 'A': return 'EQUIPE';
      case 'B': return '1v1';
      case 'C': return 'SOLO';
    }
  };

  const getTypeColor = (type: GameType) => {
    switch (type) {
      case 'A': return '#00ff88';
      case 'B': return '#ffaa00';
      case 'C': return '#00aaff';
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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>Selectionnez un jeu</Text>

          {category.games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => handleGamePress(game)}
              activeOpacity={0.8}
            >
              <View style={styles.gameHeader}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(game.type) + '20', borderColor: getTypeColor(game.type) }]}>
                  <Text style={[styles.typeText, { color: getTypeColor(game.type) }]}>{getTypeLabel(game.type)}</Text>
                </View>
              </View>

              <View style={styles.gameMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Joueurs</Text>
                  <Text style={styles.metaValue}>{game.players}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Duree</Text>
                  <Text style={styles.metaValue}>{game.duration}</Text>
                </View>
              </View>

              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>VOIR LES REGLES</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Export games data for use in other screens
export { GAMES_BY_CATEGORY };

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
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#00ff88',
    fontSize: 14,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    color: '#00ff88',
    fontSize: 28,
    marginRight: 12,
  },
  categoryTitle: {
    color: '#00ff88',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  gameCard: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameInfo: {
    flex: 1,
    marginRight: 12,
  },
  gameName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameDescription: {
    color: '#888',
    fontSize: 13,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gameMeta: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    color: '#666',
    fontSize: 12,
  },
  metaValue: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00ff88',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
