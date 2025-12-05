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
import { GAMES_BY_CATEGORY, GameInfo, GameType } from '../gamelist/GameListScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameRulesRouteProp = RouteProp<RootStackParamList, 'GameRules'>;

export function GameRulesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameRulesRouteProp>();
  const { gameId, categoryId } = route.params;

  // Find the game in categories
  const category = GAMES_BY_CATEGORY[categoryId];
  const game = category?.games.find((g) => g.id === gameId);

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Jeu non trouve</Text>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLaunchGame = () => {
    // Navigate based on game type
    switch (game.type) {
      case 'A':
        // TYPE A: Team game -> Go to team setup
        navigation.navigate('TeamSetup', { gameId, categoryId });
        break;
      case 'B':
        // TYPE B: 1v1 -> Go to opponent selection
        navigation.navigate('OpponentSelect', { gameId, categoryId, gameType: 'B' });
        break;
      case 'C':
        // TYPE C: Solo -> Start game immediately
        // For now, go to a placeholder match
        navigation.navigate('Game', { matchId: `solo_${gameId}_${Date.now()}` });
        break;
    }
  };

  const getTypeLabel = (type: GameType) => {
    switch (type) {
      case 'A': return 'JEU EN EQUIPE';
      case 'B': return 'DUEL 1v1';
      case 'C': return 'JEU SOLO';
    }
  };

  const getTypeColor = (type: GameType) => {
    switch (type) {
      case 'A': return '#00ff88';
      case 'B': return '#ffaa00';
      case 'C': return '#00aaff';
    }
  };

  const getButtonLabel = (type: GameType) => {
    switch (type) {
      case 'A': return 'CONFIGURER L\'EQUIPE';
      case 'B': return 'CHOISIR ADVERSAIRE';
      case 'C': return 'COMMENCER';
    }
  };

  const getWorkflowSteps = (type: GameType) => {
    switch (type) {
      case 'A':
        return [
          { step: 1, label: 'Regles', active: true },
          { step: 2, label: 'Creer/Rejoindre equipe', active: false },
          { step: 3, label: 'Choisir adversaire', active: false },
          { step: 4, label: 'Lobby', active: false },
          { step: 5, label: 'Match', active: false },
        ];
      case 'B':
        return [
          { step: 1, label: 'Regles', active: true },
          { step: 2, label: 'Choisir adversaire', active: false },
          { step: 3, label: 'Lobby duel', active: false },
          { step: 4, label: 'Match', active: false },
        ];
      case 'C':
        return [
          { step: 1, label: 'Regles', active: true },
          { step: 2, label: 'Match', active: false },
          { step: 3, label: 'Resultats', active: false },
        ];
    }
  };

  const workflowSteps = getWorkflowSteps(game.type);

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
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Game Title & Type */}
          <View style={styles.titleSection}>
            <Text style={styles.gameName}>{game.name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(game.type) + '20', borderColor: getTypeColor(game.type) }]}>
              <Text style={[styles.typeText, { color: getTypeColor(game.type) }]}>{getTypeLabel(game.type)}</Text>
            </View>
          </View>

          {/* Workflow Steps */}
          <View style={styles.workflowSection}>
            <Text style={styles.sectionTitle}>PARCOURS</Text>
            <View style={styles.workflowSteps}>
              {workflowSteps.map((step, index) => (
                <View key={step.step} style={styles.stepContainer}>
                  <View style={[styles.stepCircle, step.active && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, step.active && styles.stepNumberActive]}>{step.step}</Text>
                  </View>
                  <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>{step.label}</Text>
                  {index < workflowSteps.length - 1 && <View style={styles.stepConnector} />}
                </View>
              ))}
            </View>
          </View>

          {/* Game Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>OBJECTIF</Text>
            <Text style={styles.description}>{game.description}</Text>
          </View>

          {/* Game Rules */}
          <View style={styles.rulesSection}>
            <Text style={styles.sectionTitle}>REGLES</Text>
            {game.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>▸</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>

          {/* Victory Condition */}
          <View style={styles.victorySection}>
            <Text style={styles.sectionTitle}>VICTOIRE</Text>
            <Text style={styles.victoryText}>{game.victory}</Text>
          </View>

          {/* Game Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Joueurs</Text>
              <Text style={styles.infoValue}>{game.players}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duree</Text>
              <Text style={styles.infoValue}>{game.duration}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.launchButton, { backgroundColor: getTypeColor(game.type) }]}
            onPress={handleLaunchGame}
            activeOpacity={0.8}
          >
            <Text style={styles.launchButtonText}>{getButtonLabel(game.type)}</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  workflowSection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
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
  stepNumber: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#1a1a2e',
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
  stepConnector: {
    width: 16,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 2,
  },
  sectionTitle: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  descriptionSection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
  },
  rulesSection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ruleBullet: {
    color: '#00ff88',
    fontSize: 14,
    marginRight: 8,
  },
  ruleText: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  victorySection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  victoryText: {
    color: '#00ff88',
    fontSize: 15,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  infoLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  launchButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  launchButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
