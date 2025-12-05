import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSmashStore } from '../../stores/smashStore';
import { RootStackParamList } from '../../navigation/types';
import { TeamSide, SmashQuestionOption } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'SmashGame'>;

const { width } = Dimensions.get('window');

export function SmashGameScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { matchId, myTeam } = route.params;

  const {
    isPlaying,
    scoreA,
    scoreB,
    turnNumber,
    attackerTeam,
    defenderTeam,
    currentPhase,
    hasConcertation,
    currentQuestion,
    currentAnswer,
    expectedAnswer,
    remainingTimeMs,
    timerDurationMs,
    lastResult,
    roundType,
    proposedQuestions,
    selectedQuestion,
    isLoadingQuestions,
    questionMode,
    startSmashGame,
    endSmashGame,
    sendTop,
    sendQuestion,
    sendValidation,
    sendAnswer,
    sendResult,
    fetchProposedQuestions,
    selectQuestion,
    setQuestionMode,
    sendSelectedQuestion,
  } = useSmashStore();

  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');

  const isAttacker = myTeam === attackerTeam;
  const isDefender = myTeam === defenderTeam;

  useEffect(() => {
    console.log('[SmashGame] Component mounted with myTeam:', myTeam, 'matchId:', matchId);
    startSmashGame(matchId, myTeam);
    return () => {
      endSmashGame();
    };
  }, [matchId, myTeam]);

  // Debug log when state changes
  useEffect(() => {
    console.log('[SmashGame] State changed:', {
      currentPhase,
      attackerTeam,
      defenderTeam,
      myTeam,
      isAttacker,
      roundType,
    });
  }, [currentPhase, attackerTeam, defenderTeam, myTeam, isAttacker, roundType]);

  const formatTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    const seconds = Math.floor(totalSeconds);
    const centiseconds = Math.floor((totalSeconds - seconds) * 100);
    return `${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleTop = () => {
    console.log('[SmashGame] TOP button pressed');
    sendTop();
  };

  const handleSubmitQuestion = () => {
    if (questionInput.trim()) {
      console.log('[SmashGame] Submitting question:', questionInput);
      sendQuestion(questionInput.trim());
      setQuestionInput('');
    }
  };

  const handleValidate = (valid: boolean) => {
    console.log('[SmashGame] Validation:', valid);
    sendValidation(valid);
  };

  const handleSubmitAnswer = () => {
    if (answerInput.trim()) {
      console.log('[SmashGame] Submitting answer:', answerInput);
      sendAnswer(answerInput.trim());
      setAnswerInput('');
    }
  };

  const handleResult = (correct: boolean) => {
    console.log('[SmashGame] Result validation:', correct);
    sendResult(correct);
  };

  const handleLeaveMatch = () => {
    navigation.navigate('Main', { screen: 'Lobby' });
  };

  const handleSelectQuestionMode = (mode: 'custom' | 'predefined') => {
    console.log('[SmashGame] Selected question mode:', mode);
    setQuestionMode(mode);
  };

  const handleSelectQuestion = (question: SmashQuestionOption) => {
    console.log('[SmashGame] Selected question:', question.text);
    selectQuestion(question);
  };

  const handleSendSelectedQuestion = () => {
    console.log('[SmashGame] Sending selected question');
    sendSelectedQuestion();
  };

  // Get team status text
  const getTeamStatus = (team: TeamSide) => {
    if (attackerTeam === team) {
      switch (currentPhase) {
        case 'CONCERTATION':
          return 'SE CONCERTE';
        case 'QUESTION':
          return 'POSE UNE QUESTION';
        case 'RESULT':
          return 'VALIDE LA REPONSE';
        default:
          return 'ATTAQUE';
      }
    } else {
      switch (currentPhase) {
        case 'VALIDATE':
          return 'VALIDE LA QUESTION';
        case 'ANSWER':
          return 'REPOND';
        default:
          return 'DEFEND';
      }
    }
  };

  // Render the central timer area
  const renderCentralArea = () => {
    // Show timer when there's an active countdown
    const showTimer = timerDurationMs > 0 && remainingTimeMs > 0;

    return (
      <View style={styles.centralArea}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>
            {showTimer ? formatTime(remainingTimeMs) : '--'}
          </Text>
        </View>
      </View>
    );
  };

  // Render team cards with TOP button in the middle
  const renderTeamCards = () => {
    // Show TOP button during CONCERTATION for the attacker team
    const showTopButton = currentPhase === 'CONCERTATION' && isAttacker;

    return (
      <View style={styles.teamsRow}>
        {/* Team A Card */}
        <View style={[styles.teamCard, attackerTeam === 'A' ? styles.teamCardAttacker : styles.teamCardDefender]}>
          <Text style={styles.teamCardLabel}>EQUIPE A</Text>
          <Text style={styles.teamCardStatus}>{getTeamStatus('A')}</Text>
          <Text style={styles.teamCardScore}>{scoreA}</Text>
          {myTeam === 'A' && <Text style={styles.myTeamIndicator}>(Vous)</Text>}
        </View>

        {/* TOP Button in the middle */}
        <View style={styles.topButtonContainer}>
          {showTopButton ? (
            <TouchableOpacity style={styles.topButton} onPress={handleTop}>
              <Text style={styles.topButtonText}>TOP</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.topButtonPlaceholder}>
              <Text style={styles.topButtonPlaceholderText}>TOP</Text>
            </View>
          )}
        </View>

        {/* Team B Card */}
        <View style={[styles.teamCard, attackerTeam === 'B' ? styles.teamCardAttacker : styles.teamCardDefender]}>
          <Text style={styles.teamCardLabel}>EQUIPE B</Text>
          <Text style={styles.teamCardStatus}>{getTeamStatus('B')}</Text>
          <Text style={styles.teamCardScore}>{scoreB}</Text>
          {myTeam === 'B' && <Text style={styles.myTeamIndicator}>(Vous)</Text>}
        </View>
      </View>
    );
  };

  // Render question mode selection (SMASH A only)
  const renderQuestionModeSelection = () => (
    <View style={styles.modeSelectionContainer}>
      <Text style={styles.modeSelectionTitle}>Comment voulez-vous poser votre question ?</Text>
      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => handleSelectQuestionMode('custom')}
        >
          <Text style={styles.modeButtonText}>Ecrire ma question</Text>
          <Text style={styles.modeButtonSubtext}>Posez votre propre question</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => handleSelectQuestionMode('predefined')}
        >
          <Text style={styles.modeButtonText}>Choisir une question</Text>
          <Text style={styles.modeButtonSubtext}>Parmi 10 questions aleatoires</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render proposed questions list
  const renderProposedQuestions = () => {
    if (isLoadingQuestions) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement des questions...</Text>
        </View>
      );
    }

    return (
      <View style={styles.proposedQuestionsContainer}>
        <Text style={styles.proposedQuestionsTitle}>Choisissez une question:</Text>
        {roundType === 'SMASH_A' && (
          <TouchableOpacity
            style={styles.backToModeButton}
            onPress={() => setQuestionMode(null)}
          >
            <Text style={styles.backToModeButtonText}>← Retour au choix</Text>
          </TouchableOpacity>
        )}
        <FlatList
          data={proposedQuestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.questionOption,
                selectedQuestion?.id === item.id && styles.questionOptionSelected,
              ]}
              onPress={() => handleSelectQuestion(item)}
            >
              <View style={styles.questionOptionHeader}>
                <Text style={styles.questionOptionNumber}>{index + 1}</Text>
                <View style={[styles.difficultyBadge, styles[`difficulty${item.difficulty}`]]}>
                  <Text style={styles.difficultyText}>{item.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.questionOptionText}>{item.text}</Text>
              {selectedQuestion?.id === item.id && (
                <View style={styles.expectedAnswerContainer}>
                  <Text style={styles.expectedAnswerLabel}>Reponse attendue:</Text>
                  <Text style={styles.expectedAnswerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          style={styles.questionsList}
          showsVerticalScrollIndicator={false}
        />
        {selectedQuestion && (
          <TouchableOpacity style={styles.confirmQuestionButton} onPress={handleTop}>
            <Text style={styles.confirmQuestionButtonText}>Lancer le TOP avec cette question</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render input area based on phase
  const renderInputArea = () => {
    // CONCERTATION: Different behavior for SMASH_A vs SMASH_B
    if (currentPhase === 'CONCERTATION' && isAttacker) {
      // SMASH_B: Directly show question selection (no custom option)
      if (roundType === 'SMASH_B') {
        return renderProposedQuestions();
      }

      // SMASH_A: Show mode selection if not chosen, else show appropriate input
      if (questionMode === null) {
        return renderQuestionModeSelection();
      }

      if (questionMode === 'predefined') {
        return renderProposedQuestions();
      }

      // Custom mode: Show question input + "Lancer le Top" button
      return (
        <View style={styles.inputArea}>
          <TouchableOpacity
            style={styles.backToModeButton}
            onPress={() => setQuestionMode(null)}
          >
            <Text style={styles.backToModeButtonText}>← Retour au choix</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.questionInput}
            placeholder="Entrer votre question"
            placeholderTextColor="#666"
            value={questionInput}
            onChangeText={setQuestionInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.launchTopButton, !questionInput.trim() && styles.launchTopButtonDisabled]}
            onPress={handleTop}
            disabled={!questionInput.trim()}
          >
            <Text style={styles.launchTopButtonText}>Lancer le Top</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // QUESTION phase: Handle both custom and predefined modes
    if (currentPhase === 'QUESTION' && isAttacker) {
      // Predefined mode: Just confirm and send the selected question
      if (questionMode === 'predefined' && selectedQuestion) {
        return (
          <View style={styles.inputArea}>
            <View style={styles.questionDisplay}>
              <Text style={styles.questionDisplayLabel}>Votre question:</Text>
              <Text style={styles.questionDisplayText}>{selectedQuestion.text}</Text>
            </View>
            <View style={styles.expectedAnswerDisplay}>
              <Text style={styles.expectedAnswerLabel}>Reponse attendue:</Text>
              <Text style={styles.expectedAnswerText}>{selectedQuestion.answer}</Text>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSendSelectedQuestion}
            >
              <Text style={styles.submitButtonText}>Envoyer la question</Text>
            </TouchableOpacity>
          </View>
        );
      }

      // Custom mode: Show question input
      return (
        <View style={styles.inputArea}>
          <TextInput
            style={styles.questionInput}
            placeholder="Entrer la question"
            placeholderTextColor="#666"
            value={questionInput}
            onChangeText={setQuestionInput}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.submitButton, !questionInput.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitQuestion}
            disabled={!questionInput.trim()}
          >
            <Text style={styles.submitButtonText}>Envoyer la question</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // VALIDATE: Show question and validation buttons for defender
    if (currentPhase === 'VALIDATE' && isDefender) {
      return (
        <View style={styles.inputArea}>
          <View style={styles.questionDisplay}>
            <Text style={styles.questionDisplayLabel}>Question posee:</Text>
            <Text style={styles.questionDisplayText}>{currentQuestion}</Text>
          </View>
          <View style={styles.validationButtons}>
            <TouchableOpacity
              style={[styles.validationButton, styles.validButton]}
              onPress={() => handleValidate(true)}
            >
              <Text style={styles.validationButtonText}>Valide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.validationButton, styles.invalidButton]}
              onPress={() => handleValidate(false)}
            >
              <Text style={styles.validationButtonText}>Invalide</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ANSWER: Show question and answer input for defender
    if (currentPhase === 'ANSWER' && isDefender) {
      return (
        <View style={styles.inputArea}>
          <View style={styles.questionDisplay}>
            <Text style={styles.questionDisplayLabel}>Question:</Text>
            <Text style={styles.questionDisplayText}>{currentQuestion}</Text>
          </View>
          <TextInput
            style={styles.questionInput}
            placeholder="Votre reponse..."
            placeholderTextColor="#666"
            value={answerInput}
            onChangeText={setAnswerInput}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.submitButton, !answerInput.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={!answerInput.trim()}
          >
            <Text style={styles.submitButtonText}>Envoyer la reponse</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // RESULT: Show question, answer, expected answer (if predefined), and result buttons for attacker
    if (currentPhase === 'RESULT' && isAttacker) {
      return (
        <View style={styles.inputArea}>
          <View style={styles.questionDisplay}>
            <Text style={styles.questionDisplayLabel}>Question:</Text>
            <Text style={styles.questionDisplayText}>{currentQuestion}</Text>
          </View>
          {expectedAnswer && (
            <View style={styles.expectedAnswerDisplay}>
              <Text style={styles.expectedAnswerLabel}>Reponse attendue:</Text>
              <Text style={styles.expectedAnswerText}>{expectedAnswer}</Text>
            </View>
          )}
          <View style={styles.answerDisplay}>
            <Text style={styles.answerDisplayLabel}>Reponse du defenseur:</Text>
            <Text style={styles.answerDisplayText}>{currentAnswer}</Text>
          </View>
          <Text style={styles.resultPrompt}>La reponse est-elle correcte ?</Text>
          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={[styles.resultButton, styles.correctButton]}
              onPress={() => handleResult(true)}
            >
              <Text style={styles.resultButtonText}>Correct</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultButton, styles.incorrectButton]}
              onPress={() => handleResult(false)}
            >
              <Text style={styles.resultButtonText}>Incorrect</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Waiting state for non-active player
    return (
      <View style={styles.inputArea}>
        <Text style={styles.waitingText}>
          {currentPhase === 'CONCERTATION' && !isAttacker && "L'equipe adverse se concerte..."}
          {currentPhase === 'QUESTION' && !isAttacker && "L'equipe adverse pose une question..."}
          {currentPhase === 'VALIDATE' && isAttacker && "Validation de la question en cours..."}
          {currentPhase === 'ANSWER' && isAttacker && "L'equipe adverse repond..."}
          {currentPhase === 'RESULT' && !isAttacker && "Validation de la reponse en cours..."}
          {currentPhase === 'TURN_START' && 'Debut du tour...'}
          {!currentPhase && 'Chargement...'}
        </Text>
      </View>
    );
  };

  // Render event messages at the bottom
  const renderEventMessages = () => {
    if (!lastResult) return null;

    return (
      <View style={styles.eventMessages}>
        <Text style={styles.eventMessageText}>{lastResult.message}</Text>
        {lastResult.points > 0 && lastResult.winner && (
          <Text style={styles.eventMessageText}>
            +{lastResult.points} points pour l'equipe {lastResult.winner}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MINDSOCCER</Text>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveMatch}>
          <Text style={styles.leaveButtonText}>Quitter la manche</Text>
        </TouchableOpacity>
      </View>

      {/* Round Type */}
      <View style={styles.roundTypeContainer}>
        <Text style={styles.roundTypeText}>
          {roundType === 'SMASH_A' ? 'SMASH A' : roundType === 'SMASH_B' ? 'SMASH B' : 'SMASH A / SMASH B'}
        </Text>
        <Text style={styles.roundSubtext}>MANCHE EN COURS</Text>
      </View>

      {/* Debug Info - Remove in production */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Phase: {currentPhase || 'null'} | MyTeam: {myTeam} | Attacker: {attackerTeam || 'null'} | isAttacker: {isAttacker ? 'OUI' : 'NON'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Central Timer/TOP Area */}
        {renderCentralArea()}

        {/* Team Cards */}
        {renderTeamCards()}

        {/* Input Area */}
        {renderInputArea()}

        {/* Event Messages */}
        {renderEventMessages()}
      </ScrollView>

      {/* Match Ended Overlay */}
      {!isPlaying && lastResult && (
        <View style={styles.endedOverlay}>
          <View style={styles.endedContent}>
            <Text style={styles.endedTitle}>Round termine</Text>
            <Text style={styles.endedScore}>{scoreA} - {scoreB}</Text>
            <Text style={styles.endedWinner}>
              {scoreA > scoreB
                ? myTeam === 'A' ? 'Vous gagnez !' : 'Equipe A gagne'
                : scoreB > scoreA
                ? myTeam === 'B' ? 'Vous gagnez !' : 'Equipe B gagne'
                : 'Egalite !'}
            </Text>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => navigation.navigate('Main', { screen: 'Lobby' })}
            >
              <Text style={styles.returnButtonText}>Retour au Lobby</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: '#00ffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  leaveButtonText: {
    color: '#00ffff',
    fontSize: 12,
  },
  roundTypeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  roundTypeText: {
    color: '#00ffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  roundSubtext: {
    color: '#00ffff',
    fontSize: 14,
    marginTop: 4,
  },
  debugContainer: {
    backgroundColor: '#1a2a4a',
    padding: 8,
    marginHorizontal: 10,
    borderRadius: 4,
  },
  debugText: {
    color: '#ffff00',
    fontSize: 10,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  centralArea: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 4,
    borderColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  timerText: {
    color: '#00ffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  teamCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  topButtonContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  topButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  topButtonText: {
    color: '#0a1628',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topButtonPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonPlaceholderText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamCardAttacker: {
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  teamCardDefender: {
    borderColor: '#ff4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  teamCardLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  teamCardStatus: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  teamCardScore: {
    color: '#00ffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  myTeamIndicator: {
    color: '#00ff88',
    fontSize: 10,
    marginTop: 4,
  },
  inputArea: {
    marginTop: 20,
  },
  questionInput: {
    backgroundColor: '#1a2a4a',
    color: '#fff',
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffff',
    marginBottom: 12,
  },
  launchTopButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00ffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  launchTopButtonText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#00ffff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
  },
  submitButtonText: {
    color: '#0a1628',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionDisplay: {
    backgroundColor: '#1a2a4a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionDisplayLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  questionDisplayText: {
    color: '#fff',
    fontSize: 16,
  },
  answerDisplay: {
    backgroundColor: '#1a3a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  answerDisplayLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  answerDisplayText: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
  },
  validationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  validationButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  validButton: {
    backgroundColor: '#00aa55',
  },
  invalidButton: {
    backgroundColor: '#cc3333',
  },
  validationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultPrompt: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resultButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#00aa55',
  },
  incorrectButton: {
    backgroundColor: '#cc3333',
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waitingText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Question mode selection styles
  modeSelectionContainer: {
    marginTop: 20,
  },
  modeSelectionTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modeButtons: {
    gap: 12,
  },
  modeButton: {
    backgroundColor: '#1a2a4a',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeButtonSubtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  backToModeButton: {
    marginBottom: 12,
  },
  backToModeButtonText: {
    color: '#00ffff',
    fontSize: 14,
  },
  launchTopButtonDisabled: {
    borderColor: '#333',
  },
  // Proposed questions styles
  proposedQuestionsContainer: {
    marginTop: 10,
  },
  proposedQuestionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
  },
  questionsList: {
    maxHeight: 300,
  },
  questionOption: {
    backgroundColor: '#1a2a4a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  questionOptionSelected: {
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  questionOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionOptionNumber: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyEASY: {
    backgroundColor: '#00aa55',
  },
  difficultyMEDIUM: {
    backgroundColor: '#ffaa00',
  },
  difficultyHARD: {
    backgroundColor: '#ff4444',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  questionOptionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  expectedAnswerContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  expectedAnswerDisplay: {
    backgroundColor: '#1a3a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00aa55',
  },
  expectedAnswerLabel: {
    color: '#00aa55',
    fontSize: 12,
    marginBottom: 4,
  },
  expectedAnswerText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmQuestionButton: {
    backgroundColor: '#00ffff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmQuestionButtonText: {
    color: '#0a1628',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventMessages: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#1a2a4a',
    borderRadius: 8,
  },
  eventMessageText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endedContent: {
    alignItems: 'center',
  },
  endedTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  endedScore: {
    color: '#00ffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  endedWinner: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 30,
  },
  returnButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#0a1628',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
