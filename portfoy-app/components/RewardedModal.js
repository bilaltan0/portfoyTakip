import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ToastAndroid, Alert } from 'react-native';
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
    // Simulate ad watching flow (placeholder). Replace with real SDK later.
    setLoading(true);
    console.log('🎬 Rewarded: simulated ad started');

    setTimeout(() => {
      // After simulated ad completion, log event and notify caller.
      try {
        console.log('✅ Rewarded: simulated ad completed');
        console.log('event: rewarded_completed');

        // Show success toast (Android) or alert (iOS)
        const successMessage = 'Teşekkürler — şimdi yeni portföyünü oluşturabilirsin.';
        if (Platform.OS === 'android' && ToastAndroid) {
          ToastAndroid.show(successMessage, ToastAndroid.SHORT);
        } else {
          Alert.alert('', successMessage);
        }

        // Notify caller to proceed with the single create action.
        onUnlocked && onUnlocked();
      } catch (e) {
        console.error('❌ Rewarded: onUnlocked handler failed', e);
      } finally {
        setLoading(false);
        onClose && onClose();
      }
    }, 3000); // 3s simulate
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
