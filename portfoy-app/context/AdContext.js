import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ADS_OVERRIDE_KEY = '@enable_ads_override';

const AdContext = createContext({});

export const AdProvider = ({ children }) => {
  // Respect explicit expoConfig.extra.enableAds when provided. If it's not
  // provided (undefined) and we're running as a standalone build (production
  // AAB / IPA), default to enabling ads so test/release builds show banners
  // unless intentionally disabled via env. This prevents accidental
  // 'no-ads' behavior in production artifacts.
  const expoVal = Constants.expoConfig?.extra?.enableAds;
  const buildDefault = typeof expoVal === 'boolean' ? expoVal : (Constants.appOwnership === 'standalone');
  const [enabled, setEnabled] = useState(buildDefault);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const val = await AsyncStorage.getItem(ADS_OVERRIDE_KEY);
        if (mounted && val !== null) {
          setEnabled(val === 'true');
        } else if (mounted) {
          setEnabled(buildDefault);
        }

        // Initialize Mobile Ads SDK when ads are enabled and native module
        // appears to be present. This ensures release APK/AAB has the SDK
        // initialized (otherwise some ad types may not render in release).
        if (mounted && (val === null ? buildDefault : (val === 'true'))) {
          try {
            // eslint-disable-next-line global-require
            const MobileAds = require('react-native-google-mobile-ads').default;
            if (MobileAds) {
              MobileAds().initialize();
              // Optionally set test ads if configured via expo extra
              const enableTestAds = !!Constants.expoConfig?.extra?.enableTestAds;
              if (enableTestAds && Platform.OS === 'android') {
                // request device test ids (EMULATOR is a useful default)
                try {
                  MobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] });
                } catch (e) {
                  // ignore if not supported
                }
              }
              console.log('✅ Mobile Ads SDK initialized');
            }
          } catch (e) {
            // SDK not installed or native missing - ignore
            console.debug('⚠️ Mobile Ads SDK not initialized:', e.message || e);
          }
        }

        // No-op: we no longer persist any rewarded-unlock flag here.
      } catch (e) {
        if (mounted) setEnabled(buildDefault);
      } finally {
        if (mounted) setInitialized(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setEnableAds = async (value) => {
    setEnabled(value);
    try {
      await AsyncStorage.setItem(ADS_OVERRIDE_KEY, value ? 'true' : 'false');
      // No-op: do not persist or clear any rewarded-unlock flag here.
    } catch (e) {
      // ignore write failures
    }
  };

  return (
    <AdContext.Provider value={{ enabled, setEnableAds, initialized, buildDefault }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => useContext(AdContext);

export default AdContext;
