/**
 * PortfolioContext.js - Global Portföy Veri Yönetimi
 * 
 * AMAÇ: Tüm ekranların erişebileceği merkezi veri deposu
 * 
 * STATE:
 * - transactions: Tüm işlemler (alış/satış)
 * - categories: Ana ve alt kategoriler
 * - totalValue: Toplam portföy değeri
 * 
 * ACTIONS:
 * - addTransaction: Yeni işlem ekle
 * - deleteTransaction: İşlem sil
 * - addCategory: Yeni kategori ekle
 * - updateAssetPrice: Varlık fiyatını güncelle (API için)
 * 
 * PERSISTENCE:
 * - AsyncStorage ile otomatik kaydetme
 * - Uygulama açılınca otomatik yükleme
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXCHANGE_RATES } from '../constants/theme';
import { STORAGE_KEYS, CATEGORIES } from '../constants/storage.constants';
import { validateTransaction, handleError } from '../utils';
import { getAssetMapping } from '../constants/apiMapping';

// Context oluştur
const PortfolioContext = createContext();

// Storage key'leri (backward compatibility için local tanım)
const LOCAL_STORAGE_KEYS = {
  PORTFOLIOS: STORAGE_KEYS.PORTFOLIOS || '@portfolio_portfolios',
  ACTIVE_PORTFOLIO_ID: '@portfolio_active_id',
  CATEGORIES: '@portfolio_categories',
  DISPLAY_CURRENCY: '@portfolio_display_currency',
};

// Varsayılan kategoriler (ilk kurulum için)
const DEFAULT_CATEGORIES = {
  'Altın': ['Gram Altın', 'Çeyrek Altın', 'Külçe'],
  'Kripto': ['Bitcoin', 'Ethereum', 'Diğer'],
  'Borsa': ['Halka Arz', 'Normal Hisse', 'ETF'],
  'Döviz': ['USD', 'EUR', 'GBP'],
};

// Provider Component
export function PortfolioProvider({ children }) {
  // State tanımları
  const [portfolios, setPortfolios] = useState([
    { id: '1', name: 'Ana Portföy', transactions: [] }
  ]); // Portföy listesi
  const [activePortfolioId, setActivePortfolioId] = useState('1'); // Aktif portföy
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [displayCurrency, setDisplayCurrency] = useState('TRY'); // Dashboard'da gösterilecek para birimi
  const [loading, setLoading] = useState(true);

  // Aktif portföyün transactions'ını al
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);
  const transactions = activePortfolio?.transactions || [];

  // Uygulama açılınca verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  // Veriler değişince otomatik kaydet
  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [portfolios, activePortfolioId, categories, displayCurrency]);

  /**
   * AsyncStorage'dan verileri yükle
   */
  const loadData = async () => {
    try {
      // Portfolios yükle
      const savedPortfolios = await AsyncStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      
      if (savedPortfolios) {
        setPortfolios(JSON.parse(savedPortfolios));
        console.log('📦 Yüklenen portföyler:', JSON.parse(savedPortfolios).length);
      } else {
        // Migration: Eski veri yapısı varsa dönüştür
        const oldTransactions = await AsyncStorage.getItem('@portfolio_transactions');
        if (oldTransactions) {
          console.log('🔄 Eski veri yapısı tespit edildi, dönüştürülüyor...');
          const transactions = JSON.parse(oldTransactions);
          const migratedPortfolios = [
            { id: '1', name: 'Ana Portföy', transactions: transactions }
          ];
          setPortfolios(migratedPortfolios);
          // Eski veriyi sil
          await AsyncStorage.removeItem('@portfolio_transactions');
          console.log('✅ Migration tamamlandı:', transactions.length, 'işlem taşındı');
        }
      }

      // Active Portfolio ID yükle
      const savedActiveId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PORTFOLIO_ID);
      if (savedActiveId) {
        setActivePortfolioId(savedActiveId);
      }

      // Categories yükle
      const savedCategories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }

      // Display Currency yükle
      const savedCurrency = await AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_CURRENCY);
      if (savedCurrency) {
        setDisplayCurrency(savedCurrency);
      }

      console.log('✅ Veriler AsyncStorage\'dan yüklendi');
    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * AsyncStorage'ı temizle (DEBUG)
   */
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setPortfolios([{ id: '1', name: 'Ana Portföy', transactions: [] }]);
      setActivePortfolioId('1');
      setCategories(DEFAULT_CATEGORIES);
      setDisplayCurrency('TRY');
      console.log('🗑️ Tüm veriler temizlendi!');
    } catch (error) {
      console.error('❌ Temizleme hatası:', error);
    }
  };

  /**
   * Verileri AsyncStorage'a kaydet
   */
  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PORTFOLIOS,
        JSON.stringify(portfolios)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVE_PORTFOLIO_ID,
        activePortfolioId
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categories)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.DISPLAY_CURRENCY,
        displayCurrency
      );
      console.log('💾 Veriler AsyncStorage\'a kaydedildi');
    } catch (error) {
      console.error('❌ Veri kaydetme hatası:', error);
    }
  };

  /**
   * Yeni işlem ekle (aktif portföye)
   * @param {Object} transaction - İşlem verisi
   */
  const addTransaction = (transaction) => {
    // API mapping bilgisini otomatik ekle
    let apiMapping = transaction.apiMapping;
    
    if (!apiMapping) {
      // Statik mapping'den bul
      apiMapping = getAssetMapping(transaction.assetName);
      
      // Bulamazsa dinamik olarak tahmin et
      if (!apiMapping) {
        const symbolMatch = transaction.assetName.match(/\(([^)]+)\)/);
        const symbol = symbolMatch ? symbolMatch[1] : transaction.assetName;
        
        // Hisse senedi kontrolü
        if (symbol.includes('.IS')) {
          apiMapping = {
            symbol,
            provider: 'yahoo',
            id: symbol,
            currency: 'TRY',
            category: transaction.mainCategory || 'Borsa'
          };
        }
        // Kripto para varsayımı
        else if (symbol.length >= 2 && symbol.length <= 5) {
          apiMapping = {
            symbol,
            provider: 'coingecko',
            id: symbol.toLowerCase(),
            currency: 'USD',
            category: transaction.mainCategory || 'Kripto'
          };
        }
      }
    }
    
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      apiMapping, // API bilgisini ekle
      createdAt: new Date().toISOString(),
    };

    setPortfolios(prev => prev.map(portfolio => 
      portfolio.id === activePortfolioId
        ? { ...portfolio, transactions: [newTransaction, ...portfolio.transactions] }
        : portfolio
    ));

    console.log('➕ Yeni işlem eklendi:', {
      type: newTransaction.type,
      assetName: newTransaction.assetName,
      quantity: newTransaction.quantity,
      unitPrice: newTransaction.unitPrice,
      apiMapping: newTransaction.apiMapping,
    });
  };

  /**
   * İşlem sil (aktif portföyden)
   * @param {string} transactionId - Silinecek işlem ID'si
   */
  const deleteTransaction = (transactionId) => {
    setPortfolios(prev => prev.map(portfolio => 
      portfolio.id === activePortfolioId
        ? { ...portfolio, transactions: portfolio.transactions.filter(t => t.id !== transactionId) }
        : portfolio
    ));
    console.log('🗑️ İşlem silindi:', transactionId);
  };

  /**
   * Yeni portföy oluştur
   * @param {string} name - Portföy adı
   */
  const createPortfolio = (name) => {
    const newPortfolio = {
      id: Date.now().toString(),
      name: name.trim() || 'Yeni Portföy',
      transactions: [],
    };

    setPortfolios(prev => [...prev, newPortfolio]);
    setActivePortfolioId(newPortfolio.id);
    console.log('📁 Yeni portföy oluşturuldu:', newPortfolio.name);
  };

  /**
   * Portföy adını güncelle
   * @param {string} portfolioId - Portföy ID
   * @param {string} newName - Yeni portföy adı
   */
  const renamePortfolio = (portfolioId, newName) => {
    setPortfolios(prev => prev.map(portfolio => 
      portfolio.id === portfolioId
        ? { ...portfolio, name: newName.trim() }
        : portfolio
    ));
    console.log('✏️ Portföy adı güncellendi:', newName);
  };

  /**
   * Portföy sil
   * @param {string} portfolioId - Silinecek portföy ID'si
   */
  const deletePortfolio = (portfolioId) => {
    // En az 1 portföy kalmalı
    if (portfolios.length <= 1) {
      console.warn('⚠️ En az bir portföy olmalı');
      return;
    }

    setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
    
    // Eğer silinen aktif portföy ise, ilk portföyü aktif yap
    if (activePortfolioId === portfolioId) {
      const remaining = portfolios.filter(p => p.id !== portfolioId);
      setActivePortfolioId(remaining[0]?.id || '1');
    }
    
    console.log('🗑️ Portföy silindi:', portfolioId);
  };

  /**
   * Yeni alt kategori ekle
   * @param {string} mainCategory - Ana kategori (Altın, Kripto, etc.)
   * @param {string} subCategory - Alt kategori adı
   */
  const addCategory = (mainCategory, subCategory) => {
    setCategories(prev => ({
      ...prev,
      [mainCategory]: [...(prev[mainCategory] || []), subCategory],
    }));
    console.log(`📁 Yeni kategori eklendi: ${mainCategory} > ${subCategory}`);
  };

  /**
   * Toplam portföy değerini hesapla
   * HER VARLIK İÇİN NET POZİSYON hesapla (alış - satış)
   * ORTALAMA MALİYET yöntemi kullan
   * @returns {Object} Kategori bazlı toplam değerler
   */
  const calculateTotalValue = () => {
    const totals = {
      'Altın': 0,
      'Kripto': 0,
      'Borsa': 0,
      'Döviz': 0,
      overall: 0,
    };

    // Her varlık için net pozisyon hesapla
    const assetPositions = {};

    // İşlemleri TARIHINE GÖRE SIRALA (en eskiden en yeniye)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
    );

    console.log(`📋 Total Transactions: ${sortedTransactions.length}`);

    sortedTransactions.forEach((transaction, index) => {
      // Varlık adını normalize et (boşluk ve case-insensitive)
      const normalizedAssetName = transaction.assetName.trim();
      const key = `${transaction.mainCategory}_${normalizedAssetName}`;
      
      console.log(`🔍 [${index + 1}] ${transaction.type.toUpperCase()} | ${normalizedAssetName} | Qty: ${transaction.quantity} | Key: ${key}`);
      
      if (!assetPositions[key]) {
        assetPositions[key] = {
          mainCategory: transaction.mainCategory,
          assetName: normalizedAssetName,
          quantity: 0,
          totalCost: 0, // Toplam maliyet
        };
      }

      // İşlemin para birimini TRY'ye çevir
      const transactionCurrency = transaction.currency || 'TRY';
      const exchangeRate = EXCHANGE_RATES[transactionCurrency] || 1;
      const priceInTRY = transaction.unitPrice * exchangeRate;

      if (transaction.type === 'buy') {
        // Alış: miktar artır, maliyeti topla (TRY cinsinden)
        assetPositions[key].quantity += transaction.quantity;
        assetPositions[key].totalCost += transaction.quantity * priceInTRY;
        console.log(`  ✅ BUY: quantity=${assetPositions[key].quantity}, totalCost=${assetPositions[key].totalCost} (${transactionCurrency} → TRY)`);
      } else {
        // Satış: FIFO (First In First Out) mantığı
        // Ortalama maliyet = toplam maliyet / toplam miktar
        const avgCost = assetPositions[key].quantity > 0 
          ? assetPositions[key].totalCost / assetPositions[key].quantity 
          : 0;
        
        assetPositions[key].quantity -= transaction.quantity;
        assetPositions[key].totalCost -= transaction.quantity * avgCost;
        console.log(`  ✅ SELL: avgCost=${avgCost}, quantity=${assetPositions[key].quantity}, totalCost=${assetPositions[key].totalCost}`);
      }
    });

    // Debug: Pozisyonları logla
    console.log('💼 Asset Positions:', assetPositions);

    // Her varlığın değerini kategori bazında topla
    Object.values(assetPositions).forEach(position => {
      if (position.quantity > 0 && position.totalCost > 0) {
        totals[position.mainCategory] += position.totalCost;
      }
    });

    // Overall = tüm kategorilerin toplamı
    totals.overall = totals['Altın'] + totals['Kripto'] + totals['Borsa'] + totals['Döviz'];

    console.log('💰 Calculated Totals:', totals);
    return totals;
  };

  /**
   * Kategori bazlı varlıkları grupla
   * @returns {Object} Kategori > Varlık > İşlemler
   */
  const getGroupedAssets = () => {
    const grouped = {};

    transactions.forEach(transaction => {
      const { mainCategory, subCategory, assetName } = transaction;

      if (!grouped[mainCategory]) {
        grouped[mainCategory] = {};
      }
      if (!grouped[mainCategory][subCategory]) {
        grouped[mainCategory][subCategory] = {};
      }
      if (!grouped[mainCategory][subCategory][assetName]) {
        grouped[mainCategory][subCategory][assetName] = [];
      }

      grouped[mainCategory][subCategory][assetName].push(transaction);
    });

    return grouped;
  };

  // Context value
  const value = {
    // Portfolio State
    portfolios,
    activePortfolioId,
    activePortfolio,
    
    // Legacy State (compatibility)
    transactions,
    categories,
    displayCurrency,
    loading,

    // Portfolio Actions
    createPortfolio,
    deletePortfolio,
    renamePortfolio,
    setActivePortfolioId,

    // Transaction Actions
    addTransaction,
    deleteTransaction,
    
    // Other Actions
    addCategory,
    setDisplayCurrency,
    clearAllData, // DEBUG fonksiyonu

    // Computed
    totalValue: calculateTotalValue(),
    groupedAssets: getGroupedAssets(),
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

// Custom Hook - Context'i kullanmak için
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  
  return context;
}

export default PortfolioContext;
