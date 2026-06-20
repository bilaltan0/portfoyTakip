/**
 * PortfolioValueHeader.js - Portföy Değer Başlığı
 * 
 * Toplam portföy değeri + dönem bazlı kar/zarar göstergesi
 * Binance/Coinbase tarzı profesyonel tasarım
 * 
 * Dönem seçici: 1G | 1H | 1A | 1Y | TOP
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { EyeIcon, EyeOffIcon } from './icons';
import { PERIOD_LABELS } from '../utils/periodCalculations';

// Sıralı dönem listesi (UI'da bu sırada gösterilecek)
const PERIODS = ['1D', '1W', '1M', '1Y', 'ALL'];

const PortfolioValueHeader = ({ 
  totalValue, 
  currencySymbol = '₺',
  profitLoss = 0,
  profitLossPercentage = 0,
  selectedPeriod = 'ALL',
  onPeriodChange,
  isBalanceHidden = false,
  onToggleBalance,
  grandTotalValue = null
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
          {grandTotalValue !== null && grandTotalValue !== undefined && (
            <Text style={styles.grandTotalLabel}>
              Tüm Portföyler Toplamı: {isBalanceHidden ? '₺ *****' : `${currencySymbol}${Math.round(grandTotalValue).toLocaleString('tr-TR')}`}
            </Text>
          )}
        </View>

        {/* Sağ: Kar/Zarar Badge */}
        <View style={styles.profitSection}>
          <View style={[styles.profitBadge, { backgroundColor: `${profitColor}15` }]}>
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

      {/* Dönem Seçici Tab Bar */}
      <View style={styles.periodContainer}>
        {PERIODS.map((period) => {
          const isSelected = period === selectedPeriod;
          const label = PERIOD_LABELS[period] || period;
          
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                isSelected && styles.periodTabSelected,
              ]}
              onPress={() => onPeriodChange && onPeriodChange(period)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.periodTabText,
                isSelected && styles.periodTabTextSelected,
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  grandTotalLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
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
  profitPercentage: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  profitAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Dönem Seçici Stiller
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.mediumGray}15`,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTabSelected: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.mediumGray,
    letterSpacing: 0.3,
  },
  periodTabTextSelected: {
    color: COLORS.text,
    fontWeight: '700',
  },
  eyeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PortfolioValueHeader;
