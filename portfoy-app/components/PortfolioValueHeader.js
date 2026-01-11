/**
 * PortfolioValueHeader.js - Portföy Değer Başlığı
 * 
 * Toplam portföy değeri + toplam kar/zarar göstergesi
 * Binance/Coinbase tarzı profesyonel tasarım
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { EyeIcon, EyeOffIcon } from './icons';

const PortfolioValueHeader = ({ 
  totalValue, 
  currencySymbol = '₺',
  profitLoss = 0,
  profitLossPercentage = 0,
  isBalanceHidden = false,
  onToggleBalance
}) => {
  const isProfit = profitLoss >= 0;
  const profitColor = isProfit ? COLORS.success : COLORS.danger;
  const profitIcon = isProfit ? '▲' : '▼';

  return (
    <View style={styles.container}>
      {/* Değer + Kar/Zarar Satırı */}
      <View style={styles.valueRow}>
        {/* Sol: Toplam Değer */}
        <View style={styles.valueSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.totalValue}>
              {isBalanceHidden ? '₺ *****' : `${currencySymbol}${Math.round(totalValue).toLocaleString('tr-TR')}`}
            </Text>
            {/* Göz İkonu */}
            <TouchableOpacity 
              onPress={onToggleBalance}
              style={styles.eyeButton}
              activeOpacity={0.6}
            >
              {isBalanceHidden ? (
                <EyeOffIcon size={20} color={COLORS.textSecondary} />
              ) : (
                <EyeIcon size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.valueLabel}>Toplam Portföy Değeri</Text>
        </View>

        {/* Sağ: Kar/Zarar Badge */}
        <View style={styles.profitSection}>
          <View style={[styles.profitBadge, { backgroundColor: `${profitColor}15` }]}>
            <View style={styles.periodIndicator}>
              <Text style={styles.periodLabel}>TOPLAM</Text>
            </View>
            <Text style={[styles.profitPercentage, { color: profitColor }]}>
              {profitIcon} {Math.abs(profitLossPercentage).toFixed(2)}%
            </Text>
            <Text style={[styles.profitAmount, { color: profitColor }]}>
              {isBalanceHidden ? '₺ *****' : `${isProfit ? '+' : ''}${currencySymbol}${Math.abs(profitLoss).toLocaleString('tr-TR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Mini Trend Indicator */}
      <View style={styles.trendContainer}>
        <View style={[styles.trendLine, { backgroundColor: profitColor }]}>
          {/* Basit trend göstergesi - gelecekte mini chart eklenebilir */}
          <View style={[
            styles.trendDot, 
            { 
              backgroundColor: profitColor,
              right: isProfit ? 0 : undefined,
              left: !isProfit ? 0 : undefined
            }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  valueSection: {
    flex: 1,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  valueLabel: {
    fontSize: 13,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  profitSection: {
    marginLeft: 12,
  },
  profitBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'flex-end',
    minWidth: 110,
  },
  periodIndicator: {
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mediumGray,
    letterSpacing: 0.5,
  },
  profitPercentage: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  profitAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendContainer: {
    height: 4,
    backgroundColor: `${COLORS.mediumGray}20`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trendLine: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  trendDot: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  eyeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PortfolioValueHeader;
