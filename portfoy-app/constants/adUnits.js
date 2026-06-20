/**
 * adUnits.js — Google AdMob Reklam Birimi ID'leri
 *
 * ⚠️ KURULUM ADIMLARI:
 * 1. admob.google.com → Uygulamalar → Uygulama ekle → Play Store'dan "com.bilaltan.portfoyapp" bul
 * 2. Uygulama App ID'yi aşağıya gir (ANDROID_APP_ID)
 * 3. Her reklam birimi için bir Ad Unit oluştur ve aşağıya gir
 * 4. app.json içindeki "react-native-google-mobile-ads" → "android_app_id" alanını da güncelle
 *
 * Test ID'leri (TestIds) otomatik olarak __DEV__ veya enableTestAds=true durumunda kullanılır.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── ✏️ BURAYA GER​ÇEK ID'LERİNİ GİR ──────────────────────────────────────────

/** AdMob Console → Uygulamalar → Uygulama detayı → App ID */
export const ANDROID_APP_ID = 'ca-app-pub-7650437807511951~2465256081';

/** Reklam Birimi ID'leri */
const AD_UNITS_ANDROID = {
  /** Banner reklam birimi (DashboardScreen alt/üst) */
  BANNER: 'ca-app-pub-7650437807511951/3122476028',

  /** Tam sayfa geçiş reklamı (kategori açılışlarında) */
  INTERSTITIAL: 'ca-app-pub-7650437807511951/3941989284',

  /** Ödüllü video — kullanılmıyor */
  REWARDED: '',
};

// iOS için (ileride gerekirse)
const AD_UNITS_IOS = {
  BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

// ─── Test modu tespiti ──────────────────────────────────────────────────────────

/**
 * Test reklamları kullan mı?
 * - __DEV__ modunda (Expo Go / Metro) her zaman test
 * - enableTestAds=true build flag'i ile de test
 * - Production build'de (enableTestAds=false) gerçek reklamlar
 */
export const USE_TEST_ADS = __DEV__ || !!Constants.expoConfig?.extra?.enableTestAds;

// ─── Aktif platform ID'lerini dışa aktar ─────────────────────────────────────

const RAW_UNITS = Platform.OS === 'ios' ? AD_UNITS_IOS : AD_UNITS_ANDROID;

export const AD_UNITS = RAW_UNITS;

// ─── Kolayca kullanım için helper ─────────────────────────────────────────────

/**
 * Reklam birimi ID'sini döner.
 * Test modunda Google'ın resmi test ID'lerini, production'da gerçek ID'yi kullanır.
 * @param {'BANNER'|'INTERSTITIAL'|'REWARDED'} type
 * @param {object} TestIds — react-native-google-mobile-ads'ten import edilmeli
 */
export function getAdUnitId(type, TestIds) {
  if (USE_TEST_ADS && TestIds) {
    const testMap = {
      BANNER: TestIds.BANNER,
      INTERSTITIAL: TestIds.INTERSTITIAL,
      REWARDED: TestIds.REWARDED,
    };
    return testMap[type] || AD_UNITS[type];
  }
  return AD_UNITS[type];
}
