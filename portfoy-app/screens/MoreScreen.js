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
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { SettingsIcon, TrashIcon, HelpCircleIcon, InfoIcon, TransactionIcon } from '../components/icons';
import { usePortfolio } from '../context/PortfolioContext';
import MenuItem from '../components/MenuItem';

export default function MoreScreen({ navigation }) {
  const { clearAllData, activePortfolio } = usePortfolio();

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

  const handleTransactionHistory = () => {
    if (!activePortfolio) {
      Alert.alert('Uyarı', 'Lütfen önce bir portföy seçin.');
      return;
    }
    navigation.navigate('TransactionHistory');
  };

  const menuItems = [
    {
      id: 'history',
      title: 'İşlem Geçmişi',
      subtitle: 'Geçmiş alım-satım işlemlerini görüntüle',
      icon: TransactionIcon,
      onPress: handleTransactionHistory,
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      subtitle: 'Tema, bildirimler, tercihler',
      icon: SettingsIcon,
      onPress: () => Alert.alert('Ayarlar', 'Yakında eklenecek'),
    },
    {
      id: 'help',
      title: 'Yardım & Destek',
      subtitle: 'Öneri, şikayet ve destek talebi',
      icon: HelpCircleIcon,
      onPress: () => navigation.navigate('Help'),
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
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              onPress={item.onPress}
              danger={item.danger}
            />
          ))}
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
    // MenuItem component'i kendi stilini yönetiyor
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
