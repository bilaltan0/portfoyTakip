/**
 * TransactionHistoryScreen.js - İşlem Geçmişi Ekranı
 * 
 * Aktif portföyün tüm alım-satım işlemlerini listeler
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';
import TransactionItem from '../components/TransactionItem';

export default function TransactionHistoryScreen({ navigation }) {
  const { activePortfolio, deleteTransaction, updateTransaction } = usePortfolio();
  const [isDeleting, setIsDeleting] = useState(false);

  // İşlem silme
  const handleDelete = (transaction) => {
    const unitPriceDisplay = transaction.unitPrice ? transaction.unitPrice.toFixed(2) : '0.00';
    const quantityDisplay = transaction.quantity || 0;
    
    Alert.alert(
      '⚠️ İşlem Sil',
      `Bu işlemi silmek istediğinizden emin misiniz?\n\n${transaction.type === 'buy' ? 'Alış' : 'Satış'} - ${transaction.assetName}\n${quantityDisplay} adet × ${transaction.currency} ${unitPriceDisplay}`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const success = await deleteTransaction(transaction.id);
            setIsDeleting(false);
            
            if (success) {
              Alert.alert('✅ Başarılı', 'İşlem silindi');
            } else {
              Alert.alert('❌ Hata', 'İşlem silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  // İşlem düzenleme - TransactionScreen'e direkt yönlendir
  const handleEdit = (transaction) => {
    // Ana navigator'a dön, sonra Transaction tab'ına git
    navigation.navigate('Main', { 
      screen: 'İşlem Yap',
      params: { editingTransaction: transaction }
    });
  };

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
              <TransactionItem 
                key={transaction.id || index} 
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
