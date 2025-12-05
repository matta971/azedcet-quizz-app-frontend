import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { GAMES_BY_CATEGORY } from '../gamelist/GameListScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TeamSetupRouteProp = RouteProp<RootStackParamList, 'TeamSetup'>;

type SetupMode = 'choice' | 'create' | 'join';

export function TeamSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TeamSetupRouteProp>();
  const { gameId, categoryId } = route.params;

  const [mode, setMode] = useState<SetupMode>('choice');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(3);
  const [isRanked, setIsRanked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const category = GAMES_BY_CATEGORY[categoryId];
  const game = category?.games.find((g) => g.id === gameId);

  const handleBack = () => {
    if (mode === 'choice') {
      navigation.goBack();
    } else {
      setMode('choice');
      setTeamName('');
      setTeamCode('');
      setMaxPlayersPerTeam(3);
      setIsRanked(true);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;

    setIsLoading(true);
    // TODO: Call API to create team with maxPlayersPerTeam and isRanked
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // Navigate to opponent selection with team info
    navigation.navigate('OpponentSelect', {
      gameId,
      categoryId,
      gameType: 'A',
      teamId: `team_${Date.now()}`,
      teamName: teamName.trim(),
      maxPlayersPerTeam,
      isRanked,
    });
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) return;

    setIsLoading(true);
    // TODO: Call API to join team
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // Navigate to opponent selection with team info
    navigation.navigate('OpponentSelect', {
      gameId,
      categoryId,
      gameType: 'A',
      teamId: `team_${teamCode}`,
      teamName: 'Mon Equipe',
    });
  };

  const getWorkflowSteps = () => [
    { step: 1, label: 'Regles', active: false, completed: true },
    { step: 2, label: 'Creer/Rejoindre equipe', active: true },
    { step: 3, label: 'Choisir adversaire', active: false },
    { step: 4, label: 'Lobby', active: false },
    { step: 5, label: 'Match', active: false },
  ];

  const renderChoice = () => (
    <View style={styles.choiceContainer}>
      <Text style={styles.choiceTitle}>CONSTITUER VOTRE EQUIPE</Text>
      <Text style={styles.choiceSubtitle}>
        Creez une nouvelle equipe ou rejoignez une equipe existante
      </Text>

      <TouchableOpacity
        style={styles.choiceButton}
        onPress={() => setMode('create')}
        activeOpacity={0.8}
      >
        <View style={styles.choiceButtonContent}>
          <Text style={styles.choiceButtonIcon}>+</Text>
          <View style={styles.choiceButtonText}>
            <Text style={styles.choiceButtonTitle}>CREER UNE EQUIPE</Text>
            <Text style={styles.choiceButtonDesc}>
              Devenez capitaine et invitez des joueurs
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.choiceButton, styles.joinButton]}
        onPress={() => setMode('join')}
        activeOpacity={0.8}
      >
        <View style={styles.choiceButtonContent}>
          <Text style={styles.choiceButtonIcon}>→</Text>
          <View style={styles.choiceButtonText}>
            <Text style={styles.choiceButtonTitle}>REJOINDRE UNE EQUIPE</Text>
            <Text style={styles.choiceButtonDesc}>
              Entrez le code d'invitation de votre capitaine
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCreateForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>CREER UNE EQUIPE</Text>
      <Text style={styles.formSubtitle}>
        Configurez votre equipe pour le match
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>NOM DE L'EQUIPE</Text>
        <TextInput
          style={styles.textInput}
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Ex: Les Champions"
          placeholderTextColor="#666"
          maxLength={20}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>JOUEURS PAR EQUIPE</Text>
        <Text style={styles.inputHint}>
          Les deux equipes devront atteindre ce nombre pour demarrer
        </Text>
        <View style={styles.teamSizeSelector}>
          {[1, 2, 3, 4, 5].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.teamSizeButton,
                maxPlayersPerTeam === size && styles.teamSizeButtonActive,
              ]}
              onPress={() => setMaxPlayersPerTeam(size)}
            >
              <Text
                style={[
                  styles.teamSizeButtonText,
                  maxPlayersPerTeam === size && styles.teamSizeButtonTextActive,
                ]}
              >
                {size}v{size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.rankedToggle}
        onPress={() => setIsRanked(!isRanked)}
      >
        <View style={[styles.checkbox, isRanked && styles.checkboxActive]}>
          {isRanked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View>
          <Text style={styles.rankedLabel}>Match classe (Ranked)</Text>
          <Text style={styles.rankedHint}>Affecte votre classement</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>INFORMATION</Text>
        <Text style={styles.infoText}>
          Une fois l'equipe creee, vous recevrez un code d'invitation a partager avec vos coequipiers.
          Le match ne pourra demarrer que lorsque les deux equipes auront {maxPlayersPerTeam} joueur{maxPlayersPerTeam > 1 ? 's' : ''} chacune.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, !teamName.trim() && styles.actionButtonDisabled]}
        onPress={handleCreateTeam}
        disabled={!teamName.trim() || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.actionButtonText}>
            CREER L'EQUIPE ({maxPlayersPerTeam}v{maxPlayersPerTeam})
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderJoinForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>REJOINDRE UNE EQUIPE</Text>
      <Text style={styles.formSubtitle}>
        Entrez le code d'invitation recu de votre capitaine
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>CODE D'INVITATION</Text>
        <TextInput
          style={styles.textInput}
          value={teamCode}
          onChangeText={setTeamCode}
          placeholder="Ex: ABC123"
          placeholderTextColor="#666"
          maxLength={10}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>INFORMATION</Text>
        <Text style={styles.infoText}>
          Demandez le code d'invitation a votre capitaine d'equipe pour pouvoir rejoindre la partie.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, !teamCode.trim() && styles.actionButtonDisabled]}
        onPress={handleJoinTeam}
        disabled={!teamCode.trim() || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.actionButtonText}>REJOINDRE</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const workflowSteps = getWorkflowSteps();

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

          {/* Content based on mode */}
          {mode === 'choice' && renderChoice()}
          {mode === 'create' && renderCreateForm()}
          {mode === 'join' && renderJoinForm()}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  workflowSection: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  choiceContainer: {
    marginTop: 16,
  },
  choiceTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  choiceSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  choiceButton: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  joinButton: {
    borderColor: '#ffaa00',
  },
  choiceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceButtonIcon: {
    color: '#00ff88',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  choiceButtonText: {
    flex: 1,
  },
  choiceButtonTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  choiceButtonDesc: {
    color: '#888',
    fontSize: 13,
  },
  formContainer: {
    marginTop: 16,
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 170, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 170, 255, 0.3)',
  },
  infoTitle: {
    color: '#00aaff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#333',
  },
  actionButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputHint: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  teamSizeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamSizeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
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
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.5)',
    marginRight: 14,
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
    fontSize: 16,
  },
  rankedLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rankedHint: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});
