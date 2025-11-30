/**
 * usePortfolioCalculations.js - Portföy Hesaplama Hook'u
 * 
 * Portföy dağılımı ve detay hesaplamalarını yapan custom hook
 */

import { useMemo } from 'react';
import { convertCurrency } from '../utils/currencyUtils';
import { getCategoryColor, generateColorForAsset } from '../utils/colorUtils';
import { getQuantityLabel, getShortAssetName } from '../utils/assetUtils';

export const usePortfolioCalculations = (transactions, displayCurrency = 'TRY') => {
  // Portfolio dağılımını hesapla
  const portfolioDistribution = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Kategorilere göre grupla
    const categoryTotals = {};
    
    transactions.forEach((tx) => {
      const category = tx.mainCategory;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      
      // İşlem tipine göre ekle veya çıkar
      const multiplier = tx.type === 'buy' ? 1 : -1;
      const txValue = tx.quantity * tx.unitPrice;
      const valueInDisplayCurrency = convertCurrency(txValue, tx.currency || 'TRY', displayCurrency);
      
      categoryTotals[category] += valueInDisplayCurrency * multiplier;
    });
    
    // Toplam değeri hesapla
    const totalValue = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    if (totalValue === 0) return [];
    
    // Array'e çevir ve yüzdeleri hesapla
    const distribution = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: convertCurrency(value, displayCurrency, displayCurrency),
        percentage: Math.round((value / totalValue) * 100),
        exactPercentage: (value / totalValue) * 100,
        color: getCategoryColor(name),
      }));
    
    // Yüzde toplamının 100 olmasını garantile (son öğeyi ayarla)
    if (distribution.length > 0) {
      const totalPercentage = distribution.slice(0, -1).reduce((sum, item) => sum + item.percentage, 0);
      distribution[distribution.length - 1].percentage = 100 - totalPercentage;
    }
    
    return distribution;
  }, [transactions, displayCurrency]);
  
  // Toplam portföy değerini hesapla
  const totalPortfolioValue = useMemo(() => {
    return portfolioDistribution.reduce((sum, item) => sum + item.value, 0);
  }, [portfolioDistribution]);
  
  // Kategori detayını hesapla
  const getCategoryDetail = (categoryName) => {
    if (!transactions || !categoryName) return [];
    
    // Bu kategorideki tüm varlıkları topla
    const categoryAssets = {};
    
    transactions
      .filter(tx => tx.mainCategory === categoryName)
      .forEach((tx) => {
        const assetKey = tx.assetName;
        
        if (!categoryAssets[assetKey]) {
          categoryAssets[assetKey] = {
            totalValue: 0,
            totalQuantity: 0,
            transactions: [],
          };
        }
        
        // Alış/satış işlemlerini hesaba kat
        const multiplier = tx.type === 'buy' ? 1 : -1;
        const txValue = tx.quantity * tx.unitPrice;
        const valueInDisplayCurrency = convertCurrency(txValue, tx.currency || 'TRY', displayCurrency);
        
        categoryAssets[assetKey].totalValue += valueInDisplayCurrency * multiplier;
        categoryAssets[assetKey].totalQuantity += tx.quantity * multiplier;
        categoryAssets[assetKey].transactions.push(tx);
      });
    
    // Array'e çevir ve pozitif değerleri filtrele
    const assetArray = Object.entries(categoryAssets)
      .filter(([_, data]) => data.totalValue > 0)
      .map(([name, data]) => {
        // Ortalama alış fiyatı hesapla (sadece buy işlemlerinden)
        const buyTransactions = data.transactions.filter(tx => tx.type === 'buy');
        const totalBuyValue = buyTransactions.reduce((sum, tx) => {
          const txValue = tx.quantity * tx.unitPrice;
          return sum + convertCurrency(txValue, tx.currency || 'TRY', displayCurrency);
        }, 0);
        const totalBuyQuantity = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
        const avgPrice = totalBuyQuantity > 0 ? totalBuyValue / totalBuyQuantity : 0;
        
        return {
          name: getShortAssetName(name),
          fullName: name,
          value: convertCurrency(data.totalValue, displayCurrency, displayCurrency),
          quantity: data.totalQuantity,
          avgPrice: convertCurrency(avgPrice, displayCurrency, displayCurrency),
          color: generateColorForAsset(name),
          quantityLabel: getQuantityLabel(name, categoryName),
        };
      });
    
    // Toplam değere göre büyükten küçüğe sırala
    assetArray.sort((a, b) => b.value - a.value);
    
    // Toplam değer
    const categoryTotal = assetArray.reduce((sum, item) => sum + item.value, 0);
    
    // Yüzdeleri hesapla
    const result = assetArray.map((item, index, arr) => {
      if (index === arr.length - 1) {
        const othersTotal = arr.slice(0, -1).reduce((sum, i) => 
          sum + Math.round((i.value / categoryTotal) * 100), 0
        );
        return {
          ...item,
          percentage: 100 - othersTotal,
          exactPercentage: (item.value / categoryTotal) * 100,
        };
      }
      return {
        ...item,
        percentage: Math.round((item.value / categoryTotal) * 100),
        exactPercentage: (item.value / categoryTotal) * 100,
      };
    });
    
    return result;
  };
  
  return {
    portfolioDistribution,
    totalPortfolioValue,
    getCategoryDetail,
  };
};
