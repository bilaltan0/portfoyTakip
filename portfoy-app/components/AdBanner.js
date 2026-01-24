import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAd } from '../context/AdContext';

/**
 * AdBanner - uses react-native-google-mobile-ads when available,
 * otherwise falls back to a harmless placeholder used during development.
 */
export default function AdBanner({ style }) {
  const { enabled } = useAd();
  if (!enabled) return null;

  // Try to dynamically require the native AdMob SDK. If it's not installed
  // (e.g. before npm install / native build), fall back to the placeholder.
  try {
    // eslint-disable-next-line global-require
    const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
    const unitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB';

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
    // SDK not installed / running in Expo Go — show placeholder
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.text}>📣 Reklam Alanı (Test Banner)</Text>
      </View>
    );
  }
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
