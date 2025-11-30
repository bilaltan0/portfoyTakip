/**
 * AssetDetailCard.js - Varlık Detay Kartı Component'i
 * 
 * Kategori içindeki varlık detaylarını gösteren kart
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { formatCurrency } from '../utils/currencyUtils';

export default function AssetDetailCard({ 
  asset,
  currencySymbol = '₺',
  onPress 
}) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: asset.color }]} />
        <Text style={styles.name}>{asset.name}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>{asset.quantityLabel}</Text>
        <Text style={styles.value}>
          {asset.quantity.toLocaleString('tr-TR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 4 
          })}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Ort. Alış</Text>
        <Text style={styles.value}>
          {formatCurrency(asset.avgPrice, 'TRY', { 
            maximumFractionDigits: 2,
            minimumFractionDigits: 2 
          })}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Toplam</Text>
        <Text style={[styles.value, styles.totalValue]}>
          {formatCurrency(asset.value, 'TRY')}
        </Text>
      </View>
      
      <View style={styles.percentage}>
        <Text style={styles.percentageText}>{asset.percentage}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  totalValue: {
    fontWeight: 'bold',
    color: COLORS.darkBlue,
  },
  percentage: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
});
