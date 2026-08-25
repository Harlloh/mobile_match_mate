import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import 'react-native-reanimated';

import { useAuth, UserProvider } from '@/context/appContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import RouteGaurd from '@/lib/routeGuard';
import { leagueCacheTime, leagueQueryKey } from '@/services/useLeagues';
import { teamCatalogueCacheTime, teamCatalogueQueryRoot } from '@/services/useTeams';
import { Image, LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

// Apply the longer garbage-collection time only to league data.
queryClient.setQueryDefaults(leagueQueryKey, {
  gcTime: leagueCacheTime,
});

queryClient.setQueryDefaults(teamCatalogueQueryRoot, {
  gcTime: teamCatalogueCacheTime,
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'MATCH_MATE_QUERY_CACHE',
});

export const unstable_settings = {
  anchor: '(tabs)',
};

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: "#f9fafb",
    surface: "#ffffff",
    primary: "#10b981",
    outline: "#e5e7eb",
    onSurfaceVariant: "#6b7280",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Disable all error/warning overlays
  if (!__DEV__) {
    LogBox.ignoreAllLogs(true);
    console.error = () => { };
    console.warn = () => { };
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: leagueCacheTime,
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            (query.queryKey[0] === leagueQueryKey[0] ||
              query.queryKey[0] === teamCatalogueQueryRoot[0]) &&
            query.state.status === 'success',
        },
      }}
    >
      <UserProvider>
        <AppContent />
      </UserProvider>
    </PersistQueryClientProvider>
  );
}


function AppContent() {
  const { isLoading, hasOnboarded, routeGuardReady } = useAuth();


  if (isLoading || hasOnboarded === null) {
    return (
      <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Image
          source={require('../assets/images/match_mate_logo.jpg')}
          style={{ width: 120, height: 120, borderRadius: 12, }}
          resizeMode="contain"
        />
        <Text>Loading from app base...</Text>
      </View>
    );
  }
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <RouteGaurd>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RouteGaurd>
      </SafeAreaProvider>
    </PaperProvider>
  )
}
