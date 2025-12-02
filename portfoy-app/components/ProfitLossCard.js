/**
 * ProfitLossCard.js - Kar/Zarar Kartı
 * 
 * Portföyün kar/zarar durumunu görsel olarak gösterir.
 * - Toplam kar/zarar tutarı ve yüzdesi
 * - Yeşil (kar) / Kırmızı (zarar) renk kodlaması
 * - Yatırım tutarı ve güncel değer
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const ProfitLossCard = ({ 
  totalInvestment, 
  currentValue, 
  profitLoss, 
  profitLossPercentage,
  currencySymbol = '₺'
}) => {
  const isProfit = profitLoss >= 0;
  const profitColor = isProfit ? COLORS.success : COLORS.danger;
  const profitIcon = isProfit ? '▲' : '▼';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Kar/Zarar Durumu</Text>
      </View>

      {/* Ana Kar/Zarar Göstergesi */}
      <View style={[styles.profitLossSection, { backgroundColor: `${profitColor}15` }]}>
        <View style={styles.profitLossMain}>
          <Text style={[styles.profitLossAmount, { color: profitColor }]}>
            {isProfit ? '+' : ''}{currencySymbol}{Math.abs(profitLoss).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Text>
          <View style={[styles.percentageBadge, { backgroundColor: profitColor }]}>
            <Text style={styles.percentageText}>
              {profitIcon} {Math.abs(profitLossPercentage).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Detay Satırları */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📊 Toplam Yatırım</Text>
          <Text style={styles.detailValue}>
            {currencySymbol}{totalInvestment.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💎 Güncel Değer</Text>
          <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '700' }]}>
            {currencySymbol}{currentValue.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  profitLossSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  profitLossMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitLossAmount: {
    fontSize: 32,
    fontWeight: '800',
    flex: 1,
  },
  percentageBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 12,
  },
  percentageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 4,
  },
});

export default ProfitLossCard;
