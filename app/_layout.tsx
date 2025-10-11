import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/use-color-scheme';
import RouteGaurd from '@/lib/routeGuard';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};




export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // <UserProvider>
    <PaperProvider>


      {/* <ThemeProvider value={colorScheme !== 'dark' ? DarkTheme : DefaultTheme}> */}
      <SafeAreaProvider>
        <RouteGaurd>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RouteGaurd>
      </SafeAreaProvider>
      {/* </ThemeProvider> */}
    </PaperProvider>
    // </UserProvider>
  );
}
