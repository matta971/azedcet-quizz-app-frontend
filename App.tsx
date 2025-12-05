import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { AppNavigator } from './src/navigation';
import i18n, { changeLanguage } from './src/i18n';
import { useAuthStore } from './src/stores';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user } = useAuthStore();

  // Sync language with user's preferred language
  useEffect(() => {
    if (user?.preferredLanguage) {
      changeLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AppContent />
      </I18nextProvider>
    </QueryClientProvider>
  );
}
