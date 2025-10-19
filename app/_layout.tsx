import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { UserProvider } from '@/context/appContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import RouteGaurd from '@/lib/routeGuard';
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
  // const [storageCleared, setStorageCleared] = useState(false);
  // const [flag, setFlag] = useState<string | boolean | null>(null)

  // const loadOnboarding = async () => {
  //   const flag = await AsyncStorage.getItem("hasOnboarded");
  //   setFlag(flag)
  // }

  // useEffect(() => {
  //   const clearStorage = async () => {
  //     try {
  //       await AsyncStorage.clear();
  //       console.log('AsyncStorage cleared');
  //       setStorageCleared(true);
  //     } catch (error) {
  //       console.error('Error clearing storage:', error);
  //       setStorageCleared(true);
  //     }
  //   };

  //   clearStorage();
  // }, [flag]);

  // // Wait until storage is cleared before rendering the app
  // if (!storageCleared) {
  //   return null;
  // }

  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <RouteGaurd>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGaurd>
        </SafeAreaProvider>
      </PaperProvider>
    </UserProvider>
  );
}