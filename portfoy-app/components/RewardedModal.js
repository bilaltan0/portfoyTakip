import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ToastAndroid, Alert, NativeModules } from 'react-native';
import { COLORS } from '../constants/theme';

export default function RewardedModal({ visible, onClose, onUnlocked }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // Event: rewarded shown
      console.log('event: rewarded_shown');
    }
  }, [visible]);

  const handleWatch = async () => {
    setLoading(true);
    console.log('🎬 Rewarded: attempt to show real rewarded ad (or fallback)');

    // Only require the SDK if the native module is present. The package
    // accesses TurboModuleRegistry at module import time which will throw in
    // Expo Go; avoid requiring unless we can actually use the native module.
    const nativePresent = !!(
      NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds
    );

    if (nativePresent) {
      try {
        // Try to use react-native-google-mobile-ads if it's installed.
        // eslint-disable-next-line global-require
        const { RewardedAd, RewardedAdEventType, TestIds } = require('react-native-google-mobile-ads');

        const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ';
        const rewarded = RewardedAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: true });

        const unsub = rewarded.onAdEvent((type, error, reward) => {
          if (type === RewardedAdEventType.LOADED) {
            console.log('Rewarded loaded');
          }
          if (type === RewardedAdEventType.EARNED_REWARD) {
            console.log('event: rewarded_completed', reward);
            const successMessage = 'Teşekkürler — şimdi yeni portföyünü oluşturabilirsin.';
            if (Platform.OS === 'android' && ToastAndroid) {
              ToastAndroid.show(successMessage, ToastAndroid.SHORT);
            } else {
              Alert.alert('', successMessage);
            }
            onUnlocked && onUnlocked();
          }
          if (type === RewardedAdEventType.CLOSED) {
            // cleanup
            setLoading(false);
            onClose && onClose();
            rewarded.load();
          }
          if (type === RewardedAdEventType.ERROR) {
            console.warn('Rewarded ad error', error);
          }
        });

        // load and show when ready
        rewarded.load();
        // show when loaded - listener will handle the rest
        setTimeout(() => {
          try {
            rewarded.show();
          } catch (e) {
            console.warn('Could not show rewarded (fallback to simulate)', e);
          }
        }, 600);

        // unsubscribe after modal closes
        const cleanup = () => unsub && unsub();
        // best-effort cleanup when component unmounts
        return cleanup;
      } catch (err) {
        // SDK not available or failed — fallback to simulated 3s flow
        console.debug('Rewarded SDK not available, falling back to simulated ad', err);
        console.log('🎬 Rewarded: simulated ad started');
      }
    }

      setTimeout(() => {
        try {
          console.log('✅ Rewarded: simulated ad completed');
          console.log('event: rewarded_completed');

          const successMessage = 'Teşekkürler — şimdi yeni portföyünü oluşturabilirsin.';
          if (Platform.OS === 'android' && ToastAndroid) {
            ToastAndroid.show(successMessage, ToastAndroid.SHORT);
          } else {
            Alert.alert('', successMessage);
          }

          onUnlocked && onUnlocked();
        } catch (e) {
          console.error('❌ Rewarded: onUnlocked handler failed', e);
        } finally {
          setLoading(false);
          onClose && onClose();
        }
      }, 3000);
    
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Destekle Yeni Portföyünü Aç</Text>
          <Text style={styles.subtitle}>Bize destek olmak ister misin? Kısa bir reklam izleyerek ekstra portföyünü açabilirsin.</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={loading}>
              <Text style={styles.btnText}>Belki sonra</Text>
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
});
