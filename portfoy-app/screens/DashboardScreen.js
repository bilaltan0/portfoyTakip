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

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLORS, MOCK_ASSETS, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants/theme';
import { SettingsIcon, NotificationIcon, GoldIcon, BitcoinIcon, StockIcon, CurrencyIcon, ChevronDownIcon } from '../components/icons';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioSelector from '../components/PortfolioSelector';

// Modüler component'ler
import QuickViewCard from '../components/QuickViewCard';
import AssetDetailCard from '../components/AssetDetailCard';
import DoughnutChart from '../components/DoughnutChart';
import ChartLegend from '../components/ChartLegend';
import ProfitLossCard from '../components/ProfitLossCard';

// Hooks
import { useAssetPrices } from '../hooks/useAssetPrices';

// Utility fonksiyonları
import { getQuantityLabel } from '../utils/assetUtils';
import { getCategoryColor, generateColorForAsset } from '../utils/colorUtils';
import { convertCurrency as convertCurrencyUtil, formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';

export default function DashboardScreen({ navigation }) {
  // Context'ten verileri çek
  const { transactions, totalValue, loading, clearAllData, displayCurrency, setDisplayCurrency } = usePortfolio();
  
  // Para birimi seçici modal state
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // Kategori drill-down state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Debug: Verileri temizle
  const handleClearData = () => {
    Alert.alert(
      '⚠️ Verileri Temizle',
      'Tüm işlemler silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('✅', 'Veriler temizlendi! Yeni işlem ekleyebilirsiniz.');
          }
        }
      ]
    );
  };

  // Para birimi dönüştürme fonksiyonu
  const convertCurrency = (amountInTRY) => {
    const rate = EXCHANGE_RATES[displayCurrency] || 1;
    return amountInTRY / rate;
  };

  // Para birimi sembolü
  const currencySymbol = CURRENCY_SYMBOLS[displayCurrency] || '₺';

  // Toplam portföy değerini hesapla - overall'ı KULLAN (zaten hesaplanmış)
  const totalPortfolioValueInTRY = totalValue.overall || 0;
  const totalPortfolioValue = convertCurrency(totalPortfolioValueInTRY);

  // KAR/ZARAR HESAPLAMA SİSTEMİ
  // 1. Tüm varlıkları ve API mapping bilgilerini topla
  const [assetsForPricing, setAssetsForPricing] = useState([]);
  const [profitLossData, setProfitLossData] = useState({
    totalInvestment: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0
  });

  // Varlıkları hazırla (useAssetPrices için)
  useEffect(() => {
    const assetMap = {};
    
    transactions.forEach(tx => {
      const key = `${tx.mainCategory}_${tx.assetName}`;
      if (!assetMap[key]) {
        assetMap[key] = {
          name: tx.assetName,
          category: tx.mainCategory,
          quantity: 0,
          totalCost: 0,
          apiMapping: tx.apiMapping
        };
      }
      
      const multiplier = tx.type === 'buy' ? 1 : -1;
      assetMap[key].quantity += tx.quantity * multiplier;
      
      // Toplam maliyet hesapla (TRY cinsine çevirerek)
      const txCurrency = tx.currency || 'TRY';
      const exchangeRate = EXCHANGE_RATES[txCurrency] || 1;
      const costInTRY = tx.quantity * tx.unitPrice * exchangeRate;
      assetMap[key].totalCost += costInTRY * multiplier;
    });
    
    // Sadece pozitif miktar olanları al ve apiMapping olanları filtrele
    const assets = Object.values(assetMap)
      .filter(asset => asset.quantity > 0 && asset.apiMapping);
    
    setAssetsForPricing(assets);
  }, [transactions]);

  // Anlık fiyatları çek
  const { prices, loading: pricesLoading, error: pricesError, refresh: refreshPrices } = useAssetPrices(assetsForPricing);

  // Kar/zarar hesapla
  useEffect(() => {
    if (Object.keys(prices).length === 0 || assetsForPricing.length === 0) {
      // Eğer fiyat yoksa, sadece yatırım tutarını göster
      const totalInvestmentInTRY = assetsForPricing.reduce((sum, asset) => sum + asset.totalCost, 0);
      setProfitLossData({
        totalInvestment: convertCurrency(totalInvestmentInTRY),
        currentValue: convertCurrency(totalInvestmentInTRY),
        profitLoss: 0,
        profitLossPercentage: 0
      });
      return;
    }

    let totalInvestmentInTRY = 0;
    let currentValueInTRY = 0;

    assetsForPricing.forEach(asset => {
      // Toplam yatırım (maliyet)
      totalInvestmentInTRY += asset.totalCost;

      // Güncel değer hesapla
      const priceData = prices[asset.name];
      if (priceData && priceData.price > 0) {
        const priceCurrency = priceData.currency || 'TRY';
        const priceExchangeRate = EXCHANGE_RATES[priceCurrency] || 1;
        const currentPriceInTRY = priceData.price * priceExchangeRate;
        currentValueInTRY += asset.quantity * currentPriceInTRY;
      } else {
        // Fiyat yoksa maliyet fiyatını kullan
        currentValueInTRY += asset.totalCost;
      }
    });

    const profitLossInTRY = currentValueInTRY - totalInvestmentInTRY;
    const profitLossPerc = totalInvestmentInTRY > 0 
      ? (profitLossInTRY / totalInvestmentInTRY) * 100 
      : 0;

    setProfitLossData({
      totalInvestment: convertCurrency(totalInvestmentInTRY),
      currentValue: convertCurrency(currentValueInTRY),
      profitLoss: convertCurrency(profitLossInTRY),
      profitLossPercentage: profitLossPerc
    });
  }, [prices, assetsForPricing, displayCurrency]);

  // Varlık dağılımı verilerini Context'ten hesapla - GERÇEK yüzde ile
  const rawDistribution = [
    { 
      name: 'Altın', 
      value: convertCurrency(totalValue['Altın'] || 0),
      color: getCategoryColor('Altın')
    },
    { 
      name: 'Kripto', 
      value: convertCurrency(totalValue['Kripto'] || 0),
      color: getCategoryColor('Kripto')
    },
    { 
      name: 'Borsa', 
      value: convertCurrency(totalValue['Borsa'] || 0),
      color: getCategoryColor('Borsa')
    },
    { 
      name: 'Döviz', 
      value: convertCurrency(totalValue['Döviz'] || 0),
      color: getCategoryColor('Döviz')
    },
  ].filter(item => item.value > 0);

  // Yüzdeleri hesapla - ondalıklı hassas gösterim
  const portfolioDistribution = rawDistribution.map((item, index, arr) => {
    const exactPercentage = (item.value / totalPortfolioValue) * 100;
    
    return {
      ...item,
      percentage: Math.round(exactPercentage), // Yuvarlanmış hali (eski uyumluluk için)
      exactPercentage: exactPercentage // Hassas ondalıklı değer
    };
  });

  // Kategori detay dağılımını hesapla (drill-down için)
  const getCategoryDetail = (categoryName) => {
    if (!categoryName) return [];
    
    // Bu kategoriye ait tüm varlıkları topla
    const categoryAssets = {};
    transactions.forEach(tx => {
      if (tx.mainCategory === categoryName) {
        const assetKey = tx.assetName;
        if (!categoryAssets[assetKey]) {
          categoryAssets[assetKey] = {
            totalQuantity: 0,
            transactions: [],
            apiMapping: tx.apiMapping // API mapping bilgisini sakla
          };
        }
        
        // Alış/satış işlemlerini hesaba kat - sadece miktar
        const multiplier = tx.type === 'buy' ? 1 : -1;
        categoryAssets[assetKey].totalQuantity += tx.quantity * multiplier;
        categoryAssets[assetKey].transactions.push(tx);
      }
    });
    
    // Array'e çevir ve pozitif değerleri filtrele
    const assetArray = Object.entries(categoryAssets)
      .filter(([_, data]) => data.totalQuantity > 0)
      .map(([name, data]) => {
        // Ortalama alış fiyatı hesapla (sadece buy işlemlerinden)
        const buyTransactions = data.transactions.filter(tx => tx.type === 'buy');
        
        // Her işlemi önce TRY'ye çevir, sonra ortalama al
        let totalBuyValueInTRY = 0;
        let totalBuyQuantity = 0;
        
        buyTransactions.forEach(tx => {
          const txCurrency = tx.currency || 'TRY';
          const exchangeRate = EXCHANGE_RATES[txCurrency] || 1;
          const priceInTRY = tx.unitPrice * exchangeRate; // İşlemin para birimini TRY'ye çevir
          
          totalBuyValueInTRY += tx.quantity * priceInTRY;
          totalBuyQuantity += tx.quantity;
        });
        
        const avgPriceInTRY = totalBuyQuantity > 0 ? totalBuyValueInTRY / totalBuyQuantity : 0;
        
        // TOPLAM DEĞER: Ortalama alış fiyatı × mevcut miktar (TRY cinsinden)
        const totalValueInTRY = avgPriceInTRY * data.totalQuantity;
        
        return {
          name: name.includes('(') ? name.split('(')[0].trim() : name,
          fullName: name,
          value: convertCurrency(totalValueInTRY), // Gerçek toplam değer
          quantity: data.totalQuantity,
          avgPrice: convertCurrency(avgPriceInTRY), // TRY'den displayCurrency'ye çevir
          color: generateColorForAsset(name),
          quantityLabel: getQuantityLabel(name, categoryName),
          apiMapping: data.apiMapping // API mapping'i aktar
        };
      });
    
    // Toplam değere göre büyükten küçüğe sırala
    assetArray.sort((a, b) => b.value - a.value);
    
    // Toplam değer
    const categoryTotal = assetArray.reduce((sum, item) => sum + item.value, 0);
    
    // Yüzdeleri hesapla - ondalıklı hassas gösterim
    return assetArray.map((item) => {
      const exactPercentage = (item.value / categoryTotal) * 100;
      
      return {
        ...item,
        percentage: Math.round(exactPercentage), // Yuvarlanmış hali (eski uyumluluk için)
        exactPercentage: exactPercentage // Hassas ondalıklı değer
      };
    });
  };
  
  // Gösterilecek dağılım: kategori seçiliyse detay, değilse genel
  const displayDistribution = selectedCategory 
    ? getCategoryDetail(selectedCategory)
    : portfolioDistribution;
  
  // Başlık: kategori seçiliyse "{Kategori} Dağılımı", değilse "Varlık Dağılımı"
  const distributionTitle = selectedCategory 
    ? `${selectedCategory} Dağılımı`
    : 'Varlık Dağılımı';
  
  // Merkez değeri: kategori seçiliyse o kategorinin toplamı, değilse genel toplam
  const centerValue = selectedCategory
    ? displayDistribution.reduce((sum, item) => sum + item.value, 0)
    : totalPortfolioValue;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar />
      {/* Header */}
      <View style={styles.header}>
        {/* Uygulama İsmi (Sol) */}
        <Text style={styles.headerTitle}>PortföyMate</Text>
        
        {/* Portföy Seçici (Orta) */}
        <PortfolioSelector />
        
        {/* Para Birimi Seçici (Sağ) */}
        <TouchableOpacity 
          style={styles.currencyButton}
          onPress={() => setShowCurrencyModal(true)}
        >
          <Text style={styles.currencyText}>{displayCurrency}</Text>
          <ChevronDownIcon size={16} color={COLORS.darkBlue} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={pricesLoading}
            onRefresh={refreshPrices}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            title="Fiyatlar güncelleniyor..."
            titleColor={COLORS.mediumGray}
          />
        }
      >
        {/* Portfolio Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>
            {currencySymbol}{totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.summaryLabel}>Toplam Portföy Değeri</Text>
          {pricesLoading && (
            <View style={styles.loadingBadge}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Fiyatlar güncelleniyor...</Text>
            </View>
          )}
        </View>

        {/* Kar/Zarar Kartı */}
        {assetsForPricing.length > 0 && (
          <ProfitLossCard
            totalInvestment={profitLossData.totalInvestment}
            currentValue={profitLossData.currentValue}
            profitLoss={profitLossData.profitLoss}
            profitLossPercentage={profitLossData.profitLossPercentage}
            currencySymbol={currencySymbol}
          />
        )}

        {/* Varlık Dağılımı Bölümü */}
        <View style={styles.assetDistributionSection}>
          {/* Başlık + Geri Butonu */}
          <View style={styles.sectionHeader}>
            {selectedCategory ? (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.backButtonText}>← Geri</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}
            
            <Text style={styles.sectionTitleCentered}>{distributionTitle}</Text>
            
            <View style={{ width: 60 }} />
          </View>
          
          {/* Doughnut Chart Component */}
          <View style={styles.chartContainer}>
            <DoughnutChart
              data={displayDistribution}
              centerValue={centerValue}
              centerLabel="Toplam"
              currencySymbol={currencySymbol}
            />
            
            {/* Legend - Chart'ın altında */}
            <View style={styles.chartLegendBottom}>
              {displayDistribution.length > 0 ? (
                <ChartLegend data={displayDistribution} />
              ) : (
                <Text style={{ color: COLORS.mediumGray, fontSize: 14 }}>
                  {selectedCategory 
                    ? `Bu kategoride henüz varlık yok`
                    : `Varlık eklemek için "İşlem Yap" sekmesini kullanın`
                  }
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Hızlı Bakış / Varlık Detayları Başlık */}
        <Text style={styles.sectionTitle}>
          {selectedCategory ? `${selectedCategory} Varlıkları` : 'Hızlı Bakış'}
        </Text>
        
        {/* Quick Look Cards / Asset Detail Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {selectedCategory ? (
            // Kategori seçiliyse: Varlık detay kartları
            displayDistribution.length > 0 ? (
              displayDistribution.map((asset) => {
                // Bu varlığın anlık fiyatını bul
                const priceData = prices[asset.name];
                const currentPrice = priceData && priceData.price > 0 
                  ? priceData.price * (EXCHANGE_RATES[priceData.currency] || 1) / (EXCHANGE_RATES[displayCurrency] || 1)
                  : null;

                return (
                  <AssetDetailCard
                    key={asset.name}
                    asset={asset}
                    currencySymbol={currencySymbol}
                    currentPrice={currentPrice}
                    onPress={() => {
                      // Tab Navigator üzerinden İşlem Yap sekmesine parametrelerle geçiş
                      navigation.navigate('İşlem Yap', {
                        preselectedAsset: {
                          mainCategory: selectedCategory,
                          assetName: asset.fullName || asset.name,
                          type: 'buy'
                        }
                      });
                    }}
                  />
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Bu kategoride varlık yok</Text>
                <Text style={styles.emptySubtext}>İşlem eklemek için "İşlem Yap" sekmesini kullanın</Text>
              </View>
            )
          ) : (
            // Kategori seçili değilse: Hızlı bakış kartları
            portfolioDistribution.length > 0 ? (
              portfolioDistribution.map((asset) => {
                // Icon belirleme
                let icon;
                if (asset.name === 'Altın') icon = <GoldIcon size={32} color={asset.color} />;
                else if (asset.name === 'Kripto') icon = <BitcoinIcon size={32} color={asset.color} />;
                else if (asset.name === 'Borsa') icon = <StockIcon size={32} color={asset.color} />;
                else if (asset.name === 'Döviz') icon = <CurrencyIcon size={32} color={asset.color} />;

                return (
                  <QuickViewCard
                    key={asset.name}
                    icon={icon}
                    name={asset.name}
                    value={asset.value}
                    change={asset.exactPercentage ? asset.exactPercentage.toFixed(2) : asset.percentage}
                    color={asset.color}
                    currencySymbol={currencySymbol}
                    onPress={() => setSelectedCategory(asset.name)}
                  />
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Henüz işlem yok</Text>
                <Text style={styles.emptySubtext}>İşlem Yap sekmesinden başlayın</Text>
              </View>
            )
          )}
        </ScrollView>
      </ScrollView>

      {/* Para Birimi Seçici Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Para Birimi Seçin</Text>
            {Object.keys(EXCHANGE_RATES).map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyOption,
                  displayCurrency === currency && styles.currencyOptionActive
                ]}
                onPress={() => {
                  setDisplayCurrency(currency);
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={[
                  styles.currencyOptionText,
                  displayCurrency === currency && styles.currencyOptionTextActive
                ]}>
                  {CURRENCY_SYMBOLS[currency]} {currency}
                </Text>
                {displayCurrency === currency && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkBlue,
    flex: 0,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBlue,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
    marginBottom: 16,
    textAlign: 'center',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  currencyOptionActive: {
    backgroundColor: '#E8F0FE',
    borderWidth: 2,
    borderColor: COLORS.darkBlue,
  },
  currencyOptionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  currencyOptionTextActive: {
    color: COLORS.darkBlue,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.darkBlue,
    fontWeight: 'bold',
  },
  scroll: {
    paddingBottom: 90,
  },
  summaryBox: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 4,
  },
  summaryTransactions: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  assetDistributionSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleCentered: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chartBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  chartLegendBottom: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  legendItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '500',
    marginRight: 6,
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
  },
  cardsRow: {
    marginVertical: 8,
  },
  emptyCard: {
    minWidth: 200,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.mediumGray,
  },
});
