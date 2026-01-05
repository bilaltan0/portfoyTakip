/**
 * TransactionItem.js - İşlem Geçmişi Item Component'i
 * 
 * İşlem geçmişi listesinde kullanılan item bileşeni
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { getShortAssetName } from '../utils/assetUtils';

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const isBuy = transaction.type === 'buy';
  const date = new Date(transaction.date);
  
  // Sadece gün göster
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - txDate) / (1000 * 60 * 60 * 24));
  
  let dateDisplay;
  if (diffDays === 0) {
    dateDisplay = 'Bugün';
  } else if (diffDays === 1) {
    dateDisplay = 'Dün';
  } else {
    dateDisplay = date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    });
  }

  const shortAssetName = getShortAssetName(transaction.assetName);
  const unitPrice = transaction.unitPrice ? transaction.unitPrice.toFixed(2) : '0.00';

  // Currency symbol
  const currencySymbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };
  const currencySymbol = currencySymbols[transaction.currency] || transaction.currency;

  // Sembol varsa göster, yoksa kısa isim
  const displayName = transaction.symbol || shortAssetName;

  // Miktar formatı - daha okunur
  const formattedQuantity = (transaction.quantity || 0).toLocaleString('tr-TR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  });

  return (
    <View style={styles.item}>
      {/* Sol: İkon */}
      <View style={[
        styles.iconContainer,
        isBuy ? styles.iconBuy : styles.iconSell
      ]}>
        {isBuy ? (
          <TrendingUp size={18} color={COLORS.success} />
        ) : (
          <TrendingDown size={18} color={COLORS.danger} />
        )}
      </View>

      {/* Orta: Varlık Bilgisi */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.assetSymbol} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[
            styles.price,
            isBuy ? styles.pricePositive : styles.priceNegative
          ]}>
            {isBuy ? '+' : ''}{currencySymbol}{unitPrice}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.transactionType}>
            {isBuy ? '📈 Alış' : '📉 Satış'}
          </Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.quantity}>
            {formattedQuantity} adet
          </Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.time}>
            {dateDisplay}
          </Text>
        </View>
      </View>

      {/* Sağ: Aksiyon Butonları */}
      <View style={styles.actions}>
        {/* Düzenle Butonu */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit && onEdit(transaction)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Edit2 size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Sil Butonu */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onDelete && onDelete(transaction)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBuy: {
    backgroundColor: '#D1FAE5',
  },
  iconSell: {
    backgroundColor: '#FEE2E2',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkBlue,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  pricePositive: {
    color: COLORS.success || '#10B981',
  },
  priceNegative: {
    color: COLORS.danger || '#EF4444',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionType: {
    fontSize: 11,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  separator: {
    fontSize: 11,
    color: COLORS.lightGray || '#D1D5DB',
  },
  quantity: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    color: COLORS.mediumGray,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
