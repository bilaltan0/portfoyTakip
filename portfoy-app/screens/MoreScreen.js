/**
 * MoreScreen.js - Daha Fazla Menüsü
 * 
 * AMAÇ:
 * Uygulamanın ikincil özelliklerine erişim sağlayan menü ekranı.
 * 
 * PLANLANAN ÖZELLİKLER:
 * - Profil Bilgileri (kullanıcı adı, email, avatar)
 * - Ayarlar (tema, dil, bildirim tercihleri)
 * - Bildirimler (geçmiş bildirimler listesi)
 * - Yardım & Destek (SSS, iletişim)
 * - Hakkında (uygulama versiyonu, gizlilik politikası)
 * - Çıkış Yap
 * 
 * DURUM:
 * Şu an sadece placeholder (yer tutucu) ekran.
 * Gerçek menü yapısı sonraki aşamalarda eklenecek.
 * 
 * NOT:
 * Bu ekran Tab Navigator'da "Daha Fazla" sekmesi ile erişiliyor.
 * Liste yapısı için FlatList veya ScrollView kullanılacak.
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { SettingsIcon, TrashIcon, HelpCircleIcon, InfoIcon } from '../components/icons';
import { usePortfolio } from '../context/PortfolioContext';

export default function MoreScreen() {
  const { clearAllData } = usePortfolio();

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Verileri Temizle',
      'Tüm portföyler ve işlemler silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('✅', 'Veriler temizlendi!');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 'settings',
      title: 'Ayarlar',
      subtitle: 'Tema, bildirimler, tercihler',
      icon: SettingsIcon,
      onPress: () => Alert.alert('Ayarlar', 'Yakında eklenecek'),
    },
    {
      id: 'help',
      title: 'Yardım & SSS',
      subtitle: 'Sık sorulan sorular ve destek',
      icon: HelpCircleIcon,
      onPress: () => Alert.alert('Yardım', 'Yakında eklenecek'),
    },
    {
      id: 'about',
      title: 'Hakkında',
      subtitle: 'Versiyon ve uygulama bilgileri',
      icon: InfoIcon,
      onPress: () => Alert.alert('PortföyMate', 'Versiyon 1.0.0\n© 2025'),
    },
    {
      id: 'debug',
      title: 'Verileri Temizle',
      subtitle: 'Tüm portföy ve işlem verilerini sil',
      icon: TrashIcon,
      onPress: handleClearData,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daha Fazla</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={[
                  styles.iconContainer,
                  item.danger && styles.iconContainerDanger
                ]}>
                  <Icon 
                    size={24} 
                    color={item.danger ? COLORS.red : COLORS.darkBlue} 
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[
                    styles.menuTitle,
                    item.danger && styles.menuTitleDanger
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PortföyMate</Text>
          <Text style={styles.footerVersion}>Versiyon 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkBlue,
  },
  scroll: {
    padding: 16,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerDanger: {
    backgroundColor: '#FFE5E5',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  menuTitleDanger: {
    color: COLORS.red,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkBlue,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: COLORS.mediumGray,
  },
});
