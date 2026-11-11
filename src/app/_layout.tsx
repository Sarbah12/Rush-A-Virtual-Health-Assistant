import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { AppStateProvider, useAppState } from '@/lib/app-state';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AppStateProvider>
  );
}

function RootStack() {
  const { ready, onboarded } = useAppState();
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  // If the font ever fails to load, carry on with the system font.
  const fontsDone = fontsLoaded || fontError != null;

  useEffect(() => {
    if (ready && fontsDone) SplashScreen.hideAsync();
  }, [ready, fontsDone]);

  if (!ready || !fontsDone) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      {/* First run: intro → consent → medical information → success. */}
      {/* redirectTo makes a fresh install land on the intro rather than on
          whichever first-run screen sorts first alphabetically. */}
      <Stack.Protected guard={!onboarded} redirectTo="/">

        <Stack.Screen name="onboarding" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="register" />
        <Stack.Screen name="success" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={onboarded} redirectTo="/onboarding">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sos" />
        <Stack.Screen name="medical-id" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="languages" />
        <Stack.Screen name="about" />
        <Stack.Screen name="log" />
        <Stack.Screen name="meds" />
        <Stack.Screen name="med-edit" />
        <Stack.Screen name="symptoms" />
        <Stack.Screen name="library" />
        <Stack.Screen name="article" />
        <Stack.Screen name="recipes" />
        <Stack.Screen name="recipe" />
      </Stack.Protected>
    </Stack>
  );
}
