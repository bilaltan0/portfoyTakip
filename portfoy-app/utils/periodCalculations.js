/**
 * periodCalculations.js - Period Bazlı Kar/Zarar Hesaplamaları
 * 
 * Zaman aralıklarına göre (1G, 1H, 1A, 1Y, TOP) portföy kar/zarar durumunu hesaplar.
 * 
 * YAKLAŞIM:
 * P/L = Güncel Portföy Değeri - Dönem Başındaki Portföy Değeri
 * 
 * Dönem başındaki değer:
 * - Dönem öncesinde tutulan varlıklar → tarihsel fiyat × miktar
 * - Dönem içinde alınan varlıklar → alış maliyeti
 * - Dönem içinde satılan varlıklar → satış geliri çıkarılır
 */

/**
 * Dönem başlangıç tarihini hesapla
 * @param {string} period - '1D', '1W', '1M', '1Y', 'ALL'
 * @returns {Date|null} Dönem başlangıç tarihi, ALL ise null
 */
export const getPeriodStartDate = (period) => {
  const now = new Date();
  
  switch (period) {
    case '1D':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '1M':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '1Y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'ALL':
    default:
      return null; // Filtreleme yok
  }
};

/**
 * Dönem bazlı kar/zarar hesaplama
 * 
 * ALL: P/L = Güncel Değer - Toplam Maliyet
 * Diğer: P/L = Güncel Değer - Dönem Başı Değer
 * 
 * Dönem Başı Değer = Σ(dönem öncesi varlık × tarihsel fiyat) + Σ(dönem içi alış maliyeti) - Σ(dönem içi satış geliri)
 * 
 * @param {Array} transactions - Tüm işlemler
 * @param {Object} currentPrices - Güncel fiyatlar { assetName: { price, currency } }
 * @param {Object} historicalPrices - Tarihsel fiyatlar { assetName: { price, currency } }
 * @param {string} period - '1D', '1W', '1M', '1Y', 'ALL'
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {Object} { totalCost, currentValue, profitLoss, profitLossPercentage, periodStartValue }
 */
export const calculatePeriodProfitLoss = (
  transactions,
  currentPrices,
  historicalPrices = {},
  period = 'ALL',
  exchangeRates = { USD: 34, EUR: 37, TRY: 1 }
) => {
  const periodStartDate = getPeriodStartDate(period);
  
  // ALL durumu: klasik maliyet bazlı hesaplama
  if (period === 'ALL' || !periodStartDate) {
    return calculateAllTimeProfitLoss(transactions, currentPrices, exchangeRates);
  }
  
  // Dönem bazlı hesaplama
  const assets = {};
  
  // Tarihe göre sırala
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date);
    const dateB = new Date(b.createdAt || b.date);
    return dateA.getTime() - dateB.getTime();
  });

  sortedTransactions.forEach(tx => {
    const key = `${tx.mainCategory}_${tx.assetName}`;
    const txDate = new Date(tx.createdAt || tx.date);
    const txCurrency = tx.currency || 'TRY';
    const exchangeRate = exchangeRates[txCurrency] || 1;
    const costInTRY = tx.quantity * tx.unitPrice * exchangeRate;
    
    if (!assets[key]) {
      assets[key] = {
        assetName: tx.assetName,
        mainCategory: tx.mainCategory,
        prePeriodQuantity: 0,
        prePeriodCost: 0,
        inPeriodBuyCost: 0,
        inPeriodSellRevenue: 0,
        totalQuantity: 0,
        totalCost: 0,
      };
    }

    const multiplier = tx.type === 'buy' ? 1 : -1;

    if (txDate < periodStartDate) {
      // Dönem öncesi işlem
      assets[key].prePeriodQuantity += tx.quantity * multiplier;
      assets[key].prePeriodCost += costInTRY * multiplier;
    } else {
      // Dönem içi işlem
      if (tx.type === 'buy') {
        assets[key].inPeriodBuyCost += costInTRY;
      } else {
        assets[key].inPeriodSellRevenue += costInTRY;
      }
    }

    assets[key].totalQuantity += tx.quantity * multiplier;
    assets[key].totalCost += costInTRY * multiplier;
  });

  // Dönem başı değer ve güncel değer hesapla
  let periodStartValue = 0;
  let currentValue = 0;

  Object.entries(assets).forEach(([key, asset]) => {
    // Güncel değer (sadece pozitif pozisyonlar)
    if (asset.totalQuantity > 0) {
      const priceData = currentPrices[asset.assetName];
      
      if (priceData && priceData.price > 0) {
        const priceCurrency = priceData.currency || 'TRY';
        const priceExchangeRate = exchangeRates[priceCurrency] || 1;
        const currentPriceInTRY = priceData.price * priceExchangeRate;
        currentValue += asset.totalQuantity * currentPriceInTRY;
      } else {
        currentValue += asset.totalCost;
      }
    }
    
    // Dönem başı değer hesapla
    if (asset.prePeriodQuantity > 0) {
      // Tarihsel fiyat var mı?
      const histPrice = historicalPrices[asset.assetName];
      
      if (histPrice && histPrice.price != null && histPrice.price > 0) {
        // Tarihsel fiyat ile dönem başı değer
        const histCurrency = histPrice.currency || 'TRY';
        const histExchangeRate = exchangeRates[histCurrency] || 1;
        const histPriceInTRY = histPrice.price * histExchangeRate;
        periodStartValue += asset.prePeriodQuantity * histPriceInTRY;
      } else {
        // Tarihsel fiyat yok → maliyet bazı kullan (fallback)
        periodStartValue += asset.prePeriodCost;
      }
    }
    
    // Dönem içi alışlar da başlangıç değerine eklenir
    periodStartValue += asset.inPeriodBuyCost;
    // Dönem içi satışlar başlangıç değerinden çıkarılır
    periodStartValue -= asset.inPeriodSellRevenue;
  });

  // P/L = Güncel Değer - Dönem Başı Değer
  const profitLoss = currentValue - periodStartValue;
  const profitLossPercentage = periodStartValue > 0 
    ? (profitLoss / periodStartValue) * 100 
    : 0;

  return {
    totalCost: periodStartValue,
    currentValue,
    profitLoss,
    profitLossPercentage,
    periodStartValue,
    period
  };
};

