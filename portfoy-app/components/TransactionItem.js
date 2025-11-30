/**
 * TransactionItem.js - İşlem Geçmişi Item Component'i
 * 
 * İşlem geçmişi listesinde kullanılan item bileşeni
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { getShortAssetName } from '../utils/assetUtils';

export default function TransactionItem({ transaction }) {
  const isBuy = transaction.type === 'buy';
  const date = new Date(transaction.date);
  const dateStr = date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const shortAssetName = getShortAssetName(transaction.assetName);
  const unitPrice = transaction.unitPrice.toFixed(2);

  // Currency symbol
  const currencySymbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };
  const currencySymbol = currencySymbols[transaction.currency] || transaction.currency;

  return (
    <View style={styles.item}>
      {/* Sol: İkon ve Bilgi */}
      <View style={styles.left}>
        <View style={[
          styles.iconContainer,
          isBuy ? styles.iconBuy : styles.iconSell
        ]}>
          {isBuy ? (
            <TrendingUp size={20} color={COLORS.success} />
          ) : (
            <TrendingDown size={20} color={COLORS.danger} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.type}>
            {isBuy ? 'Alış' : 'Satış'}
          </Text>
          <Text style={styles.date}>
            {dateStr} • {timeStr}
          </Text>
        </View>
      </View>

      {/* Orta: Varlık ve Kategori */}
      <View style={styles.center}>
        <Text style={styles.assetName}>{shortAssetName}</Text>
        <Text style={styles.category}>{transaction.mainCategory}</Text>
      </View>

      {/* Sağ: Miktar ve Fiyat */}
      <View style={styles.right}>
        <Text style={styles.quantity}>
          {transaction.quantity.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })} adet
        </Text>
        <Text style={[
          styles.price,
          isBuy ? styles.pricePositive : styles.priceNegative
        ]}>
          {isBuy ? '+' : '-'}{currencySymbol}{unitPrice}
        </Text>
        {transaction.note && (
          <Text style={styles.note} numberOfLines={1}>
            💬 {transaction.note}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBuy: {
    backgroundColor: '#D1FAE5',
  },
  iconSell: {
    backgroundColor: '#FEE2E2',
  },
  info: {
    justifyContent: 'center',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: COLORS.mediumGray,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBlue,
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: COLORS.mediumGray,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pricePositive: {
    color: COLORS.success || '#10B981',
  },
  priceNegative: {
    color: COLORS.danger || '#EF4444',
  },
  note: {
    fontSize: 11,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    maxWidth: 100,
  },
});
