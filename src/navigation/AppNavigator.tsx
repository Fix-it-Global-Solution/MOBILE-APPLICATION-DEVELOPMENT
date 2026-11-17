import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FixItLogo } from '../components/FixItLogo';
import { useAuth } from '../context/AuthContext';
import { useOcorrencias } from '../context/OcorrenciaContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CreateOcorrenciaScreen } from '../screens/CreateOcorrenciaScreen';
import { MyOcorrenciasScreen } from '../screens/MyOcorrenciasScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { colors, FixItNavigationTheme, spacing } from '../styles/theme';
import { AuthStackParamList, MainTabParamList } from '../types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTab = createBottomTabNavigator<MainTabParamList>();

export const AuthStackNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

export const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();
  const { ocorrencias, minhasOcorrencias } = useOcorrencias();
  const isGestor = user?.perfil === 'ROLE_GESTOR';
  const badgeCount = isGestor ? ocorrencias.length : minhasOcorrencias.length;

  return (
    <AppTab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'map-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'CreateOcorrencia') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'MyOcorrencias') {
            iconName = focused ? 'list-circle' : 'list-outline';
          } else if (route.name === 'About') {
            iconName = focused
              ? 'information-circle'
              : 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <AppTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Mapa & Painel' }}
      />
      <AppTab.Screen
        name="CreateOcorrencia"
        component={CreateOcorrenciaScreen}
        options={{ title: 'Nova Ocorrência' }}
      />
      <AppTab.Screen
        name="MyOcorrencias"
        component={MyOcorrenciasScreen}
        options={{
          title: isGestor ? 'Gestão de OS' : 'Meus Chamados',
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: isGestor ? colors.accent : colors.primary,
            color: colors.textInverse,
            fontSize: 10,
            fontWeight: '800',
          },
        }}
      />
      <AppTab.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Sobre o App' }}
      />
    </AppTab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <FixItLogo size="lg" showTagline />
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 24 }}
        />
        <Text style={styles.loadingText}>
          Verificando sessão segura JWT...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={FixItNavigationTheme}>
      {user != null && isAuthenticated ? (
        <MainTabNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});
