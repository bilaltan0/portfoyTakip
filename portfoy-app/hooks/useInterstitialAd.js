/**
 * useInterstitialAd.js — Google AdMob Interstitial (Tam Sayfa Geçiş) Reklam Hook'u
 *
 * KULLANIM:
 *   const { showInterstitialIfReady } = useInterstitialAd();
 *   // Uygun bir anda (ekran geçişi, kategori açılışı vs.):
 *   showInterstitialIfReady();
 *
 * FREKANS KONTROLÜ:
 *   - Her MIN_INTERVAL_MS ms'de bir gösterir (varsayılan: 90 saniye)
 *   - Her MIN_OPENS_BETWEEN açılış arasında bir gösterir (varsayılan: 3 açılış)
 *   - İkisi birden sağlanmalı
 *
 * GOOGLE POLİTİKA UYUMU:
 *   - Kullanıcı eyleminin doğal tamamlanmasında gösterilir
 *   - Zorla geçiş hissi verilmez
 *   - Kapatma butonu her zaman erişilebilir
 */

import { useRef, useEffect, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useAd } from '../context/AdContext';
import { getAdUnitId, USE_TEST_ADS } from '../constants/adUnits';

// ─── Frekans ayarları ─────────────────────────────────────────────────────────
/** İki interstitial arasındaki minimum süre (ms) */
const MIN_INTERVAL_MS = 90_000; // 90 saniye
/** İki gösterim arasındaki minimum ekran açılış sayısı */
const MIN_OPENS_BETWEEN = 3;

// ─── Native modül kontrolü ────────────────────────────────────────────────────
const isNativePresent = () =>
  !!(NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds);

export default function useInterstitialAd() {
  const { enabled } = useAd();

  const interstitialRef = useRef(null);
  const isLoadedRef = useRef(false);
  const lastShownAtRef = useRef(0);
  const opensSinceLastShowRef = useRef(0);
  const unsubRef = useRef(null);

  // ─── Reklam nesnesi oluştur ve yükle ────────────────────────────────────────
  const loadAd = useCallback(() => {
    if (!enabled || !isNativePresent()) return;

    try {
      // eslint-disable-next-line global-require
      const { InterstitialAd, AdEventType, TestIds } = require('react-native-google-mobile-ads');

      const adUnitId = getAdUnitId('INTERSTITIAL', TestIds);
      const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      // Önceki listener'ı temizle
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (_) {}
        unsubRef.current = null;
      }

      const unsub = interstitial.onAdEvent((type, error) => {
        if (type === AdEventType.LOADED) {
          isLoadedRef.current = true;
          console.log('✅ Interstitial yüklendi');
        }
        if (type === AdEventType.CLOSED) {
          isLoadedRef.current = false;
          console.log('🚪 Interstitial kapatıldı, yeniden yükleniyor...');
          // Kapatıldıktan sonra bir sonraki için yeniden yükle
          loadAd();
        }
        if (type === AdEventType.ERROR) {
          isLoadedRef.current = false;
          console.warn('⚠️ Interstitial yükleme hatası:', error?.message || error);
          // 30 sn sonra tekrar dene
          setTimeout(() => loadAd(), 30_000);
        }
      });

      unsubRef.current = unsub;
      interstitialRef.current = interstitial;
      interstitial.load();
    } catch (e) {
      console.debug('Interstitial SDK kullanılamıyor:', e?.message || e);
    }
  }, [enabled]);

  // ─── İlk yükleme + enabled değişince yeniden yükle ──────────────────────────
  useEffect(() => {
    if (enabled) {
      loadAd();
    }
    return () => {
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (_) {}
        unsubRef.current = null;
      }
    };
  }, [enabled, loadAd]);

  // ─── Dışa açık API ────────────────────────────────────────────────────────────

  /**
   * Açılış sayacını artır.
   * Ekranlar arası geçişte veya kategori açılışında çağır.
   */
  const trackOpen = useCallback(() => {
    opensSinceLastShowRef.current += 1;
  }, []);

  /**
   * Reklam hazırsa ve frekans limitine ulaşıldıysa göster.
   * @returns {boolean} Reklam gösterildi mi?
   */
  const showInterstitialIfReady = useCallback(() => {
    if (!enabled) return false;
    if (!isNativePresent()) return false;
    if (!isLoadedRef.current || !interstitialRef.current) return false;

    const now = Date.now();
    const timeSinceLast = now - lastShownAtRef.current;
    const opensSinceLast = opensSinceLastShowRef.current;

    // Frekans kontrolü: süre VEYA açılış sayısı yeterliyse göster
    const timeOk = lastShownAtRef.current === 0 || timeSinceLast >= MIN_INTERVAL_MS;
    const opensOk = lastShownAtRef.current === 0 || opensSinceLast >= MIN_OPENS_BETWEEN;

    if (!timeOk || !opensOk) {
      console.log(
        `⏳ Interstitial bekleniyor: ${Math.round(timeSinceLast / 1000)}s geçti, ${opensSinceLast} açılış (min: ${MIN_INTERVAL_MS / 1000}s / ${MIN_OPENS_BETWEEN} açılış)`,
      );
      return false;
    }

    try {
      interstitialRef.current.show();
      lastShownAtRef.current = now;
      opensSinceLastShowRef.current = 0;
      console.log('🎬 Interstitial gösterildi');
      return true;
    } catch (e) {
      console.warn('Interstitial gösterilemedi:', e?.message || e);
      isLoadedRef.current = false;
      loadAd();
      return false;
    }
  }, [enabled, loadAd]);

  return {
    showInterstitialIfReady,
    trackOpen,
    isLoaded: isLoadedRef.current,
  };
}
