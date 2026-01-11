/**
 * CurrencyButton.js - Para Birimi Seçim Butonu Component'i
 * 
 * Para birimi seçimi için kullanılan buton bileşeni
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function CurrencyButton({ 
  currency, 
  isActive = false, 
  onPress 
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive && styles.buttonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          isActive && styles.buttonTextActive,
        ]}
      >
        {currency}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  buttonTextActive: {
    color: COLORS.white,
  },
});
