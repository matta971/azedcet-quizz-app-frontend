import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface GameMode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

const GAME_MODES: GameMode[] = [
  { id: 'reflexe', title: 'REFLEXE &', subtitle: 'PRESSION', icon: '✓' },
  { id: 'strategie', title: 'STRATEGIE', subtitle: '& THEMES', icon: '⬡' },
  { id: 'enigmes', title: 'ENIGMES', subtitle: '& INDICES', icon: '?' },
  { id: 'parcours', title: 'PARCOURS', subtitle: '& EXPLORATION', icon: '◎' },
];

const MATCH_STEPS = [
  { number: 1, label: 'SELECTION DU-MODE' },
  { number: 2, label: 'PREPARATION DU LOBBY' },
  { number: 3, label: 'DEROULEMENT DES ROUNDS' },
  { number: 4, label: 'RESULTATS' },
  { number: 5, label: 'CLASSEMENT' },
];

const SCORING_RULES = [
  { icon: '>>', text: 'Bonne reponse -> + points' },
  { icon: '>>', text: 'Vitesse -> bonus' },
  { icon: '>>', text: 'Foute / retard -> malus' },
  { icon: '>>', text: "Victoire d'equipe -> gain cumule" },
];

export function TutorialScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleStartPlaying = () => {
    navigation.navigate('Main', { screen: 'GameModes' });
  };

  const handleViewModes = () => {
    navigation.navigate('Main', { screen: 'GameModes' });
  };

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
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoIconText}>MS</Text>
              </View>
              <Text style={styles.logoText}>MINDSOCCER</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>TUTORIEL & REGLES GLOBALES</Text>
          <Text style={styles.subtitle}>
            Comprendre les modes, les points et le deroulement des matchs
          </Text>

          {/* Two Column Layout */}
          <View style={styles.twoColumnLayout}>
            {/* Left Column - General Presentation */}
            <View style={styles.column}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Presentation generale</Text>
                <View style={styles.brainIconContainer}>
                  <Text style={styles.brainIcon}>🧠</Text>
                </View>
                <Text style={styles.cardDescription}>
                  MindSoccer est un iau d'agilite mentale competitit.
                </Text>
                <Text style={styles.cardDescription}>
                  Affrontez d'autres joueurs o equipes dans plusieurs modes thematiques
                </Text>
              </View>

              {/* Match Structure */}
              <Text style={styles.sectionTitle}>Structure d'un match</Text>
              <View style={styles.matchSteps}>
                <View style={styles.stepsLine}>
                  {MATCH_STEPS.slice(0, 4).map((step, index) => (
                    <View key={step.number} style={styles.stepContainer}>
                      <View style={styles.stepCircle}>
                        <Text style={styles.stepNumber}>{step.number}</Text>
                      </View>
                      {index < 3 && <View style={styles.stepConnector} />}
                    </View>
                  ))}
                </View>
                <View style={styles.stepsLabels}>
                  {MATCH_STEPS.slice(0, 4).map((step) => (
                    <Text key={step.number} style={styles.stepLabel}>
                      {step.label.split(' ').map((word, i) => (
                        <Text key={i}>{word}{'\n'}</Text>
                      ))}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Detailed Steps */}
              <Text style={styles.sectionTitle}>Structure d'un match</Text>
              <View style={styles.detailedSteps}>
                {MATCH_STEPS.map((step) => (
                  <View key={step.number} style={styles.detailedStep}>
                    <View style={styles.detailedStepNumber}>
                      <Text style={styles.detailedStepNumberText}>{step.number}</Text>
                    </View>
                    <Text style={styles.detailedStepText}>{step.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Right Column - Game Modes */}
            <View style={styles.column}>
              <Text style={styles.sectionTitle}>Les Modes Principaux</Text>
              <View style={styles.modesGrid}>
                {GAME_MODES.map((mode) => (
                  <TouchableOpacity key={mode.id} style={styles.modeCard}>
                    <Text style={styles.modeIcon}>{mode.icon}</Text>
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                    <Text style={styles.modeDescription}>
                      {mode.id === 'reflexe' ? 'Reponses rapides' :
                       mode.id === 'strategie' ? 'Choix de sujets' :
                       mode.id === 'enigmes' ? 'Solutions en etapes' :
                       'Series de questions'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Scoring Rules */}
              <Text style={styles.sectionTitle}>Comment marquer des points ?</Text>
              <View style={styles.scoringRules}>
                {SCORING_RULES.map((rule, index) => (
                  <View key={index} style={styles.scoringRule}>
                    <Text style={styles.scoringIcon}>{rule.icon}</Text>
                    <Text style={styles.scoringText}>{rule.text}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartPlaying}
              >
                <Text style={styles.primaryButtonText}>COMMENCER A JOUER</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleViewModes}
              >
                <Text style={styles.secondaryButtonText}>VOIR LES MODES</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIconText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoText: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  title: {
    color: '#00ff88',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  brainIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brainIcon: {
    fontSize: 40,
  },
  cardDescription: {
    color: '#888',
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  matchSteps: {
    marginBottom: 16,
  },
  stepsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 2,
    borderColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepConnector: {
    width: 20,
    height: 2,
    backgroundColor: '#00ff88',
    marginHorizontal: 4,
  },
  stepsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    color: '#00ff88',
    fontSize: 8,
    textAlign: 'center',
    flex: 1,
  },
  detailedSteps: {
    backgroundColor: 'rgba(22, 33, 62, 0.5)',
    borderRadius: 8,
    padding: 12,
  },
  detailedStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailedStepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailedStepNumberText: {
    color: '#1a1a2e',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailedStepText: {
    color: '#00ff88',
    fontSize: 11,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modeCard: {
    width: '48%',
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    padding: 12,
    alignItems: 'center',
  },
  modeIcon: {
    color: '#00ff88',
    fontSize: 20,
    marginBottom: 6,
  },
  modeTitle: {
    color: '#00ff88',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modeSubtitle: {
    color: '#00ff88',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modeDescription: {
    color: '#888',
    fontSize: 9,
    textAlign: 'center',
  },
  scoringRules: {
    backgroundColor: 'rgba(22, 33, 62, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  scoringRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoringIcon: {
    color: '#00ff88',
    fontSize: 10,
    marginRight: 8,
  },
  scoringText: {
    color: '#00ff88',
    fontSize: 11,
  },
  primaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ff88',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 1,
  },
});
