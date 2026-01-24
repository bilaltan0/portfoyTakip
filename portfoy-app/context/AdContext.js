import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const ADS_OVERRIDE_KEY = '@enable_ads_override';

const AdContext = createContext({});

export const AdProvider = ({ children }) => {
  const buildDefault = !!Constants.expoConfig?.extra?.enableAds;
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
