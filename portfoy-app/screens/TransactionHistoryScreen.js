/**
 * TransactionHistoryScreen.js - İşlem Geçmişi Ekranı
 * 
 * Aktif portföyün tüm alım-satım işlemlerini listeler
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';
import TransactionItem from '../components/TransactionItem';

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
            {transactions.map((transaction, index) => (
              <TransactionItem key={index} transaction={transaction} />
            ))}
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
