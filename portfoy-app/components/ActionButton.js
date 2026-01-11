/**
 * ActionButton.js - Aksiyon Butonu Component'i
 * 
 * Alış/Satış gibi primary action butonları için kullanılan bileşen
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ActionButton({ 
  label, 
  onPress,
  variant = 'primary', // 'primary', 'success', 'danger'
  disabled = false,
  style
}) {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.mediumGray;
    switch (variant) {
      case 'success':
        return COLORS.profit;
      case 'danger':
        return COLORS.loss;
      default:
        return COLORS.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 16,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
