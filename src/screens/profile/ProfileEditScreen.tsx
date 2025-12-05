import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { apiService } from '../../services';
import { RootStackParamList } from '../../navigation/types';
import { Language, UpdateProfileRequest } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export function ProfileEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [country, setCountry] = useState(user?.country || '');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(
    user?.preferredLanguage || 'FR'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const validateBirthDate = (date: string): boolean => {
    if (!date) return true;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  };

  const handleSave = async () => {
    setError(null);

    if (birthDate && !validateBirthDate(birthDate)) {
      setError('Format de date invalide (AAAA-MM-JJ)');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UpdateProfileRequest = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        birthDate: birthDate || undefined,
        country: country || undefined,
        preferredLanguage,
      };

      const response = await apiService.updateProfile(updateData);

      if (response.success && response.data) {
        // Update the user in the store
        setUser(response.data);
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        navigation.goBack();
      } else {
        setError(response.error?.message || 'Erreur lors de la mise à jour');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const getCountryName = () => {
    const found = COUNTRIES.find((c) => c.code === country);
    return found ? found.name : 'Sélectionner un pays';
  };

  const getLanguageName = () => {
    const found = LANGUAGES.find((l) => l.code === preferredLanguage);
    return found ? found.name : 'Sélectionner une langue';
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.title}>MODIFIER LE PROFIL</Text>
          <Text style={styles.subtitle}>
            Mettez à jour vos informations personnelles
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* User Info (read-only) */}
          <View style={styles.readOnlySection}>
            <Text style={styles.sectionLabel}>Informations du compte</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Pseudo</Text>
              <Text style={styles.readOnlyValue}>{user?.handle}</Text>
            </View>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Email</Text>
              <Text style={styles.readOnlyValue}>{user?.email}</Text>
            </View>
          </View>

          {/* Editable Fields */}
          <Text style={styles.sectionLabel}>Informations personnelles</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Prénom"
              placeholderTextColor="#666"
              value={firstName}
              onChangeText={setFirstName}
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Nom"
              placeholderTextColor="#666"
              value={lastName}
              onChangeText={setLastName}
              autoCorrect={false}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Date de naissance (AAAA-MM-JJ)"
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
            <Text
              style={[styles.pickerButtonText, !country && styles.placeholderText]}
            >
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

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={styles.saveButtonText}>ENREGISTRER</Text>
            )}
          </TouchableOpacity>
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
              <Text style={styles.modalTitle}>Sélectionner un pays</Text>
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
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCountryPicker(false)}
              >
                <Text style={styles.modalCloseText}>Fermer</Text>
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
              <Text style={styles.modalTitle}>Langue préférée</Text>
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
                        preferredLanguage === item.code &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLanguagePicker(false)}
              >
                <Text style={styles.modalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: '#00ff88',
    fontSize: 14,
  },
  title: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
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
  sectionLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  readOnlySection: {
    backgroundColor: 'rgba(22, 33, 62, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.1)',
  },
  readOnlyField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  readOnlyLabel: {
    color: '#666',
    fontSize: 14,
  },
  readOnlyValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
  saveButton: {
    backgroundColor: '#00ff88',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
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
