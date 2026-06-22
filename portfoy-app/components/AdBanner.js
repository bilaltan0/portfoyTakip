import React from 'react';
import { View, Text, StyleSheet, NativeModules, Platform, ActivityIndicator } from 'react-native';
import { useAd } from '../context/AdContext';
import { getAdUnitId } from '../constants/adUnits';

/**
 * AdBanner - uses react-native-google-mobile-ads when available,
 * otherwise falls back to a harmless placeholder used during development.
 *
 * Fixes applied:
 * - Loading state now shows a visible placeholder so the banner area
 *   doesn't collapse to zero height while the ad is being fetched.
 * - Retry logic: on failure the banner retries up to 3 times with
 *   exponential backoff before giving up.
 * - Better production logging for debugging ad delivery issues.
 */
export default function AdBanner({ style }) {
  const { enabled, initialized } = useAd();
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const retryCountRef = React.useRef(0);
  const retryTimerRef = React.useRef(null);

  const MAX_RETRIES = 3;

  // Re-run (remount) the native banner when ads are toggled
  React.useEffect(() => {
    setLoading(true);
    setFailed(false);
    retryCountRef.current = 0;
    setReloadKey(k => k + 1);

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  // Wait until the SDK has finished initializing before trying to render
  // a native ad. This prevents the banner from mounting before
  // MobileAds().initialize() has resolved, which can cause silent failures.
  if (!initialized) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color="#0891B2" />
        <Text style={styles.loadingText}>Reklam SDK yükleniyor…</Text>
      </View>
    );
  }

  // If the native module isn't present (e.g. Expo Go) avoid requiring the
  // package since it attempts to access TurboModuleRegistry at import time
  // which will throw. In that case show the development placeholder instead.
  const nativePresent = !!(
    NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
  );

  console.log(
    '🔍 AdBanner render — enabled:', enabled,
    '| initialized:', initialized,
    '| nativePresent:', nativePresent,
    '| __DEV__:', __DEV__,
    '| reloadKey:', reloadKey,
  );

  if (nativePresent) {
    try {
      // eslint-disable-next-line global-require
      const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

      const unitId = getAdUnitId('BANNER', TestIds);

      console.log('📣 AdBanner using unitId:', unitId);

      // Retry helper — bumps reloadKey after a delay to remount the banner.
      const scheduleRetry = () => {
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.pow(2, retryCountRef.current) * 5000; // 5s, 10s, 20s
          console.log(`🔄 AdBanner retry ${retryCountRef.current + 1}/${MAX_RETRIES} in ${delay}ms`);
          retryTimerRef.current = setTimeout(() => {
            retryCountRef.current += 1;
            setLoading(true);
            setFailed(false);
            setReloadKey(k => k + 1);
          }, delay);
        }
      };

      return (
        <View style={[styles.container, style]} key={`banner-${reloadKey}`}>
          <BannerAd
            unitId={unitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdLoaded={() => {
              setLoading(false);
              setFailed(false);
              retryCountRef.current = 0; // reset on success
              console.log('✅ Banner ad loaded successfully');
            }}
            onAdFailedToLoad={(err) => {
              setLoading(false);
              setFailed(true);
              console.warn('❌ Banner failed to load:', JSON.stringify(err));
              scheduleRetry();
            }}
          />
          {/* While the ad SDK is fetching, show a subtle loading indicator
              so the user sees *something* rather than invisible empty space. */}
          {loading && !failed && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="small" color="#0891B2" />
            </View>
          )}
          {/* If the SDK reports failure, render a visible placeholder so the
              user isn't left with a blank banner area. */}
          {failed && (
            <View style={styles.fallbackOverlay} pointerEvents="none">
              <Text style={styles.failedText}>
                {retryCountRef.current < MAX_RETRIES
                  ? '📣 Reklam yükleniyor…'
                  : '📣 Reklam şu an mevcut değil'}
              </Text>
            </View>
          )}
        </View>
      );
    } catch (e) {
      // If anything goes wrong after we determined nativePresent try/catch
      // will handle it and we'll fall back to placeholder.
      console.warn('Ad SDK present but failed to load banner:', e.message || e);
    }
  } else {
    console.warn('⚠️ AdBanner: native module not found — NativeModules available:',
      Object.keys(NativeModules).filter(k => k.toLowerCase().includes('ad') || k.toLowerCase().includes('google')));
  }

  // SDK not installed or failed — show placeholder (only visible in dev)
  if (__DEV__) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.text}>📣 Reklam Alanı (Test Banner)</Text>
      </View>
    );
  }

  // In production without native module, render nothing — the ad area
  // simply won't take space rather than showing a confusing placeholder.
  return null;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  fallback: {
    width: '100%',
    minHeight: 60,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  fallbackOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  text: {
    color: '#92400E',
    fontWeight: '600',
  },
  failedText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
});
