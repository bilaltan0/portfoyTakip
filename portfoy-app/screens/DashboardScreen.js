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

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLORS, MOCK_ASSETS, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants/theme';
import { SettingsIcon, NotificationIcon, GoldIcon, BitcoinIcon, StockIcon, CurrencyIcon, ChevronDownIcon, EyeIcon, EyeOffIcon } from '../components/icons';
import { usePortfolio } from '../context/PortfolioContext';
import { useSubCategories } from '../context/SubCategoryContext';
import PortfolioSelector from '../components/PortfolioSelector';

// Modüler component'ler
import QuickViewCard from '../components/QuickViewCard';
import AssetDetailCard from '../components/AssetDetailCard';
import DoughnutChart from '../components/DoughnutChart';
import ChartLegend from '../components/ChartLegend';
import ProfitLossCard from '../components/ProfitLossCard';
import PortfolioValueHeader from '../components/PortfolioValueHeader';
import AdBanner from '../components/AdBanner';

// Services
import { clearPriceCache } from '../services/priceService';
import { calculatePeriodProfitLoss } from '../utils/periodCalculations';

// Hooks
import { useAssetPrices } from '../hooks/useAssetPrices';
import { useHistoricalPrices } from '../hooks/useHistoricalPrices';
import useInterstitialAd from '../hooks/useInterstitialAd';

// Services
import { getExchangeRates, convertToTRY, convertFromTRY } from '../services/exchangeRateService';

