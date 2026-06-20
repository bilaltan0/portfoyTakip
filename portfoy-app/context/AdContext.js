import React, { createContext, useContext, useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const AdContext = createContext({});

export const AdProvider = ({ children }) => {
  // Only respect the static build-time value (expo.extra.enableAds).
  // Legacy AsyncStorage override is ignored — it was only useful for
  // development/testing and should not affect production builds anymore.
  const expoVal = Constants.expoConfig?.extra?.enableAds;
  console.log('AdContext init, expoVal=', expoVal, 'Constants.expoConfig.extra=', Constants.expoConfig?.extra);
  // Force ads to be enabled in __DEV__ so we can test without a native rebuild
  const buildDefault = __DEV__ ? true : (typeof expoVal === 'boolean' ? expoVal : false);
  const [enabled, setEnabled] = useState(buildDefault);
  const [initialized, setInitialized] = useState(false);

  // Initialize the Mobile Ads SDK when ads are enabled (either by build
  // default or at runtime via setEnableAds). We avoid persisting any runtime
  // toggles to storage.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setEnabled(buildDefault);

        if (buildDefault) {
          try {
            // eslint-disable-next-line global-require
            const MobileAds = require('react-native-google-mobile-ads').default;
            if (MobileAds) {
              MobileAds().initialize();
              const useTest = !!Constants.expoConfig?.extra?.enableTestAds;
              if (useTest && Platform.OS === 'android') {
                try {
                  MobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] });
                } catch (e) {
                  // ignore if not supported
                }
              }
              console.log('✅ Mobile Ads SDK initialized');
            }
          } catch (e) {
            console.debug('⚠️ Mobile Ads SDK not initialized:', e.message || e);
          }
        }
      } catch (e) {
        if (mounted) setEnabled(buildDefault);
      } finally {
        if (mounted) setInitialized(true);
      }
    })();

    return () => { mounted = false; };
  }, [buildDefault]);

  // Initialize SDK if ads are toggled at runtime to 'true'.
  useEffect(() => {
    if (!enabled) return;
    try {
      // eslint-disable-next-line global-require
      const MobileAds = require('react-native-google-mobile-ads').default;
      if (MobileAds) {
        MobileAds().initialize();
      }
    } catch (e) {
      // ignore
    }
  }, [enabled]);

  // Runtime toggles no longer persist to AsyncStorage; they only affect the
  // current session. This keeps the build-time config authoritative.
  const setEnableAds = (value) => {
    setEnabled(value);
    console.log('ℹ️ Ads runtime toggled:', value ? 'enabled' : 'disabled');
  };

  return (
    <AdContext.Provider value={{ enabled, setEnableAds, initialized, buildDefault }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => useContext(AdContext);

export default AdContext;
