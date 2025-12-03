/**
 * periodCalculations.js - Period Bazlı Hesaplamalar
 * 
 * Toplam maliyet vs güncel değer karşılaştırması
 */

/**
 * Basit kar/zarar hesaplama: Toplam Maliyet vs Güncel Değer
 * @param {Array} transactions - Tüm işlemler
 * @param {Object} currentPrices - Güncel fiyatlar { assetName: { price, currency } }
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {Object} { totalCost, currentValue, profitLoss, profitLossPercentage }
 */
export const calculatePeriodProfitLoss = (
  transactions,
  currentPrices,
  period = 'ALL',
  exchangeRates = { USD: 34, EUR: 37, TRY: 1 }
) => {
  // Şimdilik period parametresini kullanmıyoruz - gelecekte eklenebilir
  // Tüm işlemler için toplam maliyet vs güncel değer
  
  // 1. Tüm varlıkları topla ve toplam maliyeti hesapla
  const assets = {};
  
  transactions.forEach(tx => {
    const key = `${tx.mainCategory}_${tx.assetName}`;
    if (!assets[key]) {
      assets[key] = {
        assetName: tx.assetName,
        quantity: 0,
        totalCost: 0 // TRY cinsinden
      };
    }
    
    const multiplier = tx.type === 'buy' ? 1 : -1;
    const txCurrency = tx.currency || 'TRY';
    const exchangeRate = exchangeRates[txCurrency] || 1;
    
    // Maliyeti TRY'ye çevir
    const costInTRY = tx.quantity * tx.unitPrice * exchangeRate;
    
    assets[key].quantity += tx.quantity * multiplier;
    assets[key].totalCost += costInTRY * multiplier;
  });

  // 2. Toplam maliyet ve güncel değeri hesapla
  let totalCost = 0;
  let currentValue = 0;

  Object.entries(assets).forEach(([key, asset]) => {
    if (asset.quantity > 0) {
      // Toplam maliyet
      totalCost += asset.totalCost;

      // Güncel değer
      const priceData = currentPrices[asset.assetName];
      
      if (priceData && priceData.price > 0) {
        // Anlık fiyat var, kullan
        const priceCurrency = priceData.currency || 'TRY';
        const priceExchangeRate = exchangeRates[priceCurrency] || 1;
        const currentPriceInTRY = priceData.price * priceExchangeRate;
        currentValue += asset.quantity * currentPriceInTRY;
      } else {
        // Anlık fiyat yok, maliyet fiyatını kullan
        currentValue += asset.totalCost;
      }
    }
  });

  // 3. Kar/zarar hesapla
  const profitLoss = currentValue - totalCost;
  const profitLossPercentage = totalCost > 0 
    ? (profitLoss / totalCost) * 100 
    : 0;

  return {
    totalCost,
    currentValue,
    profitLoss,
    profitLossPercentage
  };
};

/**
 * Tüm period'lar için hesaplama yap
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
