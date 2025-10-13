import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};


const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: "#f9fafb", // light gray page bg
    surface: "#ffffff",    // keeps cards and inputs white
    primary: "#10b981",    // your brand green
    outline: "#e5e7eb",    // soft gray outline
    onSurfaceVariant: "#6b7280", // text inside inputs
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // <UserProvider>
    <PaperProvider theme={theme}>


      {/* <ThemeProvider value={colorScheme !== 'dark' ? DarkTheme : DefaultTheme}> */}
      <SafeAreaProvider>
        {/* <RouteGaurd> */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {/* </RouteGaurd> */}
      </SafeAreaProvider>
      {/* </ThemeProvider> */}
    </PaperProvider>
    // </UserProvider>
  );
}
