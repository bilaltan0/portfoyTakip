/**
 * PortfolioSummary.js - Portföy Özet Component'i
 * 
 * Toplam değer ve kar/zarar bilgilerini gösteren kart
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { formatCurrency, formatPercentage } from '../utils/currencyUtils';

export default function PortfolioSummary({ 
  totalValue, 
  profitLoss = 0, 
  profitLossPercentage = 0,
  period = "Son 30 Gün",
  currencySymbol = '₺'
}) {
  const isProfit = profitLoss >= 0;
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Toplam Portföy Değeri</Text>
      
      <Text style={styles.totalValue}>
        {formatCurrency(totalValue, 'TRY', { 
          maximumFractionDigits: 2,
          minimumFractionDigits: 2 
        })}
      </Text>
      
      <View style={styles.profitLossContainer}>
        <Text style={[
          styles.profitLoss, 
          { color: isProfit ? COLORS.profit : COLORS.loss }
        ]}>
          {isProfit ? '+' : ''}{formatCurrency(profitLoss, 'TRY', { 
            maximumFractionDigits: 2,
            minimumFractionDigits: 2 
          })}
        </Text>
        
        <Text style={[
          styles.profitLossPercentage,
          { color: isProfit ? COLORS.profit : COLORS.loss }
        ]}>
          {formatPercentage(profitLossPercentage)}
        </Text>
      </View>
      
      <Text style={styles.period}>{period}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 8,
  },
  profitLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profitLoss: {
    fontSize: 18,
    fontWeight: '600',
  },
  profitLossPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  period: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
