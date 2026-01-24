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

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { SettingsIcon, TrashIcon, HelpCircleIcon, TransactionIcon } from '../components/icons';
import { usePortfolio } from '../context/PortfolioContext';
// useSubCategories not needed in MoreScreen after removing subcategory reset option
import { useAd } from '../context/AdContext';
import MenuItem from '../components/MenuItem';
import AdBanner from '../components/AdBanner';
// Debug storage helpers removed — no longer needed in MoreScreen
import Constants from 'expo-constants';
import { Linking } from 'react-native';

// DebugPanel removed — test UI for reward unlock was deprecated

function AdsSwitch() {
  const { enabled, setEnableAds, initialized } = useAd();

  if (!initialized) {
    return <Switch value={false} onValueChange={() => {}} disabled />;
  }

  return (
    <Switch
      value={!!enabled}
      onValueChange={(v) => setEnableAds(!!v)}
    />
  );
}

// TestAdsSwitch removed: consolidated into single 'Reklamları Göster' switch

export default function MoreScreen({ navigation }) {
  const { clearAllData, activePortfolio } = usePortfolio();
  // subcategory clearing moved to dedicated editor; no handler needed here
  const appVersion = Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0';
  const buildNumber =
    Constants.expoConfig?.android?.versionCode ||
    Constants.manifest?.android?.versionCode ||
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.manifest?.ios?.buildNumber ||
    null;

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

  // handleClearSubCategories removed — subcategory clearing is handled in editor UI

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
      id: 'rate_now',
      title: 'Uygulamayı Değerlendir',
      subtitle: 'Hemen kısa bir değerlendirme yapın',
      icon: HelpCircleIcon,
      onPress: async () => {
        try {
          const InAppReview = require('react-native-in-app-review');
          if (InAppReview && InAppReview.isAvailable && InAppReview.isAvailable()) {
            await InAppReview.RequestInAppReview();
            return;
          }
        } catch (e) {
          console.debug('In-app review module not available', e);
        }
        // Fallback: open Play Store
        const pkg = Constants.expoConfig?.android?.package || Constants.manifest?.android?.package;
        if (!pkg) return;
        const androidUrl = `market://details?id=${pkg}`;
        const webUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
        Linking.openURL(androidUrl).catch(() => Linking.openURL(webUrl));
      }
    },
    {
      id: 'debug',
      title: 'Verileri Temizle',
      subtitle: 'Tüm portföy ve işlem verilerini sil',
      icon: TrashIcon,
      onPress: handleClearData,
      danger: true,
    },
    // 'Alt Kategorileri Sıfırla' removed from More menu; subcategory edits/deletes handled elsewhere
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daha Fazla</Text>
      </View>
      {/* Move banner up so it's visible on smaller screens */}
      <AdBanner style={{ marginTop: 8, marginHorizontal: 16 }} />

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

        {/* Ads Toggle */}
        <View style={styles.adsToggleCard}>
          <View style={styles.adsTextContainer}>
            <Text style={styles.adsTitle}>Reklamları Göster</Text>
            <Text style={styles.adsSubtitle}>Kapalı test sırasında reklamları açıp kapatabilirsiniz.</Text>
          </View>
          <View style={styles.adsSwitch}>
            <AdsSwitch />
          </View>
        </View>

        {/* Test Ads toggle removed; use single 'Reklamları Göster' switch */}

    {/* (Banner moved above) */}

        {/* Debug panel removed — reward/unlock state is now single-use and no longer persisted */}

        {/* Spacer - Alt kısmı aşağı iter */}
        <View style={{ flex: 1, minHeight: 100 }} />

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            PortföyMate • Versiyon {appVersion}{buildNumber ? ` (build ${buildNumber})` : ''}
          </Text>
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
    flexGrow: 1,
  },
  menuSection: {
    // MenuItem component'i kendi stilini yönetiyor
  },
  adsToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  adsTextContainer: {
    flex: 1,
  },
  adsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  adsSubtitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  adsSwitch: {
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  debugCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  debugBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  debugBtnDanger: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
