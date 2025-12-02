import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageUtils = {
  getString: async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(key);
  },

  setString: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  setObject: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};

// Synchronous versions for use in interceptors (using cache)
let cache: Record<string, string> = {};

export const syncStorage = {
  getString: (key: string): string | undefined => {
    return cache[key];
  },

  setString: (key: string, value: string): void => {
    cache[key] = value;
    AsyncStorage.setItem(key, value).catch(console.error);
  },

  remove: (key: string): void => {
    delete cache[key];
    AsyncStorage.removeItem(key).catch(console.error);
  },

  loadCache: async (): Promise<void> => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    cache = Object.fromEntries(items.filter(([_, v]) => v !== null) as [string, string][]);
  },
};
