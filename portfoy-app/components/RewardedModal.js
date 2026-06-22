import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ToastAndroid, Alert, NativeModules } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAd } from '../context/AdContext';
import { getAdUnitId, AD_UNITS } from '../constants/adUnits';

export default function RewardedModal({ visible, onClose, onUnlocked }) {
  const [loading, setLoading] = useState(false);
  const adTimeoutRef = React.useRef(null);
  const unsubRef = React.useRef(null);

  useEffect(() => {
    if (visible) {
      console.log('event: rewarded_shown');
    }

    // Cleanup on unmount or when modal closes
    return () => {
      if (adTimeoutRef.current) {
        clearTimeout(adTimeoutRef.current);
        adTimeoutRef.current = null;
      }
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (_) {}
        unsubRef.current = null;
      }
    };
  }, [visible]);

  const showSuccessMessage = () => {
    const successMessage = 'Teşekkürler — şimdi yeni portföyünü oluşturabilirsin.';
    if (Platform.OS === 'android' && ToastAndroid) {
      ToastAndroid.show(successMessage, ToastAndroid.SHORT);
    } else {
      Alert.alert('', successMessage);
    }
  };

  const handleSimulatedAd = () => {
    console.log('🎬 Rewarded: simulated ad started');
    setTimeout(() => {
      try {
        console.log('✅ Rewarded: simulated ad completed');
        showSuccessMessage();
        onUnlocked && onUnlocked();
      } catch (e) {
        console.error('❌ Rewarded: onUnlocked handler failed', e);
      } finally {
        setLoading(false);
        onClose && onClose();
      }
    }, 3000);
  };

  const handleWatch = async () => {
    setLoading(true);
    console.log('🎬 Rewarded: attempt to show real rewarded ad (or fallback)');

    // Check if rewarded ad unit ID is configured
    const rewardedUnitRaw = AD_UNITS.REWARDED;
    if (!rewardedUnitRaw && !__DEV__) {
      console.warn('⚠️ Rewarded: no ad unit ID configured, using simulated flow');
      handleSimulatedAd();
      return;
    }

    // Only require the SDK if the native module is present.
    const nativePresent = !!(
      NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
    );

    if (!nativePresent) {
      console.log('⚠️ Rewarded: native module not present, using simulated flow');
      handleSimulatedAd();
      return;
    }

    try {
      // eslint-disable-next-line global-require
      const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = require('react-native-google-mobile-ads');
      const adUnitId = getAdUnitId('REWARDED', TestIds);

      if (!adUnitId) {
        console.warn('⚠️ Rewarded: empty ad unit ID after resolution, using simulated flow');
        handleSimulatedAd();
        return;
      }

      console.log('📣 Rewarded: using adUnitId:', adUnitId);
      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      let adLoaded = false;
      let rewardEarned = false;

      // Cleanup previous subscription
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (_) {}
      }

      const unsub = rewarded.onAdEvent((type, error, reward) => {
        console.log('📣 Rewarded event:', type, error ? `error: ${JSON.stringify(error)}` : '', reward ? `reward: ${JSON.stringify(reward)}` : '');

        if (type === RewardedAdEventType.LOADED) {
          console.log('✅ Rewarded ad loaded, showing...');
          adLoaded = true;
          // Now show the ad since it's loaded
          try {
            rewarded.show();
          } catch (showErr) {
            console.warn('❌ Could not show rewarded ad:', showErr);
            setLoading(false);
            onClose && onClose();
            // Fallback: grant unlock anyway
            onUnlocked && onUnlocked();
            showSuccessMessage();
          }
        }

        if (type === RewardedAdEventType.EARNED_REWARD) {
          console.log('🎉 Rewarded: reward earned', reward);
          rewardEarned = true;
          showSuccessMessage();
          onUnlocked && onUnlocked();
          // Clear timeout since we got our reward
          if (adTimeoutRef.current) {
            clearTimeout(adTimeoutRef.current);
            adTimeoutRef.current = null;
          }
        }

        // AdEventType.CLOSED fires when the user closes the ad
        if (type === 'closed' || type === AdEventType?.CLOSED) {
          console.log('📣 Rewarded ad closed');
          setLoading(false);
          onClose && onClose();
          if (adTimeoutRef.current) {
            clearTimeout(adTimeoutRef.current);
            adTimeoutRef.current = null;
          }
          // Cleanup
          if (unsubRef.current) {
            try { unsubRef.current(); } catch (_) {}
            unsubRef.current = null;
          }
        }

        if (type === 'error' || type === AdEventType?.ERROR) {
          console.warn('❌ Rewarded ad error:', error);
          if (adTimeoutRef.current) {
            clearTimeout(adTimeoutRef.current);
            adTimeoutRef.current = null;
          }
          // Fallback: close and grant unlock
          setLoading(false);
          onClose && onClose();
          onUnlocked && onUnlocked();
          showSuccessMessage();
          if (unsubRef.current) {
            try { unsubRef.current(); } catch (_) {}
            unsubRef.current = null;
          }
        }
      });

      unsubRef.current = unsub;

      // Load the ad first — the LOADED event handler will call show()
      console.log('📣 Rewarded: loading ad...');
      rewarded.load();

      // Safety timeout: if nothing happens within 15s, fallback
      if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
      adTimeoutRef.current = setTimeout(() => {
        if (!adLoaded) {
          console.warn('⏰ Rewarded ad timeout; falling back to simulated flow');
          setLoading(false);
          onClose && onClose();
          onUnlocked && onUnlocked();
          showSuccessMessage();
        }
        adTimeoutRef.current = null;
      }, 15000);

    } catch (err) {
      console.warn('❌ Rewarded SDK error, falling back to simulated ad:', err.message || err);
      handleSimulatedAd();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Destekle Yeni Portföyünü Aç</Text>
          <Text style={styles.subtitle}>Bize destek olmak ister misin? Kısa bir reklam izleyerek ekstra portföyünü açabilirsin.</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={loading}>
              <Text style={styles.btnCancelText}>Belki sonra</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnWatch} onPress={handleWatch} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Destek Ol</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  btnWatch: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnCancelText: {
    color: '#374151',
    fontWeight: '700',
  },
});
