/**
 * QuickViewCard.js - Hızlı Bakış Kartı Component'i
 * 
 * Kategori özeti için kullanılan kart bileşeni
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { formatCurrency, formatPercentage } from '../utils/currencyUtils';

export default function QuickViewCard({ 
  icon, 
  name, 
  value, 
  change = 0, 
  color,
  currencySymbol = '₺',
  onPress 
}) {
  const isPositive = change >= 0;
  
  return (
    <TouchableOpacity 
      style={[styles.card, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      
      <Text style={styles.name}>{name}</Text>
      
      <Text style={styles.value}>
        {currencySymbol}{value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </Text>
      
      <View style={styles.changeContainer}>
        {isPositive ? (
          <TrendingUp size={14} color={COLORS.profit} />
        ) : (
          <TrendingDown size={14} color={COLORS.loss} />
        )}
        <Text style={[
          styles.change, 
          { color: isPositive ? COLORS.profit : COLORS.loss }
        ]}>
          {change}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
});
