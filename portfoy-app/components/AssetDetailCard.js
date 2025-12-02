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
  onPress,
  currentPrice = null, // Anlık fiyat (opsiyonel)
  profitLoss = null // Kar/zarar verisi (opsiyonel)
}) {
  // Kar/zarar hesaplama
  const hasProfitLoss = currentPrice && currentPrice > 0;
  let plAmount = 0;
  let plPercentage = 0;
  let plColor = COLORS.mediumGray;
  let plIcon = '';

  if (hasProfitLoss) {
    plAmount = (currentPrice - asset.avgPrice) * asset.quantity;
    plPercentage = ((currentPrice - asset.avgPrice) / asset.avgPrice) * 100;
    
    if (plAmount > 0) {
      plColor = COLORS.success;
      plIcon = '▲';
    } else if (plAmount < 0) {
      plColor = COLORS.danger;
      plIcon = '▼';
    }
  }

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
          {currencySymbol}{asset.avgPrice.toLocaleString('tr-TR', { 
            maximumFractionDigits: 2,
            minimumFractionDigits: 2 
          })}
        </Text>
      </View>

      {/* Anlık Fiyat (varsa) */}
      {hasProfitLoss && (
        <View style={styles.row}>
          <Text style={styles.label}>Anlık Fiyat</Text>
          <Text style={[styles.value, { color: COLORS.primary }]}>
            {currencySymbol}{currentPrice.toLocaleString('tr-TR', { 
              maximumFractionDigits: 2,
              minimumFractionDigits: 2 
            })}
          </Text>
        </View>
      )}
      
      <View style={styles.row}>
        <Text style={styles.label}>Toplam</Text>
        <Text style={[styles.value, styles.totalValue]}>
          {currencySymbol}{asset.value.toLocaleString('tr-TR', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}
        </Text>
      </View>

      {/* Kar/Zarar (varsa) */}
      {hasProfitLoss && Math.abs(plAmount) > 0 && (
        <View style={[styles.profitLossBox, { backgroundColor: `${plColor}15` }]}>
          <Text style={[styles.profitLossText, { color: plColor }]}>
            {plIcon} {plAmount >= 0 ? '+' : ''}{currencySymbol}{Math.abs(plAmount).toLocaleString('tr-TR', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            })} ({plPercentage >= 0 ? '+' : ''}{plPercentage.toFixed(2)}%)
          </Text>
        </View>
      )}
      
      <View style={styles.percentage}>
        <Text style={styles.percentageText}>
          {asset.exactPercentage ? asset.exactPercentage.toFixed(2) : asset.percentage}%
        </Text>
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
  profitLossBox: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  profitLossText: {
    fontSize: 11,
    fontWeight: '700',
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
