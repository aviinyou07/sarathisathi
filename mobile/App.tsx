import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useChatStore } from './src/store/useChatStore';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { MainNavigation } from './src/components/MainNavigation';

export default function App() {
  const { hasCompletedOnboarding } = useChatStore();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!hasCompletedOnboarding ? <OnboardingScreen /> : <MainNavigation />}
    </SafeAreaProvider>
  );
}
