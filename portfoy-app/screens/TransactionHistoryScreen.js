/**
 * TransactionHistoryScreen.js - İşlem Geçmişi Ekranı
 * 
 * Aktif portföyün tüm alım-satım işlemlerini listeler
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';

export default function TransactionHistoryScreen({ navigation }) {
  const { activePortfolio } = usePortfolio();

  if (!activePortfolio) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.darkBlue} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>İşlem Geçmişi</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Lütfen bir portföy seçin</Text>
        </View>
      </SafeAreaView>
    );
  }

  const transactions = activePortfolio.transactions; // Zaten en yeni üstte geliyor

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Geçmişi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Portfolio Info */}
      <View style={styles.portfolioInfo}>
        <Text style={styles.portfolioName}>{activePortfolio.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz işlem bulunmuyor</Text>
            <Text style={styles.emptySubtext}>
              İşlem eklemek için "İşlem Yap" sekmesini kullanın
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {transactions.map((transaction, index) => {
              // transaction.type 'buy' veya 'sell' olarak küçük harfle geliyor
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

              // Asset ismini kısalt - parantez içindeki kısmı çıkar
              const shortAssetName = transaction.assetName.includes('(') 
                ? transaction.assetName.split('(')[0].trim()
                : transaction.assetName;

              return (
                <View key={index} style={styles.transactionItem}>
                  {/* Sol: İkon ve Bilgi */}
                  <View style={styles.transactionLeft}>
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
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>
                        {isBuy ? 'Alış' : 'Satış'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {dateStr} • {timeStr}
                      </Text>
                    </View>
                  </View>

                  {/* Sağ: Miktar */}
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      isBuy ? styles.amountBuy : styles.amountSell
                    ]}>
                      {isBuy ? '+' : '-'}{transaction.quantity} {shortAssetName}
                    </Text>
                    <Text style={styles.transactionPrice}>
                      {transaction.unitPrice} {transaction.currency}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.darkBlue,
  },
  portfolioInfo: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  portfolioName: {
    ...FONTS.h4,
    color: COLORS.darkBlue,
  },
  scroll: {
    padding: 16,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    backgroundColor: '#E8F5E9',
  },
  iconSell: {
    backgroundColor: '#FFEBEE',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    ...FONTS.h4,
    color: COLORS.dark,
    marginBottom: 4,
  },
  transactionDate: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountBuy: {
    color: '#10B981', // Yeşil
  },
  amountSell: {
    color: '#E74C3C', // Kırmızı
  },
  transactionPrice: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.gray,
    marginBottom: 8,
  },
  emptySubtext: {
    ...FONTS.body3,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
});
