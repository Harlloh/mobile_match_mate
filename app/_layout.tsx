import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import 'react-native-reanimated';

import { useAuth, UserProvider } from '@/context/appContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import RouteGaurd from '@/lib/routeGuard';
import { Image, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
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