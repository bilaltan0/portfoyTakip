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
import Svg, { Circle, Path } from 'react-native-svg';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import TransactionScreen from './screens/TransactionScreen';
import MoreScreen from './screens/MoreScreen';

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
            tabBarIcon: ({ color }) => (
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path d="M3 9 L12 2 L21 9 L21 20 C21 20.5 20.5 21 20 21 L4 21 C3.5 21 3 20.5 3 20 Z" fill={color} />
              </Svg>
            ),
          }}
        />
        <Tab.Screen 
          name="İşlem Yap" 
          component={TransactionScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} fill="none" />
                <Path d="M12 8 L12 16 M8 12 L16 12" stroke={color} strokeWidth={2} />
              </Svg>
            ),
          }}
        />
        <Tab.Screen 
          name="Daha Fazla" 
          component={MoreScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={6} r={2} fill={color} />
                <Circle cx={12} cy={12} r={2} fill={color} />
                <Circle cx={12} cy={18} r={2} fill={color} />
              </Svg>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// All styles moved to respective screen files
