import React from 'react';
import { View, Text, StyleSheet, NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAd } from '../context/AdContext';

/**
 * AdBanner - uses react-native-google-mobile-ads when available,
 * otherwise falls back to a harmless placeholder used during development.
 */
export default function AdBanner({ style }) {
  const { enabled } = useAd();
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  // Re-run (remount) the native banner when ads are toggled
  React.useEffect(() => {
    setLoading(true);
    setFailed(false);
    setReloadKey(k => k + 1);
  }, [enabled]);

  if (!enabled) return null;

  // If the native module isn't present (e.g. Expo Go) avoid requiring the
  // package since it attempts to access TurboModuleRegistry at import time
  // which will throw. In that case show the development placeholder instead.
  const nativePresent = !!(
    NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
  );

  if (nativePresent) {
    try {
      // eslint-disable-next-line global-require
      const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

      const useTestAds = __DEV__ || !!Constants.expoConfig?.extra?.enableTestAds;
      const unitId = useTestAds ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB';

      // Use an adaptive anchored banner so the height adjusts to the
      // device width and prevents layout shifts when the ad loads.
      // Track load/failures so we can show a friendly fallback instead of
      // leaving an empty invisible area when the SDK can't deliver an ad.
      return (
        <View style={[styles.container, style]} key={`banner-${reloadKey}`}>
          <BannerAd
            unitId={unitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdLoaded={() => {
              setLoading(false);
              setFailed(false);
              console.log('Banner loaded');
            }}
            onAdFailedToLoad={(err) => {
              setLoading(false);
              setFailed(true);
              console.warn('Banner failed to load', err);
            }}
          />
          {/* If the SDK reports failure, render a visible placeholder so the
              user isn't left with a blank banner area. */}
          {failed && (
            <View style={styles.fallbackOverlay} pointerEvents="none">
              <Text style={styles.text}>📣 Reklam yüklenemedi</Text>
            </View>
          )}
        </View>
      );
    } catch (e) {
      // If anything goes wrong after we determined nativePresent try/catch
      // will handle it and we'll fall back to placeholder.
      console.warn('Ad SDK present but failed to load banner', e);
    }
  }

  // SDK not installed or failed — show placeholder
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.text}>📣 Reklam Alanı (Test Banner)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    overflow: 'hidden',
  },
  fallback: {
    width: '100%',
    minHeight: 50,
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
    backgroundColor: 'rgba(255,255,255,0.6)'
  },
  text: {
    color: '#92400E',
    fontWeight: '600',
  },
});
