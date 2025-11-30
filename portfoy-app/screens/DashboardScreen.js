/**
 * DashboardScreen.js - Ana Ekran (Dashboard)
 * 
 * AMAÇ:
 * Kullanıcının portföy özetini gösteren ana sayfa.
 * Toplam değer, kar/zarar, varlık dağılımı ve hızlı bakış kartlarını içerir.
 * 
 * BİLEŞENLER:
 * 
 * 1. HEADER
 *    - Sol: Ayarlar ikonu (TouchableOpacity + Alert)
 *    - Orta: "PortföyMate" başlığı
 *    - Sağ: Bildirimler ikonu (TouchableOpacity + Alert)
 * 
 * 2. PORTFÖY ÖZETİ
 *    - Toplam Değer: ₺350.750,23 (altın renk, büyük font)
 *    - Kar/Zarar: +₺25.300,50 +7.8% (yeşil renk)
 *    - Dönem: "Son 30 Gün"
 * 
 * 3. VARLIK DAĞILIMI (Doughnut Chart)
 *    - SVG ile çizilmiş halka grafik (180x180px)
 *    - 5 segment: Altın, Kripto, Borsa, Döviz, Nakit
 *    - Merkez: Toplam değer göstergesi
 *    - Sağ: Legend (renk + isim + yüzde)
 * 
 * 4. HIZLI BAKIŞ KARTLARI
 *    - Yatay ScrollView
 *    - 4 kart: Altın, Kripto, Borsa, Döviz
 *    - Her kart: Renkli ikon + isim + değer + 24s değişim
 * 
 * VERİ:
 * - Şu an sabit veriler (MOCK_ASSETS)
 * - Gelecekte API'den gelecek
 * 
 * STYLES:
 * - Tüm stil tanımları dosyanın sonunda StyleSheet.create() içinde
 * - Renkler constants/theme.js'den import edilir
 * 
 * NOT:
 * Ayarlar ve Bildirimler geçici olarak Alert ile çalışıyor.
 * İleride ayrı ekranlar olacak (Stack Navigator ile).
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLORS, MOCK_ASSETS } from '../constants/theme';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => Alert.alert('Ayarlar', 'Ayarlar ekranı yakında eklenecek')}
        >
          {/* Settings Icon */}
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={2} fill={COLORS.darkBlue} />
            <Circle cx={12} cy={12} r={8} stroke={COLORS.darkBlue} strokeWidth={2} fill="none" />
            <Circle cx={12} cy={5} r={1.5} fill={COLORS.darkBlue} />
            <Circle cx={12} cy={19} r={1.5} fill={COLORS.darkBlue} />
            <Circle cx={5} cy={12} r={1.5} fill={COLORS.darkBlue} />
            <Circle cx={19} cy={12} r={1.5} fill={COLORS.darkBlue} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PortföyMate</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => Alert.alert('Bildirimler', 'Bildirimler ekranı yakında eklenecek')}
        >
          {/* Notifications Icon (Bell) */}
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={20} r={1.5} fill={COLORS.darkBlue} />
            <Path d="M8 8 C8 5.8 9.8 4 12 4 C14.2 4 16 5.8 16 8 L16 14 C16 15.1 16.9 16 18 16 L6 16 C7.1 16 8 15.1 8 14 Z" fill={COLORS.darkBlue} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Portfolio Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>₺350.750,23</Text>
          <Text style={styles.summaryChange}>+₺25.300,50   +7.8% Son 30 Gün</Text>
        </View>

        {/* Varlık Dağılımı Başlık */}
        <Text style={styles.sectionTitle}>Varlık Dağılımı</Text>
        
        {/* Doughnut Chart (SVG) */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBox}>
            <Svg width={180} height={180} viewBox="0 0 100 100">
              {/* Altın */}
              <Circle r={40} cx={50} cy={50} stroke={COLORS.gold} strokeWidth={16} fill="none" strokeDasharray="100 157" strokeDashoffset="0" />
              {/* Kripto */}
              <Circle r={40} cx={50} cy={50} stroke={COLORS.darkBlue} strokeWidth={16} fill="none" strokeDasharray="47 210" strokeDashoffset="100" />
              {/* Borsa */}
              <Circle r={40} cx={50} cy={50} stroke={COLORS.blue1} strokeWidth={16} fill="none" strokeDasharray="32 225" strokeDashoffset="147" />
              {/* Döviz */}
              <Circle r={40} cx={50} cy={50} stroke={COLORS.blue2} strokeWidth={16} fill="none" strokeDasharray="20 237" strokeDashoffset="179" />
              {/* Nakit/Diğer */}
              <Circle r={40} cx={50} cy={50} stroke={COLORS.blue3} strokeWidth={16} fill="none" strokeDasharray="10 247" strokeDashoffset="199" />
            </Svg>
            <View style={styles.chartCenter}>
              <Text style={{ fontSize: 14, color: COLORS.darkGray }}>Değer</Text>
              <Text style={{ fontSize: 20, color: COLORS.darkBlue, fontWeight: 'bold' }}>₺350.750</Text>
            </View>
          </View>
          
          <View style={styles.chartLegendRight}>
            <View style={styles.legendItemRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.legendText}>Altın</Text>
              <Text style={styles.legendPercent}>45%</Text>
            </View>
            <View style={styles.legendItemRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.darkBlue }]} />
              <Text style={styles.legendText}>Kripto</Text>
              <Text style={styles.legendPercent}>30%</Text>
            </View>
            <View style={styles.legendItemRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.blue1 }]} />
              <Text style={styles.legendText}>Borsa</Text>
              <Text style={styles.legendPercent}>15%</Text>
            </View>
            <View style={styles.legendItemRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.blue2 }]} />
              <Text style={styles.legendText}>Döviz</Text>
              <Text style={styles.legendPercent}>5%</Text>
            </View>
            <View style={styles.legendItemRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.blue3 }]} />
              <Text style={styles.legendText}>Nakit/Diğer</Text>
              <Text style={styles.legendPercent}>5%</Text>
            </View>
          </View>
        </View>

        {/* Hızlı Bakış Başlık */}
        <Text style={styles.sectionTitle}>Hızlı Bakış</Text>
        
        {/* Quick Look Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {MOCK_ASSETS.map((asset, idx) => (
            <View key={asset.name} style={styles.card}> 
              <View style={[styles.cardIcon, { backgroundColor: asset.color }]}>
                {asset.name === 'Altın' && (
                  <Svg width={24} height={24} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={8} fill="#fff" /></Svg>
                )}
                {asset.name === 'Kripto' && (
                  <Svg width={24} height={24} viewBox="0 0 24 24"><Rect x={6} y={6} width={12} height={12} rx={2} fill="#fff" /></Svg>
                )}
                {asset.name === 'Borsa' && (
                  <Svg width={24} height={24} viewBox="0 0 24 24"><Path d="M6 18 L10 12 L14 15 L18 8" stroke="#fff" strokeWidth={2} fill="none" /></Svg>
                )}
                {asset.name === 'Döviz' && (
                  <Svg width={24} height={24} viewBox="0 0 24 24"><Rect x={6} y={8} width={12} height={8} rx={2} fill="#fff" /></Svg>
                )}
              </View>
              <Text style={styles.cardTitle}>{asset.name}</Text>
              <Text style={styles.cardValue}>{asset.value}</Text>
              <Text style={[styles.cardChange, { color: asset.changeColor }]}>{asset.change} (24s)</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 90,
  },
  summaryBox: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  summaryChange: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.green,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  chartBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  chartLegendRight: {
    flex: 1,
    marginLeft: 16,
  },
  legendItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.darkGray,
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  cardsRow: {
    marginVertical: 8,
  },
  card: {
    minWidth: 140,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
    marginBottom: 2,
  },
  cardChange: {
    fontSize: 12,
    fontWeight: '600',
  },
});
