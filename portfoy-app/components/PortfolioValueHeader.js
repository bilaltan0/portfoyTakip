/**
 * PortfolioValueHeader.js - Portföy Değer Başlığı
 * 
 * Toplam portföy değeri + period bazlı kar/zarar göstergesi
 * Binance/Coinbase tarzı profesyonel tasarım
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { EyeIcon, EyeOffIcon } from './icons';

const PERIODS = [
  { id: '1D', label: '1G', days: 1 },
  { id: '1W', label: '1H', days: 7 },
  { id: '1M', label: '1A', days: 30 },
  { id: '1Y', label: '1Y', days: 365 },
  { id: 'ALL', label: 'Tümü', days: null }
];

const PortfolioValueHeader = ({ 
  totalValue, 
  currencySymbol = '₺',
  profitLoss = 0,
  profitLossPercentage = 0,
  selectedPeriod = '1D',
  onPeriodChange,
  isBalanceHidden = false,
  onToggleBalance
}) => {
  const handlePeriodSelect = (periodId) => {
    if (onPeriodChange) {
      onPeriodChange(periodId);
    }
  };
  
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
              <Text style={styles.periodLabel}>
                {PERIODS.find(p => p.id === selectedPeriod)?.label || '1G'}
              </Text>
            </View>
            <Text style={[styles.profitPercentage, { color: profitColor }]}>
              {profitIcon} {isBalanceHidden ? '**.**' : Math.abs(profitLossPercentage).toFixed(2)}%
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

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive
            ]}
            onPress={() => handlePeriodSelect(period.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.id && styles.periodTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  periodTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
