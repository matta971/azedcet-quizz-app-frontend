import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';
import fon from './locales/fon.json';
import cr from './locales/cr.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import de from './locales/de.json';
import it from './locales/it.json';

const LANGUAGE_STORAGE_KEY = '@mindsoccer_language';

const resources = {
  FR: { translation: fr },
  EN: { translation: en },
  FON: { translation: fon },
  CR: { translation: cr },
  PT: { translation: pt },
  ES: { translation: es },
  AR: { translation: ar },
  ZH: { translation: zh },
  DE: { translation: de },
  IT: { translation: it },
};

// Language detector that uses AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.error('Error reading language from storage:', error);
    }
    callback('FR'); // Default to French
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      console.error('Error saving language to storage:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'FR',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const changeLanguage = async (languageCode: string) => {
  await i18n.changeLanguage(languageCode);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;
