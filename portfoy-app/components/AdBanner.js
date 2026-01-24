import React from 'react';
import { View, Text, StyleSheet, NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAd } from '../context/AdContext';
import { useAd } from '../context/AdContext';

/**
 * AdBanner - uses react-native-google-mobile-ads when available,
 * otherwise falls back to a harmless placeholder used during development.
 */
export default function AdBanner({ style }) {
  const { enabled } = useAd();
  if (!enabled) return null;

    // If the native module isn't present (e.g. Expo Go) avoid requiring the
    // package since it attempts to access TurboModuleRegistry at import time
    // which will throw. In that case show the development placeholder instead.
    const nativePresent = !!(
      NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
    );

    const { enableTestAds } = useAd();

    if (nativePresent) {
      try {
        // eslint-disable-next-line global-require
        const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

        const useTestAds = __DEV__ || !!enableTestAds || !!Constants.expoConfig?.extra?.enableTestAds;
        const unitId = useTestAds ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB';

        return (
          <View style={[styles.container, style]}>
            <BannerAd
              unitId={unitId}
              size={BannerAdSize.FULL_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              onAdLoaded={() => console.log('Banner loaded')}
              onAdFailedToLoad={(err) => console.warn('Banner failed to load', err)}
            />
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
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  fallback: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    color: '#92400E',
    fontWeight: '600',
  },
});
