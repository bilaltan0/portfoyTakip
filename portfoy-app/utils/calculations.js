/**
 * calculations.js - Portföy Hesaplama Fonksiyonları
 * 
 * Bu dosya tüm finansal hesaplamaları içerir.
 * Context'ten ayrı tutularak test edilebilirlik arttırılmıştır.
 */

import { EXCHANGE_RATES } from '../constants/theme';

/**
 * İşlemleri analiz ederek portföy toplamlarını hesaplar
 * 
 * @param {Array} transactions - İşlem listesi
 * @returns {Object} { totals, assetPositions }
 */
export const calculatePortfolioTotals = (transactions) => {
  console.log('📋 Total Transactions:', transactions.length);

  const totals = {
    Altın: 0,
    Kripto: 0,
    Borsa: 0,
    Döviz: 0,
    overall: 0,
  };

  const assetPositions = {};

  transactions.forEach((transaction, index) => {
    const key = `${transaction.mainCategory}_${transaction.assetName}`;
    console.log(`🔍 [${index + 1}] ${transaction.type.toUpperCase()} | ${transaction.assetName} | Qty: ${transaction.quantity} | Key: ${key}`);

    if (!assetPositions[key]) {
      assetPositions[key] = {
        assetName: transaction.assetName,
        mainCategory: transaction.mainCategory,
        quantity: 0,
        totalCost: 0,
      };
    }

    // Para birimini TRY'ye çevir
    const exchangeRate = EXCHANGE_RATES[transaction.currency] || 1;
    const costInTRY = transaction.unitPrice * exchangeRate;

    if (transaction.type === 'buy') {
      assetPositions[key].quantity += transaction.quantity;
      assetPositions[key].totalCost += costInTRY * transaction.quantity;
      console.log(`   ✅ BUY: quantity=${assetPositions[key].quantity}, totalCost=${assetPositions[key].totalCost} (${transaction.currency} → TRY)`);
    } else if (transaction.type === 'sell') {
      const avgCost = assetPositions[key].quantity > 0 
        ? assetPositions[key].totalCost / assetPositions[key].quantity 
        : 0;
      
      assetPositions[key].quantity -= transaction.quantity;
      assetPositions[key].totalCost = avgCost * assetPositions[key].quantity;
      console.log(`   ✅ SELL: avgCost=${avgCost}, quantity=${assetPositions[key].quantity}, totalCost=${assetPositions[key].totalCost}`);
    }
  });

  console.log('💼 Asset Positions:', assetPositions);

  // Toplamları hesapla (sadece pozitif miktarlı varlıklar)
  Object.values(assetPositions).forEach((asset) => {
    if (asset.quantity > 0) {
      totals[asset.mainCategory] += asset.totalCost;
      totals.overall += asset.totalCost;
    }
  });

  console.log('💰 Calculated Totals:', totals);

  return { totals, assetPositions };
};

/**
 * Portföy dağılımını yüzde olarak hesaplar
 * 
 * @param {Object} totals - calculatePortfolioTotals'dan gelen totals
 * @returns {Array} Yüzdelik dağılım array'i
 */
export const calculateDistribution = (totals) => {
  if (!totals || totals.overall === 0) {
    return [];
  }

  const categories = ['Altın', 'Kripto', 'Borsa', 'Döviz'];
  
  return categories
    .map((category) => ({
      category,
      value: totals[category],
      percentage: (totals[category] / totals.overall) * 100,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Kar/Zarar hesaplama (gelecekte API fiyatları ile)
 * 
 * @param {Object} assetPosition - Varlık pozisyonu
 * @param {number} currentPrice - Güncel fiyat
 * @returns {Object} { profit, profitPercentage }
 */
export const calculateProfitLoss = (assetPosition, currentPrice) => {
  if (!assetPosition || assetPosition.quantity === 0) {
    return { profit: 0, profitPercentage: 0 };
  }

  const avgCost = assetPosition.totalCost / assetPosition.quantity;
  const currentValue = currentPrice * assetPosition.quantity;
  const profit = currentValue - assetPosition.totalCost;
  const profitPercentage = (profit / assetPosition.totalCost) * 100;

  return {
    profit,
    profitPercentage,
    currentValue,
    avgCost,
  };
};

/**
 * Para birimi dönüşümü
 * 
 * @param {number} amount - Miktar
 * @param {string} fromCurrency - Kaynak para birimi
 * @param {string} toCurrency - Hedef para birimi
 * @returns {number} Dönüştürülmüş miktar
 */
export const convertCurrency = (amount, fromCurrency, toCurrency = 'TRY') => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  // Önce TRY'ye çevir, sonra hedef para birimine
  const amountInTRY = amount * fromRate;
  return amountInTRY / toRate;
};
