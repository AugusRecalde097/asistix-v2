import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';
import { seedDemoData } from './src/storage/db';

export default function App() {
  useEffect(() => {
    seedDemoData().catch((e) => {
      // No bloqueamos la app si falla el seed.
      console.log('seedDemoData error:', e);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
