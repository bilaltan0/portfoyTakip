/**
 * MoreScreen.js - Daha Fazla Menüsü
 * 
 * AMAÇ:
 * Uygulamanın ikincil özelliklerine erişim sağlayan menü ekranı.
 * 
 * PLANLANAN ÖZELLİKLER:
 * - Profil Bilgileri (kullanıcı adı, email, avatar)
 * - Ayarlar (tema, dil, bildirim tercihleri)
 * - Bildirimler (geçmiş bildirimler listesi)
 * - Yardım & Destek (SSS, iletişim)
 * - Hakkında (uygulama versiyonu, gizlilik politikası)
 * - Çıkış Yap
 * 
 * DURUM:
 * Şu an sadece placeholder (yer tutucu) ekran.
 * Gerçek menü yapısı sonraki aşamalarda eklenecek.
 * 
 * NOT:
 * Bu ekran Tab Navigator'da "Daha Fazla" sekmesi ile erişiliyor.
 * Liste yapısı için FlatList veya ScrollView kullanılacak.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daha Fazla Ekranı</Text>
      <Text style={styles.subtitle}>
        Buraya profil, ayarlar, bildirimler vb. eklenecek
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
