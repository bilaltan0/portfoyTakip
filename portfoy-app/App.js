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

// Screens
import DashboardScreen from './screens/DashboardScreen';
import TransactionScreen from './screens/TransactionScreen';
import MoreScreen from './screens/MoreScreen';

// Icons
import { HomeIcon, TransactionIcon, MoreIcon } from './components/icons';

// Constants
import { COLORS } from './constants/theme';

const Tab = createBottomTabNavigator();



export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.gold,
          tabBarInactiveTintColor: COLORS.white,
          tabBarStyle: {
            height: 64,
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
    </NavigationContainer>
  );
}

// All styles moved to respective screen files
