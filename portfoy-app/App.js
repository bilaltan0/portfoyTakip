/**
 * App.js - Ana Uygulama Dosyası
 * 
 * AMAÇ:
 * Uygulamanın navigation (gezinme) yapısını yönetir.
 * Ekranları birbirine bağlar ve alt tab navigation'ı yapılandırır.
 * 
 * İÇERİK:
 * - NavigationContainer: React Navigation wrapper
 * - Bottom Tab Navigator: Alt sekme çubuğu (3 sekme)
 *   1. Ana Sayfa → DashboardScreen
 *   2. İşlem Yap → TransactionScreen
 *   3. Daha Fazla → MoreScreen
 * - SVG İkonlar: Her sekme için özel çizilmiş ikonlar
 * - Tema Renkleri: constants/theme.js'den import edilir
 * 
 * NOT:
 * Bu dosya SADECE navigation logic içerir.
 * Ekran içerikleri screens/ klasöründe,
 * Bileşenler components/ klasöründe,
 * Sabitler constants/ klasöründedir.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Context Providers
import { PortfolioProvider } from './context/PortfolioContext';
import { SubCategoryProvider } from './context/SubCategoryContext';
import { AdProvider } from './context/AdContext';
import RatingPrompt from './components/RatingPrompt';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import TransactionScreen from './screens/TransactionScreen';
import MoreScreen from './screens/MoreScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import HelpScreen from './screens/HelpScreen';

// Icons
import { HomeIcon, TransactionIcon, MoreIcon } from './components/icons';

// Constants
import { COLORS } from './constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator Component
function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.white,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: COLORS.darkBlue,
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen 
        name="Ana Sayfa" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Ana Sayfa tab'ına her tıklamada navigation stack'i resetle
            navigation.reset({
              index: 0,
              routes: [{ name: 'Ana Sayfa' }],
            });
          },
        })}
      />
      <Tab.Screen 
        name="İşlem Yap" 
        component={TransactionScreen}
        options={{
          tabBarIcon: ({ color }) => <TransactionIcon size={28} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Daha Fazla" 
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color }) => <MoreIcon size={28} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PortfolioProvider>
        <SubCategoryProvider>
          <AdProvider>
            <RatingPrompt />
            <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
              <Stack.Screen name="Help" component={HelpScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          </AdProvider>
        </SubCategoryProvider>
      </PortfolioProvider>
    </SafeAreaProvider>
  );
}

// All styles moved to respective screen files
