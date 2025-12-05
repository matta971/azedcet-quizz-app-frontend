import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [autoInvite, setAutoInvite] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  const handleBackToProfile = () => {
    navigation.goBack();
  };

  const renderSettingRow = (
    icon: string,
    label: string,
    value?: string,
    onPress?: () => void,
    rightContent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightContent}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {rightContent}
      {onPress && !rightContent && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );

  const renderToggleRow = (
    icon: string,
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
    valueLabel?: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.toggleContainer}>
        {valueLabel && <Text style={styles.toggleLabel}>{valueLabel}</Text>}
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: '#333', true: '#00ff88' }}
          thumbColor={value ? '#fff' : '#888'}
        />
      </View>
    </View>
  );

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
          <Text style={styles.title}>PARAMETRES</Text>
          <Text style={styles.subtitle}>
            Personnalisez votre experience MindSoccer
          </Text>

          {/* Profile & Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFIL & SECURITE</Text>
            <View style={styles.sectionContent}>
              {renderSettingRow('@', 'Changer le pseudo', undefined, () => {})}
              {renderSettingRow('@', "Changer l'avatar", undefined, () => {})}
              {renderSettingRow('🔒', 'Modifier le mot de passe', undefined, () => {})}
              <TouchableOpacity
                style={[styles.settingRow, styles.logoutRow]}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.logoutIcon}>ⓘ</Text>
                  <Text style={styles.logoutLabel}>Deconnexion</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
            <View style={styles.sectionContent}>
              <View style={styles.preferenceGrid}>
                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>🌐</Text>
                  <Text style={styles.preferenceLabel}>Langue: Francais</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Mode: Sombre</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.preferenceGrid}>
                {renderToggleRow(
                  '○',
                  'Notifications',
                  notificationsEnabled,
                  setNotificationsEnabled,
                  notificationsEnabled ? 'Activees' : 'Desactivees'
                )}
              </View>
              <View style={styles.preferenceGrid}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Text style={styles.settingIcon}>🔊</Text>
                    <Text style={styles.settingLabel}>Sons du jeu</Text>
                  </View>
                  <View style={styles.soundControls}>
                    <Text style={styles.soundBar}>—</Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONFIDENTIALITE</Text>
            <View style={styles.sectionContent}>
              <View style={styles.preferenceGrid}>
                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>@</Text>
                  <Text style={styles.preferenceLabel}>
                    Profil: {profilePublic ? 'Public' : 'Prive'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Invitation automatique</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.preferenceGrid}>
                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>👥</Text>
                  <Text style={styles.preferenceLabel}>Invitaote auto oji</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Amis seulement</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToProfile}
          >
            <Text style={styles.backButtonText}>Revenir au profil</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    color: '#00ff88',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(10, 10, 26, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    color: '#00ff88',
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 14,
  },
  settingValue: {
    color: '#888',
    fontSize: 14,
  },
  chevron: {
    color: '#00ff88',
    fontSize: 20,
    marginLeft: 8,
  },
  logoutRow: {
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    margin: 12,
    borderRadius: 8,
  },
  logoutIcon: {
    color: '#ff4444',
    fontSize: 16,
    marginRight: 12,
  },
  logoutLabel: {
    color: '#ff4444',
    fontSize: 14,
  },
  preferenceGrid: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  preferenceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  preferenceIcon: {
    color: '#00ff88',
    fontSize: 14,
    marginRight: 8,
  },
  preferenceLabel: {
    color: '#ffffff',
    fontSize: 12,
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#00ff88',
    fontSize: 12,
    marginRight: 8,
  },
  soundControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundBar: {
    color: '#00ff88',
    fontSize: 16,
    marginRight: 8,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
});