/**
 * ALL (Tüm Zamanlar) için basit maliyet bazlı hesaplama
 */
const calculateAllTimeProfitLoss = (transactions, currentPrices, exchangeRates) => {
  const assets = {};
  
  transactions.forEach(tx => {
    const key = `${tx.mainCategory}_${tx.assetName}`;
    if (!assets[key]) {
      assets[key] = { assetName: tx.assetName, quantity: 0, totalCost: 0 };
    }
    
    const multiplier = tx.type === 'buy' ? 1 : -1;
    const txCurrency = tx.currency || 'TRY';
    const exchangeRate = exchangeRates[txCurrency] || 1;
    const costInTRY = tx.quantity * tx.unitPrice * exchangeRate;
    
    assets[key].quantity += tx.quantity * multiplier;
    assets[key].totalCost += costInTRY * multiplier;
  });

  let totalCost = 0;
  let currentValue = 0;

  Object.entries(assets).forEach(([key, asset]) => {
    if (asset.quantity <= 0) return;

    totalCost += asset.totalCost;

    const priceData = currentPrices[asset.assetName];
    if (priceData && priceData.price > 0) {
      const priceCurrency = priceData.currency || 'TRY';
      const priceExchangeRate = exchangeRates[priceCurrency] || 1;
      currentValue += asset.quantity * priceData.price * priceExchangeRate;
    } else {
      currentValue += asset.totalCost;
    }
  });

  const profitLoss = currentValue - totalCost;
  const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  return {
    totalCost,
    currentValue,
    profitLoss,
    profitLossPercentage,
    periodStartValue: totalCost,
    period: 'ALL'
  };
};

/**
 * Tüm dönemler için hesaplama yap
 */
export const calculateAllPeriods = (transactions, currentPrices, historicalPricesMap, exchangeRates) => {
  const periods = ['1D', '1W', '1M', '1Y', 'ALL'];
  const results = {};

  periods.forEach(period => {
    const historicalPrices = historicalPricesMap?.[period] || {};
    results[period] = calculatePeriodProfitLoss(
      transactions,
      currentPrices,
      historicalPrices,
      period,
      exchangeRates
    );
  });

  return results;
};

/**
 * Dönem kısa etiketlerini Türkçe olarak döner (UI için)
 */
export const PERIOD_LABELS = {
  '1D': '1G',
  '1W': '1H',
  '1M': '1A',
  '1Y': '1Y',
  'ALL': 'ALL',
};

/**
 * Dönem tam açıklamalarını Türkçe olarak döner
 */
export const PERIOD_DESCRIPTIONS = {
  '1D': 'Günlük',
  '1W': 'Haftalık',
  '1M': 'Aylık',
  '1Y': 'Yıllık',
  'ALL': 'Tümü',
};
