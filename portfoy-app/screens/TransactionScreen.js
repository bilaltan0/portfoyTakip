/**
 * TransactionScreen.js - İşlem Yap Ekranı
 * 
 * AMAÇ:
 * Kullanıcının varlık alım/satım işlemlerini yapacağı ekran.
 * 
 * PLANLANAN ÖZELLİKLER:
 * - Varlık seçimi (Altın, Kripto, Hisse, Döviz vb.)
 * - İşlem tipi seçimi (Alım / Satım)
 * - Miktar girişi (adet veya tutar)
 * - Fiyat bilgisi (güncel fiyat gösterimi)
 * - İşlem onaylama
 * - İşlem geçmişi
 * 
 * DURUM:
 * Şu an sadece placeholder (yer tutucu) ekran.
 * Gerçek özellikler sonraki aşamalarda eklenecek.
 * 
 * NOT:
 * Bu ekran Tab Navigator'da "İşlem Yap" sekmesi ile erişiliyor.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function TransactionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>İşlem Yap Ekranı</Text>
      <Text style={styles.subtitle}>
        Buraya varlık alım/satım özellikleri eklenecek
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});
