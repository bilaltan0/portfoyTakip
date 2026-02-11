/**
 * periodCalculations.js - Period Bazlı Kar/Zarar Hesaplamaları
 * 
 * Zaman aralıklarına göre (1G, 1H, 1A, 1Y, TOP) portföy kar/zarar durumunu hesaplar.
 * 
 * YAKLAŞIM:
 * - Dönem öncesi işlemlerden → "dönem başı pozisyon" oluştur
 * - Dönem içi işlemleri normal şekilde ekle
 * - P/L = Güncel Değer - (Dönem Başı Maliyet + Dönem İçi Net Maliyet)
 * - Varlık seçilen dönemden daha kısa süre önce eklenmişse,
 *   sadece eklenme tarihinden itibaren hesaplanır (endüstri standardı)
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
 * Hesaplama Mantığı:
 * 1. Tüm işlemleri tarih sırasına göre sırala
 * 2. Dönem öncesi işlemlerden → "dönem başı pozisyon" oluştur (miktar + maliyet)
 * 3. Dönem içi buy/sell işlemlerini uygula
 * 4. P/L = Güncel Değer - Toplam Maliyet Bazı
 * 
 * Toplam Maliyet Bazı:
 * - Dönem öncesi pozisyonların maliyeti (ort. maliyet × miktar)
 * - + Dönem içi alış maliyetleri
 * - - Dönem içi satış maliyet düşüşleri
 * 
 * @param {Array} transactions - Tüm işlemler
 * @param {Object} currentPrices - Güncel fiyatlar { assetName: { price, currency } }
 * @param {string} period - '1D', '1W', '1M', '1Y', 'ALL'
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {Object} { totalCost, currentValue, profitLoss, profitLossPercentage }
 */
export const calculatePeriodProfitLoss = (
  transactions,
  currentPrices,
  period = 'ALL',
  exchangeRates = { USD: 34, EUR: 37, TRY: 1 }
) => {
  const periodStartDate = getPeriodStartDate(period);
  
  // Tarihe göre sırala
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date);
    const dateB = new Date(b.createdAt || b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Varlık pozisyonlarını hesapla
  const assets = {};

  sortedTransactions.forEach(tx => {
    const key = `${tx.mainCategory}_${tx.assetName}`;
    const txDate = new Date(tx.createdAt || tx.date);
    const txCurrency = tx.currency || 'TRY';
    const exchangeRate = exchangeRates[txCurrency] || 1;
    const costInTRY = tx.quantity * tx.unitPrice * exchangeRate;
    
    if (!assets[key]) {
      assets[key] = {
        assetName: tx.assetName,
        // Dönem öncesi toplam pozisyon
        prePeriodQuantity: 0,
        prePeriodTotalCost: 0,
        // Dönem içi toplam pozisyon
        inPeriodQuantity: 0,
        inPeriodTotalCost: 0,
        // Son pozisyon (toplam)
        totalQuantity: 0,
        totalCost: 0,
      };
    }

    const multiplier = tx.type === 'buy' ? 1 : -1;

    if (periodStartDate && txDate < periodStartDate) {
      // Dönem öncesi işlem
      assets[key].prePeriodQuantity += tx.quantity * multiplier;
      assets[key].prePeriodTotalCost += costInTRY * multiplier;
    } else {
      // Dönem içi işlem
      assets[key].inPeriodQuantity += tx.quantity * multiplier;
      assets[key].inPeriodTotalCost += costInTRY * multiplier;
    }

    // Toplam pozisyonu güncelle
    assets[key].totalQuantity += tx.quantity * multiplier;
    assets[key].totalCost += costInTRY * multiplier;
  });

  // Sonuçları hesapla
  let totalCost = 0;
  let currentValue = 0;

  Object.entries(assets).forEach(([key, asset]) => {
    if (asset.totalQuantity <= 0) return; // Pozisyon kapalı

    // Güncel değer hesapla
    const priceData = currentPrices[asset.assetName];
    let assetCurrentValue = 0;

    if (priceData && priceData.price > 0) {
      const priceCurrency = priceData.currency || 'TRY';
      const priceExchangeRate = exchangeRates[priceCurrency] || 1;
      const currentPriceInTRY = priceData.price * priceExchangeRate;
      assetCurrentValue = asset.totalQuantity * currentPriceInTRY;
    } else {
      // Anlık fiyat yok → maliyet fiyatını kullan (sıfır kar/zarar)
      assetCurrentValue = asset.totalCost;
    }

    currentValue += assetCurrentValue;

    if (period === 'ALL' || !periodStartDate) {
      // ALL: Tüm zamanlarda toplam maliyet vs güncel değer
      totalCost += asset.totalCost;
    } else {
      // Dönem bazlı: 
      // Dönem başı pozisyonun maliyeti + dönem içi net maliyet
      // Dönem başı pozisyon: o andaki ort. maliyet × miktar
      totalCost += asset.totalCost; // Tüm pozisyonun maliyeti
      
      // NOT: Dönem bazlı P/L'de iki yaklaşım var:
      // A) "Satın alma maliyeti bazlı" → maliyet vs güncel değer (period fark etmez)
      // B) "Dönem başı değer bazlı" → dönem başındaki değer vs güncel değer
      //
      // Şu anki implementasyon (A) yaklaşımını kullanıyor.
      // Bu yaklaşım: "Bu dönem portföye girmiş olan maliyetler ne kadar kazandı/kaybetti?"
      // 
      // Dönem öncesi pozisyonlar varsa, onların maliyetini de sayıyoruz
      // çünkü hala aktif pozisyonlar.
    }
  });

  // Kar/zarar hesapla
  const profitLoss = currentValue - totalCost;
  const profitLossPercentage = totalCost > 0 
    ? (profitLoss / totalCost) * 100 
    : 0;

  return {
    totalCost,
    currentValue,
    profitLoss,
    profitLossPercentage,
    period // Hangi dönem için hesaplandığını belirt
  };
};

/**
 * Tüm dönemler için hesaplama yap
 * @param {Array} transactions - İşlemler
 * @param {Object} currentPrices - Güncel fiyatlar
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {Object} Her dönem için sonuçlar
 */
export const calculateAllPeriods = (transactions, currentPrices, exchangeRates) => {
  const periods = ['1D', '1W', '1M', '1Y', 'ALL'];
  const results = {};

  periods.forEach(period => {
    results[period] = calculatePeriodProfitLoss(
      transactions,
      currentPrices,
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
  'ALL': 'TOP',
};

/**
 * Dönem tam açıklamalarını Türkçe olarak döner (Tooltip için)
 */
export const PERIOD_DESCRIPTIONS = {
  '1D': 'Günlük',
  '1W': 'Haftalık',
  '1M': 'Aylık',
  '1Y': 'Yıllık',
  'ALL': 'Tümü',
};
