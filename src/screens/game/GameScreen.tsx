import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore, useMatchStore } from '../../stores';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Game'>;

const { width } = Dimensions.get('window');

export function GameScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { matchId } = route.params;

  const { currentMatch } = useMatchStore();
  const {
    isPlaying,
    scoreA,
    scoreB,
    currentRound,
    roundIndex,
    currentQuestion,
    remainingTimeMs,
    canBuzz,
    hasBuzzed,
    lastResult,
    buzz,
    submitAnswer,
    endGame,
  } = useGameStore();

  useEffect(() => {
    return () => {
      endGame();
    };
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds.toString();
  };

  const handleBuzz = () => {
    if (canBuzz && !hasBuzzed) {
      buzz();
    }
  };

  const handleAnswer = (answer: string) => {
    submitAnswer(answer);
  };

  return (
    <View style={styles.container}>
      {/* Score Header */}
      <View style={styles.scoreHeader}>
        <View style={styles.teamScore}>
          <Text style={styles.teamLabel}>Équipe A</Text>
          <Text style={styles.score}>{scoreA}</Text>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.roundType}>{currentRound || 'En attente'}</Text>
          <Text style={styles.roundNumber}>Rubrique {roundIndex + 1}</Text>
        </View>
        <View style={styles.teamScore}>
          <Text style={styles.teamLabel}>Équipe B</Text>
          <Text style={styles.score}>{scoreB}</Text>
        </View>
      </View>

      {/* Timer */}
      {currentQuestion && (
        <View style={styles.timerContainer}>
          <View style={[styles.timerBar, { width: `${(remainingTimeMs / currentQuestion.timeLimitMs) * 100}%` }]} />
          <Text style={styles.timerText}>{formatTime(remainingTimeMs)}</Text>
        </View>
      )}

      {/* Question Area */}
      <View style={styles.questionArea}>
        {currentQuestion ? (
          <>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {/* Multiple choice answers */}
            {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
              <View style={styles.choicesContainer}>
                {currentQuestion.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.choiceButton}
                    onPress={() => handleAnswer(choice)}
                    disabled={!hasBuzzed}
                  >
                    <Text style={styles.choiceText}>{choice}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* Open question - just buzzer */
              <View style={styles.buzzerArea}>
                {!hasBuzzed && canBuzz && (
                  <TouchableOpacity style={styles.buzzerButton} onPress={handleBuzz}>
                    <Text style={styles.buzzerText}>BUZZER</Text>
                  </TouchableOpacity>
                )}
                {hasBuzzed && (
                  <Text style={styles.buzzedText}>Vous avez buzzé !</Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>En attente de la prochaine question...</Text>
          </View>
        )}
      </View>

      {/* Last Result */}
      {lastResult && (
        <View style={[styles.resultContainer, lastResult.correct ? styles.resultCorrect : styles.resultIncorrect]}>
          <Text style={styles.resultText}>
            {lastResult.correct ? 'Bonne réponse !' : 'Mauvaise réponse'}
          </Text>
          <Text style={styles.resultAnswer}>Réponse : {lastResult.expectedAnswer}</Text>
          {lastResult.pointsAwarded !== 0 && (
            <Text style={styles.resultPoints}>
              {lastResult.pointsAwarded > 0 ? '+' : ''}{lastResult.pointsAwarded} pts
            </Text>
          )}
        </View>
      )}

      {/* Match ended */}
      {!isPlaying && (
        <View style={styles.endedOverlay}>
          <View style={styles.endedContent}>
            <Text style={styles.endedTitle}>Match terminé</Text>
            <Text style={styles.endedScore}>{scoreA} - {scoreB}</Text>
            <Text style={styles.endedWinner}>
              {scoreA > scoreB ? 'Équipe A gagne !' : scoreB > scoreA ? 'Équipe B gagne !' : 'Égalité !'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#16213e',
  },
  teamScore: {
    alignItems: 'center',
  },
  teamLabel: {
    color: '#888',
    fontSize: 12,
  },
  score: {
    color: '#00ff88',
    fontSize: 36,
    fontWeight: 'bold',
  },
  matchInfo: {
    alignItems: 'center',
  },
  roundType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roundNumber: {
    color: '#888',
    fontSize: 12,
  },
  timerContainer: {
    height: 40,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00ff88',
    opacity: 0.3,
  },
  timerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  questionText: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  buzzerArea: {
    alignItems: 'center',
  },
  buzzerButton: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buzzerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  buzzedText: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
  },
  waitingContainer: {
    alignItems: 'center',
  },
  waitingText: {
    color: '#888',
    fontSize: 18,
  },
  resultContainer: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  resultCorrect: {
    backgroundColor: '#00ff8833',
    borderColor: '#00ff88',
    borderWidth: 1,
  },
  resultIncorrect: {
    backgroundColor: '#ff444433',
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultAnswer: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  resultPoints: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
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
    color: '#00ff88',
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
    backgroundColor: '#00ff88',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
