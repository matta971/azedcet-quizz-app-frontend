import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores';
import { AuthScreenProps } from '../../navigation/types';
import { Language } from '../../types';

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'FR', name: 'Français' },
  { code: 'FON', name: 'Fɔngbè' },
  { code: 'CR', name: 'Créole' },
  { code: 'EN', name: 'English' },
  { code: 'PT', name: 'Português' },
  { code: 'ES', name: 'Español' },
  { code: 'AR', name: 'العربية' },
  { code: 'ZH', name: '中文' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'IT', name: 'Italiano' },
];

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'BEN', name: 'Bénin' },
  { code: 'FRA', name: 'France' },
  { code: 'SEN', name: 'Sénégal' },
  { code: 'CIV', name: "Côte d'Ivoire" },
  { code: 'CMR', name: 'Cameroun' },
  { code: 'MAR', name: 'Maroc' },
  { code: 'TUN', name: 'Tunisie' },
  { code: 'DZA', name: 'Algérie' },
  { code: 'BEL', name: 'Belgique' },
  { code: 'CHE', name: 'Suisse' },
  { code: 'CAN', name: 'Canada' },
  { code: 'USA', name: 'États-Unis' },
  { code: 'GBR', name: 'Royaume-Uni' },
  { code: 'DEU', name: 'Allemagne' },
  { code: 'ESP', name: 'Espagne' },
  { code: 'PRT', name: 'Portugal' },
  { code: 'BRA', name: 'Brésil' },
  { code: 'CHN', name: 'Chine' },
];

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { t } = useTranslation();
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState<string>('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('FR');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const { register, isLoading, error, clearError } = useAuthStore();

  const validateBirthDate = (date: string): boolean => {
    if (!date) return true; // Optional field
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  };

  const handleRegister = async () => {
    setLocalError(null);

    if (!handle.trim() || !email.trim() || !password.trim()) {
      setLocalError(t('auth.errors.requiredFields'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.errors.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setLocalError(t('auth.errors.passwordTooShort'));
      return;
    }

    if (birthDate && !validateBirthDate(birthDate)) {
      setLocalError(t('auth.errors.invalidDateFormat'));
      return;
    }

    await register({
      handle: handle.trim(),
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      birthDate: birthDate || undefined,
      country: country || undefined,
      preferredLanguage,
    });
  };

  const getCountryName = () => {
    const found = COUNTRIES.find((c) => c.code === country);
    return found ? t(`countries.${found.code}`) : t('auth.selectCountry');
  };

  const getLanguageName = () => {
    const found = LANGUAGES.find((l) => l.code === preferredLanguage);
    return found ? t(`languages.${found.code}`) : t('auth.selectLanguage');
  };

  const handleNavigateToLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('app.name')}</Text>
          <Text style={styles.subtitle}>{t('auth.register')}</Text>

          {displayError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder={t('auth.handle')}
            placeholderTextColor="#666"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={styles.sectionLabel}>{t('auth.personalInfo')}</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={t('auth.firstName')}
              placeholderTextColor="#666"
              value={firstName}
              onChangeText={setFirstName}
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={t('auth.lastName')}
              placeholderTextColor="#666"
              value={lastName}
              onChangeText={setLastName}
              autoCorrect={false}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder={t('auth.birthDate')}
            placeholderTextColor="#666"
            value={birthDate}
            onChangeText={setBirthDate}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !country && styles.placeholderText]}>
              {getCountryName()}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowLanguagePicker(true)}
          >
            <Text style={styles.pickerButtonText}>{getLanguageName()}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>{t('auth.security')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder={t('auth.confirmPassword')}
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.registerButton')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleNavigateToLogin}>
            <Text style={styles.linkText}>{t('auth.hasAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('auth.selectCountry')}</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    country === item.code && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setCountry(item.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      country === item.code && styles.modalItemTextSelected,
                    ]}
                  >
                    {t(`countries.${item.code}`)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('auth.preferredLanguage')}</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    preferredLanguage === item.code && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setPreferredLanguage(item.code);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      preferredLanguage === item.code && styles.modalItemTextSelected,
                    ]}
                  >
                    {t(`languages.${item.code}`)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguagePicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  halfInput: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  placeholderText: {
    color: '#666',
  },
  pickerArrow: {
    color: '#666',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#00ff88',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#00ff88',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },
  modalItemTextSelected: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  modalCloseText: {
    color: '#888',
    fontSize: 16,
  },
});
