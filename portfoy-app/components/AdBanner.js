import React from 'react';
import { View, StyleSheet, NativeModules } from 'react-native';
import { useAd } from '../context/AdContext';
import { getAdUnitId } from '../constants/adUnits';

/**
 * AdBanner - uses react-native-google-mobile-ads when available.
 *
 * Davranış:
 * - Reklam yüklenene kadar GÖRÜNMEZ (sıfır yükseklik, placeholder yok)
 * - Reklam yüklendiğinde yumuşak geçişle görünür olur
 * - Yüklenemezse sessizce gizli kalır (kullanıcı hiçbir şey görmez)
 * - Retry mantığı arka planda çalışır
 */
export default function AdBanner({ style }) {
  const { enabled, initialized } = useAd();
  const [adLoaded, setAdLoaded] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const retryCountRef = React.useRef(0);
  const retryTimerRef = React.useRef(null);

  const MAX_RETRIES = 3;

  // Re-run (remount) the native banner when ads are toggled
  React.useEffect(() => {
    setAdLoaded(false);
    retryCountRef.current = 0;
    setReloadKey(k => k + 1);

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [enabled]);

  // Reklamlar kapalıysa veya SDK henüz hazır değilse → hiçbir şey render etme
  if (!enabled || !initialized) {
    return null;
  }

  const nativePresent = !!(
    NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
  );

  if (!nativePresent) {
    // Native modül yoksa (Expo Go vs.) dev modunda bile gösterme
    return null;
  }

  try {
    // eslint-disable-next-line global-require
    const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

    const unitId = getAdUnitId('BANNER', TestIds);
    if (!unitId) return null;

    // Retry helper — bumps reloadKey after a delay to remount the banner.
    const scheduleRetry = () => {
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = Math.pow(2, retryCountRef.current) * 10000; // 10s, 20s, 40s
        console.log(`🔄 AdBanner retry ${retryCountRef.current + 1}/${MAX_RETRIES} in ${delay / 1000}s`);
        retryTimerRef.current = setTimeout(() => {
          retryCountRef.current += 1;
          setAdLoaded(false);
          setReloadKey(k => k + 1);
        }, delay);
      }
    };

    return (
      <View
        style={[
          styles.container,
          // Reklam yüklenene kadar sıfır yükseklik — görünmez
          !adLoaded && styles.hidden,
          adLoaded && style,
        ]}
        key={`banner-${reloadKey}`}
      >
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => {
            setAdLoaded(true);
            retryCountRef.current = 0;
            console.log('✅ Banner ad loaded');
          }}
          onAdFailedToLoad={(err) => {
            setAdLoaded(false);
            console.warn('❌ Banner failed:', err?.message || JSON.stringify(err));
            scheduleRetry();
          }}
        />
      </View>
    );
  } catch (e) {
    console.warn('Ad SDK error:', e?.message || e);
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});
