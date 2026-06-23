import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';

const AdContext = createContext({});

export const AdProvider = ({ children }) => {
  // Only respect the static build-time value (expo.extra.enableAds).
  const expoVal = Constants.expoConfig?.extra?.enableAds;

  // In production, default to true unless explicitly set to false.
  // In __DEV__, always default to true for testing convenience.
  const buildDefault = __DEV__ ? true : (expoVal !== false);

  const [enabled, setEnabled] = useState(buildDefault);
  const [initialized, setInitialized] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  console.log(
    '🔧 AdContext init — expoVal:', expoVal,
    '| buildDefault:', buildDefault,
    '| __DEV__:', __DEV__,
    '| extra:', JSON.stringify(Constants.expoConfig?.extra),
  );

  // Check whether the native ads module is actually available in this
  // binary. For Expo Go or dev-client builds without the native module
  // we should not even attempt to require the JS package.
  const nativeModuleAvailable = !!(
    NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
  );

  // Initialize the Mobile Ads SDK when ads are enabled.
  useEffect(() => {
    let mounted = true;

    const initAds = async () => {
      if (!buildDefault) {
        console.log('⛔ AdContext: ads disabled by build config');
        if (mounted) {
          setEnabled(false);
          setInitialized(true);
        }
        return;
      }

      if (!nativeModuleAvailable) {
        console.warn('⚠️ AdContext: native ads module NOT found in this binary.',
          'Available modules containing "ad" or "google":',
          Object.keys(NativeModules).filter(
            k => k.toLowerCase().includes('ad') || k.toLowerCase().includes('google')
          ),
        );
        if (mounted) {
          setEnabled(true); // keep enabled so AdBanner can show its own fallback
          setInitialized(true);
        }
        return;
      }

      try {
        // eslint-disable-next-line global-require
        const MobileAds = require('react-native-google-mobile-ads').default;

        if (MobileAds) {
          console.log('🚀 AdContext: calling MobileAds().initialize()...');
          await MobileAds().initialize();

          const useTest = !!Constants.expoConfig?.extra?.enableTestAds;
          if (useTest && Platform.OS === 'android') {
            try {
              MobileAds().setRequestConfiguration({
                testDeviceIdentifiers: ['EMULATOR'],
              });
              console.log('📱 AdContext: test device identifiers set');
            } catch (e) {
              // ignore if not supported
            }
          }

          console.log('✅ Mobile Ads SDK initialized successfully');
          if (mounted) {
            setSdkError(null);
          }
        }
      } catch (e) {
        console.error('❌ Mobile Ads SDK initialization failed:', e.message || e);
        if (mounted) {
          setSdkError(e.message || 'SDK init failed');
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    initAds();

    return () => { mounted = false; };
  }, [buildDefault, nativeModuleAvailable]);

  // Re-initialize SDK if ads are toggled on at runtime.
  useEffect(() => {
    if (!enabled || !initialized) return;
    if (!nativeModuleAvailable) return;

    try {
      // eslint-disable-next-line global-require
      const MobileAds = require('react-native-google-mobile-ads').default;
      if (MobileAds) {
        MobileAds().initialize();
        console.log('🔄 AdContext: SDK re-initialized after runtime toggle');
      }
    } catch (e) {
      // ignore
    }
  }, [enabled, initialized, nativeModuleAvailable]);

  // Runtime toggles no longer persist to AsyncStorage; they only affect the
  // current session. This keeps the build-time config authoritative.
  const setEnableAds = useCallback((value) => {
    setEnabled(value);
    console.log('ℹ️ Ads runtime toggled:', value ? 'enabled' : 'disabled');
  }, []);

  return (
    <AdContext.Provider value={{
      enabled,
      setEnableAds,
      initialized,
      buildDefault,
      sdkError,
      nativeModuleAvailable,
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => useContext(AdContext);

export default AdContext;
