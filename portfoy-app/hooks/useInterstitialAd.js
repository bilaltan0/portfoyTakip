/**
 * useInterstitialAd.js — Google AdMob Interstitial (Tam Sayfa Geçiş) Reklam Hook'u
 *
 * PROFESYONELCİ REKLAMCı STRATEJİSİ:
 *   - Kullanıcı sıkılmadan, doğal kullanım akışına entegre
 *   - İlk 2 dakika hiç gösterme (uygulama açılışında hemen reklam yok)
 *   - Her 120 saniyede en fazla 1 gösterim
 *   - Her 4 ekran açılışından birinde göster
 *   - Oturum başına maksimum 4 interstitial
 *
 * KULLANIM:
 *   const { showInterstitialIfReady, trackOpen } = useInterstitialAd();
 *   // Doğal geçiş anlarında çağır:
 *   trackOpen();                    // Ekran açılışlarını say
 *   showInterstitialIfReady();      // Frekans uygunsa gösterir
 *
 * TETİKLEME NOKTALARI (profesyonel entegrasyon):
 *   1. Kategori detayına tıklama (Dashboard QuickViewCard)
 *   2. İşlem başarıyla kaydedildikten sonra (doğal tamamlanma)
 *   3. İşlem geçmişi ekranına geçişte
 *
 * GOOGLE POLİTİKA UYUMU:
 *   - Kullanıcı eyleminin doğal tamamlanmasında gösterilir
 *   - Zorla geçiş hissi verilmez
 *   - Kapatma butonu her zaman erişilebilir
 *   - Oturum başına limit ile aşırı gösterim engellenir
 */

import { useRef, useEffect, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useAd } from '../context/AdContext';
import { getAdUnitId, USE_TEST_ADS } from '../constants/adUnits';

// ─── Frekans ayarları (kullanıcı deneyimi odaklı) ────────────────────────────
/** İki interstitial arasındaki minimum süre (ms) */
const MIN_INTERVAL_MS = 120_000; // 2 dakika

/** İki gösterim arasındaki minimum ekran açılış sayısı */
const MIN_OPENS_BETWEEN = 4;

/** Uygulama açıldıktan sonraki bekleme süresi — ilk X ms içinde reklam gösterme */
const COLD_START_GRACE_MS = 120_000; // 2 dakika

/** Oturum başına maksimum interstitial sayısı */
const MAX_PER_SESSION = 4;

// ─── Native modül kontrolü ────────────────────────────────────────────────────
const isNativePresent = () =>
  !!(NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds);

// Uygulama başlatma zamanı (modül yüklendiğinde sabitlenir)
const APP_START_TIME = Date.now();

export default function useInterstitialAd() {
  const { enabled, initialized } = useAd();

  const interstitialRef = useRef(null);
  const isLoadedRef = useRef(false);
  const lastShownAtRef = useRef(0);
  const opensSinceLastShowRef = useRef(0);
  const sessionShowCountRef = useRef(0);
  const unsubRef = useRef(null);

  // ─── Reklam nesnesi oluştur ve yükle ────────────────────────────────────────
  const loadAd = useCallback(() => {
    if (!enabled || !isNativePresent()) return;

    try {
      // eslint-disable-next-line global-require
      const { InterstitialAd, AdEventType, TestIds } = require('react-native-google-mobile-ads');

      const adUnitId = getAdUnitId('INTERSTITIAL', TestIds);
      if (!adUnitId) {
        console.warn('⚠️ Interstitial ad unit ID is empty');
        return;
      }

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
      console.log('📣 Interstitial yükleme başlatıldı, unitId:', adUnitId);
    } catch (e) {
      console.debug('Interstitial SDK kullanılamıyor:', e?.message || e);
    }
  }, [enabled]);

  // ─── SDK hazır olunca yükle ──────────────────────────────────────────────────
  useEffect(() => {
    if (enabled && initialized) {
      loadAd();
    }
    return () => {
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (_) {}
        unsubRef.current = null;
      }
    };
  }, [enabled, initialized, loadAd]);

  // ─── Dışa açık API ────────────────────────────────────────────────────────────

  /**
   * Açılış sayacını artır.
   * Ekranlar arası geçişte veya kategori açılışında çağır.
   */
  const trackOpen = useCallback(() => {
    opensSinceLastShowRef.current += 1;
    console.log(`📊 trackOpen: ${opensSinceLastShowRef.current} açılış (sonraki reklam ${MIN_OPENS_BETWEEN} açılışta)`);
  }, []);

  /**
   * Reklam hazırsa ve frekans limitine ulaşıldıysa göster.
   * Profesyonel frekans kontrolü:
   *   1. Soğuk başlatma koruması (ilk 2 dk reklam yok)
   *   2. Oturum limiti (maks 4 reklam)
   *   3. Minimum süre kontrolü (120 sn)
   *   4. Minimum açılış kontrolü (4 açılış)
   *
   * @returns {boolean} Reklam gösterildi mi?
   */
  const showInterstitialIfReady = useCallback(() => {
    if (!enabled) return false;
    if (!isNativePresent()) return false;
    if (!isLoadedRef.current || !interstitialRef.current) return false;

    const now = Date.now();

    // 1. Soğuk başlatma koruması — uygulamanın ilk 2 dakikasında reklam gösterme
    const timeSinceAppStart = now - APP_START_TIME;
    if (timeSinceAppStart < COLD_START_GRACE_MS) {
      console.log(`🧊 Soğuk başlatma koruması: ${Math.round(timeSinceAppStart / 1000)}s / ${COLD_START_GRACE_MS / 1000}s`);
      return false;
    }

    // 2. Oturum limiti — bu oturumda çok fazla reklam gösterme
    if (sessionShowCountRef.current >= MAX_PER_SESSION) {
      console.log(`🚫 Oturum limiti: ${sessionShowCountRef.current}/${MAX_PER_SESSION} reklam gösterildi`);
      return false;
    }

    // 3. Süre kontrolü
    const timeSinceLast = now - lastShownAtRef.current;
    const timeOk = lastShownAtRef.current === 0 || timeSinceLast >= MIN_INTERVAL_MS;

    // 4. Açılış sayısı kontrolü
    const opensSinceLast = opensSinceLastShowRef.current;
    const opensOk = lastShownAtRef.current === 0 || opensSinceLast >= MIN_OPENS_BETWEEN;

    if (!timeOk || !opensOk) {
      console.log(
        `⏳ Interstitial bekleniyor: ${Math.round(timeSinceLast / 1000)}s geçti (min ${MIN_INTERVAL_MS / 1000}s), ${opensSinceLast} açılış (min ${MIN_OPENS_BETWEEN})`,
      );
      return false;
    }

    try {
      interstitialRef.current.show();
      lastShownAtRef.current = now;
      opensSinceLastShowRef.current = 0;
      sessionShowCountRef.current += 1;
      console.log(`🎬 Interstitial gösterildi (oturum: ${sessionShowCountRef.current}/${MAX_PER_SESSION})`);
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
