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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

export function HomeScreen() {
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>MS</Text>
            </View>
            <Text style={styles.logoText}>MINDSOCCER</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.tagline}>DEVENS</Text>
          <Text style={styles.title}>MAITRE DU JEU</Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSession}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>DEMARRER UNE SESSION</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Features */}
        <View style={styles.footer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>DEFIS TACTIQUES</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>LECTURE DU JEU</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>MATCH IA</Text>
          </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIconText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoText: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
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
