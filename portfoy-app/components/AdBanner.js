import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAd } from '../context/AdContext';

/**
 * Placeholder AdBanner component.
 * When real ad SDK is integrated, replace this with the SDK banner.
 */
export default function AdBanner({ style }) {
  const { enabled } = useAd();
  if (!enabled) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>📣 Reklam Alanı (Test Banner)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
