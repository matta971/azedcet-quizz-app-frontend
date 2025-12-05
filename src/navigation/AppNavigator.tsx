import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuthStore } from '../stores';

import { LoginScreen, RegisterScreen } from '../screens/auth';
import { LobbyScreen, MatchWaitingScreen, TeamLobbyScreen, DuelLobbyScreen } from '../screens/lobby';
import { GameScreen } from '../screens/game';
import { SmashGameScreen } from '../screens/game/SmashGameScreen';
import { HomeScreen } from '../screens/home';
import { LandingScreen } from '../screens/landing';
import { GameModesScreen } from '../screens/modes';
import { ProfileScreen } from '../screens/profile';
import { LeaderboardScreen } from '../screens/leaderboard';
import { SettingsScreen } from '../screens/settings';
import { TutorialScreen } from '../screens/tutorial';
import { GameListScreen } from '../screens/gamelist';
import { GameRulesScreen } from '../screens/gamerules';
import { TeamSetupScreen } from '../screens/teamsetup';
import { OpponentSelectScreen } from '../screens/opponentselect';

import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>{label}</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#0f3460',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color }) => <TabIcon label="A" color={color} />,
        }}
      />
      <Tab.Screen
        name="GameModes"
        component={GameModesScreen}
        options={{
          tabBarLabel: 'Modes',
          tabBarIcon: ({ color }) => <TabIcon label="M" color={color} />,
        }}
      />
      <Tab.Screen
        name="Lobby"
        component={LobbyScreen}
        options={{
          tabBarLabel: 'Lobby',
          tabBarIcon: ({ color }) => <TabIcon label="L" color={color} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Classement',
          tabBarIcon: ({ color }) => <TabIcon label="C" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon label="P" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="MatchWaiting"
              component={MatchWaitingScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{
                gestureEnabled: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="SmashGame"
              component={SmashGameScreen}
              options={{
                gestureEnabled: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Tutorial"
              component={TutorialScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="GameList"
              component={GameListScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="GameRules"
              component={GameRulesScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TeamSetup"
              component={TeamSetupScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="OpponentSelect"
              component={OpponentSelectScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="TeamLobby"
              component={TeamLobbyScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="DuelLobby"
              component={DuelLobbyScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
