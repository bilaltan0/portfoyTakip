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
import { SettingsIcon, NotificationIcon, GoldIcon, BitcoinIcon, StockIcon, CurrencyIcon } from '../components/icons';

export default function DashboardScreen() {
  // Varlık dağılımı verileri (yüzdeler) - Farklı ve canlı renkler
  const portfolioDistribution = [
    { name: 'Altın', percentage: 45, color: '#FFD700' },      // Altın sarısı
    { name: 'Kripto', percentage: 30, color: '#6366F1' },     // İndigo (mor-mavi)
    { name: 'Borsa', percentage: 15, color: '#10B981' },      // Yeşil
    { name: 'Döviz', percentage: 5, color: '#F59E0B' },       // Turuncu
    { name: 'Nakit/Diğer', percentage: 5, color: '#EC4899' }, // Pembe
  ];

  // SVG Circle için hesaplama
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.327
  
  // Her segment için offset hesaplama (doğru formül)
  let cumulativeOffset = 0;
  const segments = portfolioDistribution.map((item) => {
    const segmentLength = (item.percentage / 100) * circumference;
    const currentOffset = cumulativeOffset;
    cumulativeOffset += segmentLength;
    
    return {
      ...item,
      segmentLength,
      offset: currentOffset,
    };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => Alert.alert('Ayarlar', 'Ayarlar ekranı yakında eklenecek')}
        >
          <SettingsIcon size={24} color={COLORS.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PortföyMate</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => Alert.alert('Bildirimler', 'Bildirimler ekranı yakında eklenecek')}
        >
          <NotificationIcon size={24} color={COLORS.darkBlue} showBadge={false} />
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
              {segments.map((segment, index) => (
                <Circle
                  key={segment.name}
                  r={radius}
                  cx={50}
                  cy={50}
                  stroke={segment.color}
                  strokeWidth={20}
                  fill="none"
                  strokeDasharray={`${segment.segmentLength} ${circumference - segment.segmentLength}`}
                  strokeDashoffset={-segment.offset + circumference / 4}
                  strokeLinecap="butt"
                />
              ))}
            </Svg>
            <View style={styles.chartCenter}>
              <Text style={{ fontSize: 14, color: COLORS.darkGray }}>Değer</Text>
              <Text style={{ fontSize: 20, color: COLORS.darkBlue, fontWeight: 'bold' }}>₺350.750</Text>
            </View>
          </View>
          
          <View style={styles.chartLegendRight}>
            {portfolioDistribution.map((item) => (
              <View key={item.name} style={styles.legendItemRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
                <Text style={styles.legendPercent}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hızlı Bakış Başlık */}
        <Text style={styles.sectionTitle}>Hızlı Bakış</Text>
        
        {/* Quick Look Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {MOCK_ASSETS.map((asset, idx) => (
            <View key={asset.name} style={styles.card}> 
              <View style={[styles.cardIcon, { backgroundColor: asset.color }]}>
                {asset.name === 'Altın' && <GoldIcon size={24} color="#fff" />}
                {asset.name === 'Kripto' && <BitcoinIcon size={24} color="#fff" />}
                {asset.name === 'Borsa' && <StockIcon size={24} color="#fff" />}
                {asset.name === 'Döviz' && <CurrencyIcon size={24} color="#fff" />}
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
