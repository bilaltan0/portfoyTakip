/**
 * AssetChip.js - Varlık Seçim Chip Component'i
 * 
 * Varlık ismi seçimi için kullanılan chip bileşeni
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function AssetChip({ 
  label, 
  isActive = false, 
  onPress 
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isActive && styles.chipActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          isActive && styles.chipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