// Storage
import { loadData, saveData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage.constants';

// Utility fonksiyonları
import { getQuantityLabel } from '../utils/assetUtils';
import { normalizeAssetKey } from '../utils/assetKeys';
import { getCategoryColor, generateColorForAsset } from '../utils/colorUtils';
import { convertCurrency as convertCurrencyUtil, formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';
import { createPreselectedAsset } from '../utils/navigationHelpers';

// Label for the pseudo-uncategorized subcategory (human-friendly)
const UNASSIGNED_ID = '__UNCATEGORIZED__';
const UNASSIGNED_LABEL = 'Diğer';

export default function DashboardScreen({ navigation }) {
  // Context'ten verileri çek
  const { transactions, totalValue, loading, clearAllData, displayCurrency, setDisplayCurrency } = usePortfolio();
  const {
    subCategories,
    assetMapping,
    loading: subCategoriesLoading,
    createSubCategory,
    refreshData: refreshSubCategories,
    getSubCategoriesByCategory,
    getSubCategoryById,
    getSubCategoryForAssetName
  } = useSubCategories();

  // Gizlilik state (tutar gizleme/gösterme)
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Dönem seçimi (kar/zarar hesaplaması için)
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');

  // Döviz kurları state
  const [exchangeRates, setExchangeRates] = useState(EXCHANGE_RATES); // Fallback olarak sabit kurlar

  // Para birimi seçici modal state
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Kategori drill-down state
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Alt kategori seçimi (ana kategori seçildiyse burada alt kategori seçimi olabilir)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  // Ref to horizontal cards ScrollView so we can auto-scroll (fix clipping on first card)
  const cardsScrollRef = useRef(null);
  // Store scroll positions per view (main / category / category+subcategory)
  const cardsScrollPositionsRef = useRef({});
  // Flag to indicate a programmatic scroll in progress (prevent onScroll saving)
  const programmaticScrollRef = useRef(false);
  const scrollSaveTimeoutRef = useRef(null);

  // Interstitial reklam (kategori detay açılışlarında)
  const { showInterstitialIfReady, trackOpen } = useInterstitialAd();

  // Force re-render when screen regains focus (fix: quick view not loading after swipe/back)
  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(
    React.useCallback(() => {
      // increment a tick so components that use it as a key will remount
      setFocusTick(t => t + 1);
      return () => { };
    }, [])
  );

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

  // Para birimi dönüştürme fonksiyonu (dinamik kurlar)
  const convertCurrency = (amountInTRY) => {
    return convertFromTRY(amountInTRY, displayCurrency, exchangeRates);
  };

  // Para birimi sembolü
  const currencySymbol = CURRENCY_SYMBOLS[displayCurrency] || '₺';

  // Gizlilik durumunu yükle (ilk açılışta VE her focus'ta)
  useFocusEffect(
    React.useCallback(() => {
      const loadBalanceVisibility = async () => {
        try {
          const savedState = await loadData(STORAGE_KEYS.BALANCE_HIDDEN, false);
          setIsBalanceHidden(savedState);
          console.log('👁️ Balance visibility loaded on focus:', savedState);
        } catch (error) {
          console.error('❌ Failed to load balance visibility:', error);
        }
      };

      loadBalanceVisibility();
    }, [])
  );

  // Gizlilik durumunu kaydet (değiştiğinde)
  useEffect(() => {
    const saveBalanceVisibility = async () => {
      try {
        await saveData(STORAGE_KEYS.BALANCE_HIDDEN, isBalanceHidden);
        console.log('💾 Balance visibility saved:', isBalanceHidden);
      } catch (error) {
        console.error('❌ Failed to save balance visibility:', error);
      }
    };

    // İlk yüklemede kaydetme (sadece değişikliklerde)
    saveBalanceVisibility();
  }, [isBalanceHidden]);

  // Döviz kurlarını yükle
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const rates = await getExchangeRates();
        console.log('💱 Exchange rates loaded:', rates);
        setExchangeRates(rates);
      } catch (error) {
        console.error('❌ Failed to load exchange rates:', error);
        // EXCHANGE_RATES fallback zaten state'te var
      }
    };

    loadExchangeRates();
  }, []); // Sadece ilk yüklemede

  // Toplam portföy değerini hesapla - ANLIK FİYATLARDAN hesapla (maliyet değil!)
  // Context'teki totalValue maliyet bazlı, biz anlık fiyat kullanacağız
  const [totalPortfolioValueInTRY, setTotalPortfolioValueInTRY] = useState(0);
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
          symbol: tx.symbol || null,
          category: tx.mainCategory,
          mainCategory: tx.mainCategory, // Hem category hem mainCategory (uyumluluk)
          quantity: 0,
          totalCost: 0,
          // ✅ FİYAT ÇEKME İÇİN GEREKLİ BİLGİLER
          apiId: tx.apiId || null,
          provider: tx.provider || null,
          apiCurrency: tx.apiCurrency || null,
        };
      }

      // En güncel bilgileri kullan (transaction'da varsa)
      if (tx.symbol && !assetMap[key].symbol) {
        assetMap[key].symbol = tx.symbol;
      }
      if (tx.apiId && !assetMap[key].apiId) {
        assetMap[key].apiId = tx.apiId;
      }
      if (tx.provider && !assetMap[key].provider) {
        assetMap[key].provider = tx.provider;
      }
      if (tx.apiCurrency && !assetMap[key].apiCurrency) {
        assetMap[key].apiCurrency = tx.apiCurrency;
      }

      const multiplier = tx.type === 'buy' ? 1 : -1;
      assetMap[key].quantity += tx.quantity * multiplier;

      // Toplam maliyet hesapla (TRY cinsine çevirerek - dinamik kurlarla)
      const txCurrency = tx.currency || 'TRY';
      const costInTRY = convertToTRY(tx.quantity * tx.unitPrice, txCurrency, exchangeRates);
      assetMap[key].totalCost += costInTRY * multiplier;
    });

    // Sadece pozitif miktar olanları al (apiMapping kontrolü yok!)
    const assets = Object.values(assetMap)
      .filter(asset => asset.quantity > 0);

    console.log('🔍 AssetsForPricing:', assets.map(a => ({
      name: a.name,
      category: a.category,
      quantity: a.quantity,
      totalCost: a.totalCost.toFixed(2),
      apiId: a.apiId,
      provider: a.provider
    })));

    setAssetsForPricing(assets);
  }, [transactions, exchangeRates]); // exchangeRates değişince yeniden hesapla

  // Anlık fiyatları çek
  const { prices, loading: pricesLoading, error: pricesError, refresh: refreshPricesOnly } = useAssetPrices(assetsForPricing);

  // Tarihsel fiyatları çek (dönem bazlı kar/zarar için)
  const { historicalPrices, loading: historicalLoading } = useHistoricalPrices(assetsForPricing, selectedPeriod);

  // Refresh fonksiyonu: Cache temizle, döviz kurlarını ve fiyatları yenile
  const refreshPrices = async () => {
    try {
      // 0. Önce cache'i temizle (eski 0 değerlerini kaldır)
      console.log('🗑️ Cache temizleniyor...');
      await clearPriceCache();

      // 1. Döviz kurlarını yenile
      const rates = await getExchangeRates();
      setExchangeRates(rates);
      console.log('💱 Exchange rates refreshed:', rates);

      // 2. Fiyatları yenile (cache temiz, API'den çekecek)
      refreshPricesOnly();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      // Sadece fiyatları yenile (kurlar fallback'te kalır)
      refreshPricesOnly();
    }
  };

  // Debug: Prices objesini logla
  useEffect(() => {
    console.log('💰 PRICES OBJESI:', JSON.stringify(prices, null, 2));
  }, [prices]);

  // Kar/zarar VE toplam portföy değerini hesapla (ANLIK FİYATLARA GÖRE + DÖNEM BAZLI)
  useEffect(() => {
    if (Object.keys(prices).length === 0 || assetsForPricing.length === 0) {
      // Eğer fiyat yoksa, sadece yatırım tutarını göster
      const totalInvestmentInTRY = assetsForPricing.reduce((sum, asset) => sum + asset.totalCost, 0);
      setTotalPortfolioValueInTRY(totalInvestmentInTRY); // Toplam değer = maliyet
      setProfitLossData({
        totalInvestment: convertCurrency(totalInvestmentInTRY),
        currentValue: convertCurrency(totalInvestmentInTRY),
        profitLoss: 0,
        profitLossPercentage: 0
      });
      return;
    }

    // 1. Toplam portföy değerini hesapla (her zaman ALL - dönemden bağımsız)
    let currentValueInTRY = 0;
    let totalInvestmentInTRY = 0;

    assetsForPricing.forEach(asset => {
      totalInvestmentInTRY += asset.totalCost;

      const priceData = prices[asset.name];
      if (priceData && priceData.price > 0) {
        const priceCurrency = priceData.currency || 'TRY';
        const currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        currentValueInTRY += asset.quantity * currentPriceInTRY;
      } else {
        currentValueInTRY += asset.totalCost;
      }
    });

    // Toplam portföy değerini güncelle (ANLIK FİYATA GÖRE - dönemden bağımsız)
    setTotalPortfolioValueInTRY(currentValueInTRY);

    // 2. Dönem bazlı kar/zarar hesapla (periodCalculations + tarihsel fiyatlar)
    // ALL dışı dönemlerde tarihsel fiyatlar yüklenene kadar eski değeri koru (yeşil→kırmızı flash önleme)
    if (selectedPeriod !== 'ALL' && historicalLoading) {
      return; // Tarihsel fiyatlar henüz yükleniyor, eski P/L değerini koru
    }

    const periodResult = calculatePeriodProfitLoss(
      transactions,
      prices,
      historicalPrices,
      selectedPeriod,
      exchangeRates
    );

    setProfitLossData({
      totalInvestment: convertCurrency(periodResult.totalCost),
      currentValue: convertCurrency(periodResult.currentValue),
      profitLoss: convertCurrency(periodResult.profitLoss),
      profitLossPercentage: periodResult.profitLossPercentage
    });

    console.log(`📈 KAR/ZARAR [${selectedPeriod}]: ${periodResult.profitLoss > 0 ? '+' : ''}${periodResult.profitLoss.toFixed(2)} TRY (${periodResult.profitLossPercentage > 0 ? '+' : ''}${periodResult.profitLossPercentage.toFixed(2)}%)`);
  }, [prices, historicalPrices, assetsForPricing, displayCurrency, transactions, exchangeRates, selectedPeriod]);

  // Varlık dağılımı verilerini ANLIK FİYATLARA GÖRE hesapla
  const getCategoryValues = () => {
    const categoryTotals = {
      'Altın': 0,
      'Kripto': 0,
      'Borsa': 0,
      'Döviz': 0,
    };

    assetsForPricing.forEach(asset => {
      const priceData = prices[asset.name];
      let valueInTRY = 0;

      if (priceData && priceData.price > 0 && !priceData.error) {
        const priceCurrency = priceData.currency || 'TRY';
        // ✅ Dinamik kurları kullan
        const currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        valueInTRY = asset.quantity * currentPriceInTRY;
      } else {
        valueInTRY = asset.totalCost;
      }

      if (categoryTotals[asset.category] !== undefined) {
        categoryTotals[asset.category] += valueInTRY;
      }
    });

    return categoryTotals;
  };

  const categoryValues = getCategoryValues();

  const rawDistribution = [
    {
      name: 'Altın',
      value: convertCurrency(categoryValues['Altın']),
      color: getCategoryColor('Altın')
    },
    {
      name: 'Kripto',
      value: convertCurrency(categoryValues['Kripto']),
      color: getCategoryColor('Kripto')
    },
    {
      name: 'Borsa',
      value: convertCurrency(categoryValues['Borsa']),
      color: getCategoryColor('Borsa')
    },
    {
      name: 'Döviz',
      value: convertCurrency(categoryValues['Döviz']),
      color: getCategoryColor('Döviz')
    },
  ].filter(item => item.value > 0);

  // Yüzdeleri hesapla - ondalıklı hassas gösterim
  const portfolioDistribution = rawDistribution.map((item, index, arr) => {
    // Division by zero kontrolü
    const exactPercentage = totalPortfolioValue > 0
      ? (item.value / totalPortfolioValue) * 100
      : 0;

    return {
      ...item,
      percentage: Math.round(exactPercentage), // Yuvarlanmış hali (eski uyumluluk için)
      exactPercentage: exactPercentage // Hassas ondalıklı değer
    };
  });

  // ========================================
  // KATEGORİ DETAY FONKSİYONLARI (Her kategori için ayrı)
  // ========================================

  /**
   * Ortak yardımcı fonksiyon: Varlık listesini toplar ve işler
   */
  const collectCategoryAssets = (categoryName) => {
    const categoryAssets = {};
    transactions.forEach(tx => {
      if (tx.mainCategory === categoryName) {
        const assetKey = tx.assetName;
        if (!categoryAssets[assetKey]) {
          categoryAssets[assetKey] = {
            totalQuantity: 0,
            totalCostInTRY: 0,
            transactions: [],
            symbol: tx.symbol || null, // Symbol bilgisini sakla
          };
        }

        // En güncel symbol'ü kullan
        if (tx.symbol && !categoryAssets[assetKey].symbol) {
          categoryAssets[assetKey].symbol = tx.symbol;
        }

        const multiplier = tx.type === 'buy' ? 1 : -1;
        categoryAssets[assetKey].totalQuantity += tx.quantity * multiplier;

        const txCurrency = tx.currency || 'TRY';
        const costInTRY = convertToTRY(tx.quantity * tx.unitPrice, txCurrency, exchangeRates);

        // SADECE ALIŞ işlemleri toplam maliyete eklenir
        // Satış işlemleri avg price'ı değiştirmez!
        if (tx.type === 'buy') {
          categoryAssets[assetKey].totalCostInTRY += costInTRY;
        }

        categoryAssets[assetKey].transactions.push(tx);
      }
    });

    return Object.entries(categoryAssets).filter(([_, data]) => data.totalQuantity > 0);
  };

  /**
   * Verilen ana kategori için alt kategori dağılımını hesapla
   * Eğer alt kategori yoksa boş dizi döner
   */
  const getSubCategoryDistribution = (parentCategory) => {
    const subcats = getSubCategoriesByCategory(parentCategory) || [];
    if (!subcats || subcats.length === 0) return [];

    // Hazırla: ana kategori içindeki varlık verileri (name -> data)
    const assets = Object.fromEntries(collectCategoryAssets(parentCategory));

    const results = subcats.map((subcat) => {
      const assetNames = Array.isArray(subcat.assets) ? subcat.assets : [];
      let totalInTRY = 0;

      assetNames.forEach((assetName) => {
        const entry = assets[assetName];
        if (!entry) return;

        // entry: { totalQuantity, totalCostInTRY, transactions, symbol }
        const priceData = prices[assetName];
        let currentValueInTRY = entry.totalCostInTRY;

        if (priceData && priceData.price > 0 && !priceData.error) {
          const priceCurrency = priceData.currency || 'TRY';
          const currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
          currentValueInTRY = entry.totalQuantity * currentPriceInTRY;
        }

        totalInTRY += currentValueInTRY;
      });

      return {
        id: subcat.id,
        name: subcat.name,
        value: convertCurrency(totalInTRY),
        rawValue: totalInTRY,
        color: subcat.color || generateColorForAsset(subcat.name),
      };
    });

    // Ayrıca kategorisiz (atanmamış) varlıkları tek bir pseudo-altkategori olarak ekle
    try {
      const allAssetNames = Object.keys(assets);
      const assignedKeys = new Set();
      Object.keys(assetMapping || {}).forEach(k => {
        const mapped = assetMapping[k];
        if (mapped && subcats.some(s => s.id === mapped)) {
          assignedKeys.add(normalizeAssetKey(k));
        }
      });

      const unassigned = allAssetNames.filter(aName => !assignedKeys.has(normalizeAssetKey(aName)));
      if (unassigned.length > 0) {
        let totalUnassignedInTRY = 0;
        unassigned.forEach((assetName) => {
          const entry = assets[assetName];
          if (!entry) return;
          const priceData = prices[assetName];
          let currentValueInTRY = entry.totalCostInTRY;
          if (priceData && priceData.price > 0 && !priceData.error) {
            const priceCurrency = priceData.currency || 'TRY';
            const currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
            currentValueInTRY = entry.totalQuantity * currentPriceInTRY;
          }
          totalUnassignedInTRY += currentValueInTRY;
        });

        results.push({
          id: UNASSIGNED_ID,
          name: UNASSIGNED_LABEL,
          value: convertCurrency(totalUnassignedInTRY),
          rawValue: totalUnassignedInTRY,
          color: generateColorForAsset(UNASSIGNED_LABEL)
        });
      }
    } catch (e) {
      console.error('getSubCategoryDistribution - unassigned aggregation failed', e);
    }

    return results;
  };

  /**
   * Verilen alt kategori id'si için içindeki varlıkların detaylarını döner
   */
  const getAssetsForSubCategory = (parentCategory, subCategoryId) => {
    // Special-case: pseudo-category for unassigned assets
    const assetsMap = Object.fromEntries(collectCategoryAssets(parentCategory));
    if (subCategoryId === UNASSIGNED_ID) {
      const allAssetNames = Object.keys(assetsMap);
      const subcats = getSubCategoriesByCategory(parentCategory) || [];
      const assignedKeys = new Set();
      Object.keys(assetMapping || {}).forEach(k => {
        const mapped = assetMapping[k];
        if (mapped && subcats.some(s => s.id === mapped)) assignedKeys.add(normalizeAssetKey(k));
      });

      const unassignedNames = allAssetNames.filter(aName => !assignedKeys.has(normalizeAssetKey(aName)));

      const assetListUnassigned = unassignedNames.map((assetName, index) => {
        const data = assetsMap[assetName];
        if (!data) return null;

        const totalBuyQuantity = data.transactions
          .filter(tx => tx.type === 'buy')
          .reduce((sum, tx) => sum + tx.quantity, 0);

        const avgCostInTRY = totalBuyQuantity > 0 ? data.totalCostInTRY / totalBuyQuantity : 0;

        const priceData = prices[assetName];
        let currentPriceInTRY = null;
        let hasLivePrice = false;
        let currentValueInTRY = data.totalCostInTRY;

        if (priceData && priceData.price > 0 && !priceData.error) {
          const priceCurrency = priceData.currency || 'USD';
          currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
          currentValueInTRY = data.totalQuantity * currentPriceInTRY;
          hasLivePrice = true;
        }

        return {
          name: assetName.includes('(') ? assetName.split('(')[0].trim() : assetName,
          fullName: assetName,
          symbol: data.symbol || null,
          value: convertCurrency(currentValueInTRY),
          rawValue: currentValueInTRY,
          quantity: data.totalQuantity,
          avgPrice: convertCurrency(avgCostInTRY),
          currentPrice: currentPriceInTRY ? convertCurrency(currentPriceInTRY) : null,
          hasLivePrice,
          color: generateColorForAsset(assetName, index),
          quantityLabel: 'Miktar',
        };
      }).filter(Boolean);

      const categoryTotal = assetListUnassigned.reduce((sum, it) => sum + it.value, 0);
      return assetListUnassigned.map((item) => {
        const exactPercentage = categoryTotal > 0 ? (item.value / categoryTotal) * 100 : 0;
        return {
          ...item,
          percentage: Math.round(exactPercentage),
          exactPercentage
        };
      });
    }

    const subcat = getSubCategoryById(subCategoryId);
    if (!subcat) return [];

    // Collect category assets map

    const assetList = (subcat.assets || []).map((assetName, index) => {
      const data = assetsMap[assetName];
      if (!data) return null;

      const totalBuyQuantity = data.transactions
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const avgCostInTRY = totalBuyQuantity > 0 ? data.totalCostInTRY / totalBuyQuantity : 0;

      const priceData = prices[assetName];
      let currentPriceInTRY = null;
      let hasLivePrice = false;
      let currentValueInTRY = data.totalCostInTRY;

      if (priceData && priceData.price > 0 && !priceData.error) {
        const priceCurrency = priceData.currency || 'USD';
        currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        currentValueInTRY = data.totalQuantity * currentPriceInTRY;
        hasLivePrice = true;
      }

      return {
        name: assetName.includes('(') ? assetName.split('(')[0].trim() : assetName,
        fullName: assetName,
        symbol: data.symbol || null,
        value: convertCurrency(currentValueInTRY),
        rawValue: currentValueInTRY,
        quantity: data.totalQuantity,
        avgPrice: convertCurrency(avgCostInTRY),
        currentPrice: currentPriceInTRY ? convertCurrency(currentPriceInTRY) : null,
        hasLivePrice,
        color: generateColorForAsset(assetName, index),
        quantityLabel: 'Miktar',
      };
    }).filter(Boolean);

    // Yüzdeleri hesapla
    const categoryTotal = assetList.reduce((sum, it) => sum + it.value, 0);
    return assetList.map((item) => {
      const exactPercentage = categoryTotal > 0 ? (item.value / categoryTotal) * 100 : 0;
      return {
        ...item,
        percentage: Math.round(exactPercentage),
        exactPercentage
      };
    });
  };

  /**
   * KRİPTO kategorisi için detay hesaplama
   */
  const getCryptoDetail = () => {
    const assets = collectCategoryAssets('Kripto');

    return assets.map(([name, data], index) => {
      // Ortalama alış fiyatı = Toplam alış maliyeti / Toplam alınan miktar
      // Satışlar avg price'ı değiştirmez!
      const totalBuyQuantity = data.transactions
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const avgCostInTRY = totalBuyQuantity > 0 ? data.totalCostInTRY / totalBuyQuantity : 0;

      // Kripto için prices objesinde ara
      const priceData = prices[name];
      let currentPriceInTRY = null;
      let hasLivePrice = false;
      let currentValueInTRY = data.totalCostInTRY;

      if (priceData && priceData.price > 0 && !priceData.error) {
        const priceCurrency = priceData.currency || 'USD';
        currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        currentValueInTRY = data.totalQuantity * currentPriceInTRY;
        hasLivePrice = true;
        console.log(`✅ CRYPTO ${name}: ${priceData.price} ${priceCurrency} → ${currentPriceInTRY.toFixed(2)} TRY`);
      } else {
        console.log(`⚠️ CRYPTO ${name}: Fiyat bulunamadı, maliyet kullanıldı`);
      }

      return {
        name: name.includes('(') ? name.split('(')[0].trim() : name,
        fullName: name,
        symbol: data.symbol || null, // Symbol ekle
        value: convertCurrency(currentValueInTRY),
        quantity: data.totalQuantity,
        avgPrice: convertCurrency(avgCostInTRY),
        currentPrice: currentPriceInTRY ? convertCurrency(currentPriceInTRY) : null,
        hasLivePrice,
        color: generateColorForAsset(name, index),
        quantityLabel: 'Miktar',
      };
    });
  };

  /**
   * ALTIN kategorisi için detay hesaplama
   */
  const getGoldDetail = () => {
    const assets = collectCategoryAssets('Altın');

    return assets.map(([name, data], index) => {
      // Ortalama alış fiyatı hesaplama (sadece BUY)
      const totalBuyQuantity = data.transactions
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const avgCostInTRY = totalBuyQuantity > 0 ? data.totalCostInTRY / totalBuyQuantity : 0;

      // Altın için prices objesinde ara
      const priceData = prices[name];
      let currentPriceInTRY = null;
      let hasLivePrice = false;
      let currentValueInTRY = data.totalCostInTRY;

      if (priceData && priceData.price > 0 && !priceData.error) {
        const priceCurrency = priceData.currency || 'TRY';
        currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        currentValueInTRY = data.totalQuantity * currentPriceInTRY;
        hasLivePrice = true;
        console.log(`✅ GOLD ${name}: ${priceData.price} ${priceCurrency} → ${currentPriceInTRY.toFixed(2)} TRY`);
      } else {
        console.log(`⚠️ GOLD ${name}: Fiyat bulunamadı, maliyet kullanıldı`);
      }

      return {
        name: name.includes('(') ? name.split('(')[0].trim() : name,
        fullName: name,
        symbol: data.symbol || null, // Symbol ekle
        value: convertCurrency(currentValueInTRY),
        quantity: data.totalQuantity,
        avgPrice: convertCurrency(avgCostInTRY),
        currentPrice: currentPriceInTRY ? convertCurrency(currentPriceInTRY) : null,
        hasLivePrice,
        color: generateColorForAsset(name, index),
        quantityLabel: 'Adet',
      };
    });
  };

  /**
   * BORSA kategorisi için detay hesaplama
   */
  const getStockDetail = () => {
    const assets = collectCategoryAssets('Borsa');

    return assets.map(([name, data], index) => {
      // Ortalama alış fiyatı hesaplama (sadece BUY)
      const totalBuyQuantity = data.transactions
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const avgCostInTRY = totalBuyQuantity > 0 ? data.totalCostInTRY / totalBuyQuantity : 0;

      // Borsa için prices objesinde ara
      const priceData = prices[name];
      let currentPriceInTRY = null;
      let hasLivePrice = false;
      let currentValueInTRY = data.totalCostInTRY;

      if (priceData && priceData.price > 0 && !priceData.error) {
        const priceCurrency = priceData.currency || 'TRY';
        currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        currentValueInTRY = data.totalQuantity * currentPriceInTRY;
        hasLivePrice = true;
        console.log(`✅ STOCK ${name}: ${priceData.price} ${priceCurrency} → ${currentPriceInTRY.toFixed(2)} TRY`);
      } else {
        console.log(`⚠️ STOCK ${name}: Fiyat bulunamadı, maliyet kullanıldı`);
      }

      return {
        name: name.includes('(') ? name.split('(')[0].trim() : name,
        fullName: name,
        symbol: data.symbol || null,
        value: convertCurrency(currentValueInTRY),
        quantity: data.totalQuantity,
        avgPrice: convertCurrency(avgCostInTRY),
        currentPrice: currentPriceInTRY ? convertCurrency(currentPriceInTRY) : null,
        hasLivePrice,
        color: generateColorForAsset(name, index),
        quantityLabel: 'Adet',
      };
    });
  };

  /**
   * DÖVİZ kategorisi için detay hesaplama
   */
  const getForexDetail = () => {
    const assets = collectCategoryAssets('Döviz');

    return assets.map(([name, data], index) => {
      // Ortalama alış fiyatı hesaplama (sadece BUY)
      const totalBuyQuantity = data.transactions
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const avgCostInTRY = totalBuyQuantity > 0 ? data.totalCostInTRY / totalBuyQuantity : 0;

      // Döviz için prices objesinde ara
      const priceData = prices[name];
      let currentPriceInTRY = null;
      let hasLivePrice = false;
      let currentValueInTRY = data.totalCostInTRY;

      if (priceData && priceData.price > 0 && !priceData.error) {
        const priceCurrency = priceData.currency || 'TRY';
        currentPriceInTRY = convertToTRY(priceData.price, priceCurrency, exchangeRates);
        currentValueInTRY = data.totalQuantity * currentPriceInTRY;
        hasLivePrice = true;
        console.log(`✅ FOREX ${name}: ${priceData.price} ${priceCurrency} → ${currentPriceInTRY.toFixed(2)} TRY`);
      } else {
        console.log(`⚠️ FOREX ${name}: Fiyat bulunamadı, maliyet kullanıldı`);
      }

      return {
        name: name.includes('(') ? name.split('(')[0].trim() : name,
        fullName: name,
        symbol: data.symbol || null,
        value: convertCurrency(currentValueInTRY),
        quantity: data.totalQuantity,
        avgPrice: convertCurrency(avgCostInTRY),
        currentPrice: currentPriceInTRY ? convertCurrency(currentPriceInTRY) : null,
        hasLivePrice,
        color: generateColorForAsset(name, index),
        quantityLabel: 'Miktar',
      };
    });
  };

  /**
   * Ana kategori detay fonksiyonu - Kategoriye göre doğru fonksiyonu çağırır
   */
  const getCategoryDetail = (categoryName) => {
    if (!categoryName) return [];

    let assetArray = [];

    switch (categoryName) {
      case 'Kripto':
        assetArray = getCryptoDetail();
        break;
      case 'Altın':
        assetArray = getGoldDetail();
        break;
      case 'Borsa':
        assetArray = getStockDetail();
        break;
      case 'Döviz':
        assetArray = getForexDetail();
        break;
      default:
        console.warn(`⚠️ Bilinmeyen kategori: ${categoryName}`);
        return [];
    }

    // Toplam değere göre büyükten küçüğe sırala
    assetArray.sort((a, b) => b.value - a.value);

    // Toplam değer
    const categoryTotal = assetArray.reduce((sum, item) => sum + item.value, 0);

    // Yüzdeleri hesapla - ondalıklı hassas gösterim
    return assetArray.map((item) => {
      const exactPercentage = categoryTotal > 0 ? (item.value / categoryTotal) * 100 : 0;

      return {
        ...item,
        percentage: Math.round(exactPercentage), // Yuvarlanmış hali (eski uyumluluk için)
        exactPercentage: exactPercentage // Hassas ondalıklı değer
      };
    });
  };

  // Gösterilecek dağılım:
  // - Eğer kategori seçili değilse: genel portföy dağılımı
  // - Eğer kategori seçili ve o kategorinin alt kategorileri varsa: önce alt kategoriler gösterilir
  // - Eğer alt kategori seçildiyse: seçili alt kategorinin içindeki varlıklar gösterilir
  let displayDistribution = portfolioDistribution;
  let distributionTitle = 'Varlık Dağılımı';
  let centerValue = totalPortfolioValue;

  if (selectedCategory) {
    // Alt kategori listesi gösterilecek mi?
    const subcatList = getSubCategoriesByCategory(selectedCategory) || [];

    if (selectedSubCategory) {
      // Alt kategori içindeki varlıkları göster
      displayDistribution = getAssetsForSubCategory(selectedCategory, selectedSubCategory);
      // Eğer pseudo-uncategorized seçiliyse, kullanıcının beklediği gibi alt kategori adını göster
      if (selectedSubCategory === UNASSIGNED_ID) {
        distributionTitle = `${UNASSIGNED_LABEL} Varlıkları`;
      } else {
        const subcatObj = getSubCategoryById(selectedSubCategory);
        distributionTitle = subcatObj ? `${subcatObj.name} Varlıkları` : `${selectedCategory} Varlıkları`;
      }
      centerValue = displayDistribution.reduce((sum, item) => sum + item.value, 0);
    } else if (subcatList && subcatList.length > 0) {
      // Alt kategorileri göster (ilk seviye)
      displayDistribution = getSubCategoryDistribution(selectedCategory).map(item => {
        // exactPercentage hesaba rawValue üzerinden yapılacak daha sonra ChartLegend/doughnut hesaplayacak
        return {
          id: item.id,
          name: item.name,
          value: item.value,
          rawValue: item.rawValue,
          color: item.color
        };
      });
      distributionTitle = `${selectedCategory} Dağılımı`;
      centerValue = displayDistribution.reduce((sum, item) => sum + item.value, 0);
    } else {
      // Alt kategori yoksa mevcut davranış (varlık listesi)
      displayDistribution = getCategoryDetail(selectedCategory);
      distributionTitle = `${selectedCategory} Dağılımı`;
      centerValue = displayDistribution.reduce((sum, item) => sum + item.value, 0);
    }
  }

  // displayDistribution içindeki öğelere exactPercentage/percentage ekle (grafik ve legend için)
  const totalForPercentage = centerValue || 0;
  displayDistribution = displayDistribution.map(item => {
    const valueForPct = typeof item.value === 'number' ? item.value : (item.rawValue || 0);
    const exactPercentage = totalForPercentage > 0 ? (valueForPct / totalForPercentage) * 100 : (item.exactPercentage || 0);
    return {
      ...item,
      exactPercentage,
      percentage: Math.round(exactPercentage)
    };
  });

  // When selectedSubCategory changes (entering/exiting a subcategory) reset
  // the horizontal quickview scroll so previous scroll positions inside the
  // subcategory don't leak back to the parent/category view. We perform a
  // programmatic scroll to start but avoid recording that programmatic
  // position as a user scroll position.
  useEffect(() => {
    if (cardsScrollRef && cardsScrollRef.current) {
      try {
        programmaticScrollRef.current = true;
        cardsScrollRef.current.scrollTo({ x: 0, animated: true });
        setTimeout(() => { programmaticScrollRef.current = false; }, 400);
      } catch (e) {
        try {
          const responder = cardsScrollRef.current.getScrollResponder && cardsScrollRef.current.getScrollResponder();
          programmaticScrollRef.current = true;
          responder && responder.scrollTo && responder.scrollTo({ x: 0, animated: true });
          setTimeout(() => { programmaticScrollRef.current = false; }, 400);
        } catch (err) {
          programmaticScrollRef.current = false;
        }
      }
    }
  }, [selectedSubCategory]);

  // When user navigates into a category (selectedCategory changes) or goes
  // back to the main quick view (selectedCategory becomes null), restore the
  // stored horizontal scroll position for that view (if any) otherwise
  // scroll to start. This preserves per-view user scroll positions.
  useEffect(() => {
    const viewKey = selectedCategory ? `cat:${selectedCategory}` : 'main';
    const x = cardsScrollPositionsRef.current[viewKey] || 0;
    if (cardsScrollRef && cardsScrollRef.current) {
      try {
        programmaticScrollRef.current = true;
        cardsScrollRef.current.scrollTo({ x, animated: true });
        setTimeout(() => { programmaticScrollRef.current = false; }, 400);
      } catch (e) {
        try {
          const responder = cardsScrollRef.current.getScrollResponder && cardsScrollRef.current.getScrollResponder();
          programmaticScrollRef.current = true;
          responder && responder.scrollTo && responder.scrollTo({ x, animated: true });
          setTimeout(() => { programmaticScrollRef.current = false; }, 400);
        } catch (err) {
          programmaticScrollRef.current = false;
        }
      }
    }
  }, [selectedCategory]);

  // Handler to update stored scroll position (debounced)
  const handleCardsScroll = (event) => {
    if (programmaticScrollRef.current) return;
    const x = event.nativeEvent.contentOffset.x || 0;
    const viewKey = selectedCategory ? `cat:${selectedCategory}` : 'main';
    if (scrollSaveTimeoutRef.current) clearTimeout(scrollSaveTimeoutRef.current);
    scrollSaveTimeoutRef.current = setTimeout(() => {
      cardsScrollPositionsRef.current[viewKey] = x;
    }, 150);
  };

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

        {/* Portfolio Value Header - Modern Tasarım */}
        <PortfolioValueHeader
          totalValue={totalPortfolioValue}
          currencySymbol={currencySymbol}
          profitLoss={profitLossData.profitLoss}
          profitLossPercentage={profitLossData.profitLossPercentage}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          isBalanceHidden={isBalanceHidden}
          onToggleBalance={() => setIsBalanceHidden(!isBalanceHidden)}
        />

        {/* Banner Reklam - dashboard'ta görünür */}
        <AdBanner style={{ marginTop: 12, marginBottom: 8 }} />

        {/* Loading Indicator */}
        {pricesLoading && (
          <View style={styles.loadingBadgeCenter}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fiyatlar güncelleniyor...</Text>
          </View>
        )}

        {/* Varlık Dağılımı Bölümü */}
        <View style={styles.assetDistributionSection}>
          {/* Başlık + Geri Butonu */}
          <View style={styles.sectionHeader}>
            {selectedCategory ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  // Eğer alt kategori içindeysek önce alt kategori seçimini temizle
                  if (selectedSubCategory) {
                    setSelectedSubCategory(null);
                  } else {
                    setSelectedCategory(null);
                  }
                }}
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
              isBalanceHidden={isBalanceHidden}
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
        <ScrollView
          key={`quickview-${focusTick}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsRow}
          ref={cardsScrollRef}
          onScroll={handleCardsScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingLeft: (selectedSubCategory === '__UNCATEGORIZED__') ? 28 : 16, paddingRight: 16, paddingVertical: 8, alignItems: 'flex-start' }}
        >
          {selectedCategory ? (
            // Kategori seçiliyse: 3 durum olabilir
            // 1) selectedSubCategory varsa -> displayDistribution = varlıklar (AssetDetailCard)
            // 2) selectedSubCategory yok ve displayDistribution items represent subcategories -> render QuickViewCard for each subcategory
            // 3) selectedSubCategory yok and no subcategories -> fallback asset detail cards
            displayDistribution.length > 0 ? (
              displayDistribution.map((asset) => {
                // Eğer item bir alt kategori objesi ise (id varsa) render QuickViewCard
                const isSubCategoryItem = !!asset.id && !asset.fullName && !asset.quantity;
                if (isSubCategoryItem && !selectedSubCategory) {
                  // Alt kategori kartı göster
                  const icon = null; // no icon for subcategory (could use generic)
                  return (
                    <QuickViewCard
                      key={asset.id}
                      icon={icon}
                      name={asset.name}
                      value={asset.value}
                      change={asset.exactPercentage || asset.percentage || 0}
                      color={asset.color}
                      currencySymbol={currencySymbol}
                      onPress={() => setSelectedSubCategory(asset.id)}
                      isBalanceHidden={isBalanceHidden}
                    />
                  );
                }

                // Diğer durumda varlık kartı göster (AssetDetailCard)
                return (
                  // Bu varlığın anlık fiyatını bul - fullName veya name ile dene
                  (() => {
                    // Bu varlığın anlık fiyatını bul - fullName veya name ile dene
                    const priceData = prices[asset.fullName] || prices[asset.name];

                    // currentPrice zaten getCategoryDetail veya getAssetsForSubCategory'de hesaplanmış!
                    let currentPrice = asset.currentPrice || null;
                    console.log(`🎯 AssetDetailCard: ${asset.name}, currentPrice=${currentPrice}, priceData=`, priceData);

                    return (
                      <AssetDetailCard
                        key={asset.name}
                        asset={asset}
                        currencySymbol={currencySymbol}
                        currentPrice={currentPrice}
                        isBalanceHidden={isBalanceHidden}
                        onPress={() => {
                          // Bu varlığın transaction'larından API bilgilerini al
                          const assetTransactions = transactions.filter(
                            tx => tx.mainCategory === selectedCategory && tx.assetName === (asset.fullName || asset.name)
                          );

                          // En güncel transaction'dan API bilgilerini al
                          const latestTx = assetTransactions[0] || {};

                          // selectedAssetInfo objesi oluştur (TransactionScreen'in beklediği formatta)
                          const assetInfo = {
                            provider: latestTx.provider || null,
                            id: latestTx.apiId || null,
                            symbol: asset.symbol || latestTx.symbol || null,
                            currency: latestTx.apiCurrency || 'TRY',
                            category: selectedCategory,
                            fullName: asset.fullName || asset.name
                          };

                          // Tab Navigator üzerinden İşlem Yap sekmesine parametrelerle geçiş
                          navigation.navigate('İşlem Yap', createPreselectedAsset(
                            selectedCategory,
                            asset.fullName || asset.name,
                            'buy',
                            assetInfo
                          ));
                        }}
                      />
                    );
                  })()
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
                    onPress={() => {
                      trackOpen();
                      showInterstitialIfReady();
                      setSelectedCategory(asset.name);
                    }}
                    isBalanceHidden={isBalanceHidden}
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

        {/* Bottom banner - ensure visibility at very bottom of dashboard */}
        <AdBanner style={{ marginVertical: 12, marginHorizontal: 16 }} />
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
  loadingBadgeCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 20,
    alignSelf: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
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
