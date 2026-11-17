import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { OcorrenciaProvider } from './src/context/OcorrenciaContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OcorrenciaProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </OcorrenciaProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
