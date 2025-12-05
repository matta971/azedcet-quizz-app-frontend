import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores';
import { RootStackParamList } from '../../navigation/types';
import { LogoHeader } from '../../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated } = useAuthStore();

  const handleStartSession = () => {
    if (isAuthenticated) {
      navigation.navigate('Main', { screen: 'GameModes' });
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/background-home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <LogoHeader size="medium" />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.tagline}>{t('home.tagline')}</Text>
          <Text style={styles.title}>{t('home.title')}</Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSession}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>{t('home.startSession')}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Features */}
        <View style={styles.footer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>{t('home.tacticalChallenges')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>{t('home.gameReading')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>{t('home.aiMatch')}</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 26, 0.7)', // Semi-transparent overlay to ensure text readability
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tagline: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 4,
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 136, 0.2)',
    paddingTop: 20,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1,
  },
});
