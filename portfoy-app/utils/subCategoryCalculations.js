/**
 * subCategoryCalculations.js - Alt Kategori Hesaplama Motoru
 * 
 * Phase 2: Calculation Engine
 * 
 * Bu dosya alt kategoriler için tüm finansal hesaplamaları içerir:
 * - Gerçek değer ve yüzde hesaplama
 * - Hedef vs gerçek karşılaştırma
 * - Rebalancing önerileri
 * - Kategorisiz varlık tespiti
 */

import { convertCurrency } from './currencyUtils';

/**
 * Bir varlığın hangi alt kategoriye ait olduğunu bulur
 * 
 * @param {string} assetName - Varlık adı
 * @param {Array} subCategories - Alt kategori listesi
 * @param {Object} assetMapping - Asset → SubCategory mapping
 * @returns {Object|null} SubCategory objesi veya null
 */
export const matchAssetToSubCategory = (assetName, subCategories, assetMapping) => {
  if (!assetName || !assetMapping) return null;
  
  const subCategoryId = assetMapping[assetName];
  if (!subCategoryId) return null;
  
  return subCategories.find(sc => sc.id === subCategoryId) || null;
};

/**
 * Kategorisiz varlıkları tespit eder
 * 
 * @param {Array} allAssets - Tüm varlık isimleri [{assetName, mainCategory, value}]
 * @param {Object} assetMapping - Asset → SubCategory mapping
 * @returns {Array} Kategorisiz varlık listesi
 */
export const getUncategorizedAssets = (allAssets, assetMapping = {}) => {
  if (!allAssets || allAssets.length === 0) return [];
  
  return allAssets.filter(asset => !assetMapping[asset.assetName]);
};

/**
 * Belirli bir ana kategori için toplam değeri hesaplar
 * 
 * @param {string} mainCategory - Ana kategori ('Altın', 'Borsa', etc.)
 * @param {Array} assetPositions - Varlık pozisyonları
 * @param {Object} prices - Güncel fiyatlar
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {number} Toplam değer (TRY)
 */
export const calculateCategoryTotal = (mainCategory, assetPositions, prices, exchangeRates) => {
  if (!assetPositions || assetPositions.length === 0) return 0;
  
  const categoryAssets = assetPositions.filter(asset => asset.mainCategory === mainCategory);
  
  let total = 0;
  categoryAssets.forEach(asset => {
    const priceData = prices[asset.assetName];
    if (!priceData || asset.quantity <= 0) return;
    
    const price = priceData.price || 0;
    const currency = priceData.currency || 'TRY';
    
    // Varlık değerini hesapla
    const assetValue = asset.quantity * price;
    
    // TRY'ye çevir
    const valueInTRY = convertCurrency(assetValue, currency, 'TRY', exchangeRates);
    total += valueInTRY;
  });
  
  return total;
};

/**
 * Alt kategori için gerçek değer ve yüzdeyi hesaplar
 * 
 * @param {Object} subCategory - Alt kategori
 * @param {Array} assetPositions - Varlık pozisyonları
 * @param {Object} prices - Güncel fiyatlar
 * @param {Object} exchangeRates - Döviz kurları
 * @param {number} categoryTotal - Ana kategorinin toplam değeri
 * @returns {Object} { actualValue, actualPercentage, status }
 */
export const calculateSubCategoryActual = (
  subCategory, 
  assetPositions, 
  prices, 
  exchangeRates,
  categoryTotal
) => {
  if (!subCategory || !assetPositions || categoryTotal === 0) {
    return {
      actualValue: 0,
      actualPercentage: 0,
      status: 'empty'
    };
  }
  
  // Bu alt kategoriye ait varlıkları bul
  const subCategoryAssets = assetPositions.filter(asset => 
    subCategory.assets && subCategory.assets.includes(asset.assetName)
  );
  
  // Toplam değeri hesapla
  let totalValue = 0;
  subCategoryAssets.forEach(asset => {
    const priceData = prices[asset.assetName];
    if (!priceData || asset.quantity <= 0) return;
    
    const price = priceData.price || 0;
    const currency = priceData.currency || 'TRY';
    
    const assetValue = asset.quantity * price;
    const valueInTRY = convertCurrency(assetValue, currency, 'TRY', exchangeRates);
    totalValue += valueInTRY;
  });
  
  // Ana kategori içindeki yüzdeyi hesapla
  const actualPercentage = categoryTotal > 0 ? (totalValue / categoryTotal) * 100 : 0;
  
  // Status belirle
  let status = 'on-track';
  const targetPercentage = subCategory.targetPercentage || 0;
  const diff = Math.abs(actualPercentage - targetPercentage);
  
  if (totalValue === 0) {
    status = 'empty';
  } else if (actualPercentage > targetPercentage + 5) {
    status = 'overweight'; // %5'ten fazla üzerinde
  } else if (actualPercentage < targetPercentage - 5) {
    status = 'underweight'; // %5'ten fazla altında
  }
  
  return {
    actualValue: totalValue,
    actualPercentage,
    status,
    difference: actualPercentage - targetPercentage,
    assets: subCategoryAssets.map(a => ({
      name: a.assetName,
      quantity: a.quantity,
      value: prices[a.assetName] ? a.quantity * prices[a.assetName].price : 0
    }))
  };
};

/**
 * Tüm alt kategoriler için allocation hesaplar
 * 
 * @param {Array} subCategories - Alt kategori listesi
 * @param {Array} assetPositions - Varlık pozisyonları
 * @param {Object} prices - Güncel fiyatlar
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {Object} Ana kategorilere göre gruplandırılmış allocations
 */
export const calculateAllSubCategoryAllocations = (
  subCategories,
  assetPositions,
  prices,
  exchangeRates = {}
) => {
  if (!subCategories || subCategories.length === 0) return {};
  
  // Ana kategorilere göre grupla
  const byMainCategory = {};
  
  // Önce her ana kategori için toplam değeri hesapla
  const categoryTotals = {};
  const mainCategories = ['Altın', 'Borsa', 'Kripto', 'Döviz'];
  
  mainCategories.forEach(category => {
    categoryTotals[category] = calculateCategoryTotal(
      category,
      assetPositions,
      prices,
      exchangeRates
    );
  });
  
  // Her alt kategori için hesapla
  subCategories.forEach(subCategory => {
    const parentCategory = subCategory.parentCategory;
    
    if (!byMainCategory[parentCategory]) {
      byMainCategory[parentCategory] = {
        total: categoryTotals[parentCategory] || 0,
        subCategories: []
      };
    }
    
    const categoryTotal = categoryTotals[parentCategory] || 0;
    const allocation = calculateSubCategoryActual(
      subCategory,
      assetPositions,
      prices,
      exchangeRates,
      categoryTotal
    );
    
    byMainCategory[parentCategory].subCategories.push({
      id: subCategory.id,
      name: subCategory.name,
      icon: subCategory.icon,
      color: subCategory.color,
      targetPercentage: subCategory.targetPercentage || 0,
      ...allocation
    });
  });
  
  return byMainCategory;
};

/**
 * Rebalancing önerileri üretir
 * 
 * @param {Object} allocations - calculateAllSubCategoryAllocations çıktısı
 * @param {number} totalPortfolioValue - Toplam portföy değeri
 * @returns {Array} Öneri listesi [{ action, subCategory, amount, reason }]
 */
export const getRebalancingSuggestions = (allocations, totalPortfolioValue = 0) => {
  if (!allocations || totalPortfolioValue === 0) return [];
  
  const suggestions = [];
  
  Object.entries(allocations).forEach(([mainCategory, data]) => {
    const { total: categoryTotal, subCategories } = data;
    
    if (categoryTotal === 0) return;
    
    // Sapmaları hesapla ve sırala (en büyük sapmadan küçüğe)
    const deviations = subCategories
      .map(sc => ({
        ...sc,
        deviation: sc.actualPercentage - sc.targetPercentage,
        deviationAmount: (sc.actualPercentage - sc.targetPercentage) / 100 * categoryTotal
      }))
      .filter(sc => Math.abs(sc.deviation) > 5) // %5'ten fazla sapma olanlar
      .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
    
    deviations.forEach(sc => {
      if (sc.deviation > 0) {
        // Overweight - sat
        suggestions.push({
          action: 'sell',
          mainCategory,
          subCategory: sc.name,
          subCategoryId: sc.id,
          icon: sc.icon,
          currentPercentage: sc.actualPercentage.toFixed(1),
          targetPercentage: sc.targetPercentage,
          difference: sc.deviation.toFixed(1),
          suggestedAmount: Math.abs(sc.deviationAmount),
          reason: `Hedefin %${Math.abs(sc.deviation).toFixed(1)} üzerinde`,
          priority: Math.abs(sc.deviation) > 15 ? 'high' : 'medium'
        });
      } else {
        // Underweight - al
        suggestions.push({
          action: 'buy',
          mainCategory,
          subCategory: sc.name,
          subCategoryId: sc.id,
          icon: sc.icon,
          currentPercentage: sc.actualPercentage.toFixed(1),
          targetPercentage: sc.targetPercentage,
          difference: Math.abs(sc.deviation).toFixed(1),
          suggestedAmount: Math.abs(sc.deviationAmount),
          reason: `Hedefin %${Math.abs(sc.deviation).toFixed(1)} altında`,
          priority: Math.abs(sc.deviation) > 15 ? 'high' : 'medium'
        });
      }
    });
  });
  
  // Önceliğe göre sırala (high → medium)
  return suggestions.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return 0;
  });
};

/**
 * Belirli bir ana kategori için detaylı breakdown üretir
 * 
 * @param {string} mainCategory - Ana kategori
 * @param {Array} subCategories - Alt kategori listesi
 * @param {Array} assetPositions - Varlık pozisyonları
 * @param {Object} prices - Güncel fiyatlar
 * @param {Object} exchangeRates - Döviz kurları
 * @returns {Object} Detaylı breakdown
 */
export const calculateCategoryBreakdown = (
  mainCategory,
  subCategories,
  assetPositions,
  prices,
  exchangeRates = {}
) => {
  // Bu kategoriye ait alt kategorileri filtrele
  const categorySubCategories = subCategories.filter(
    sc => sc.parentCategory === mainCategory
  );
  
  // Kategori toplamını hesapla
  const categoryTotal = calculateCategoryTotal(
    mainCategory,
    assetPositions,
    prices,
    exchangeRates
  );
  
  // Alt kategorileri hesapla
  const breakdown = categorySubCategories.map(sc => {
    const allocation = calculateSubCategoryActual(
      sc,
      assetPositions,
      prices,
      exchangeRates,
      categoryTotal
    );
    
    return {
      id: sc.id,
      name: sc.name,
      icon: sc.icon,
      color: sc.color,
      targetPercentage: sc.targetPercentage || 0,
      ...allocation
    };
  });
  
  // Kategorisiz varlıkları bul
  const assignedAssetNames = new Set();
  categorySubCategories.forEach(sc => {
    if (sc.assets) {
      sc.assets.forEach(asset => assignedAssetNames.add(asset));
    }
  });
  
  const uncategorizedAssets = assetPositions
    .filter(asset => 
      asset.mainCategory === mainCategory && 
      !assignedAssetNames.has(asset.assetName)
    )
    .map(asset => {
      const priceData = prices[asset.assetName];
      const price = priceData ? priceData.price : 0;
      const currency = priceData ? priceData.currency : 'TRY';
      const value = asset.quantity * price;
      const valueInTRY = convertCurrency(value, currency, 'TRY', exchangeRates);
      
      return {
        name: asset.assetName,
        quantity: asset.quantity,
        value: valueInTRY,
        percentage: categoryTotal > 0 ? (valueInTRY / categoryTotal) * 100 : 0
      };
    });
  
  const uncategorizedTotal = uncategorizedAssets.reduce((sum, a) => sum + a.value, 0);
  const uncategorizedPercentage = categoryTotal > 0 ? (uncategorizedTotal / categoryTotal) * 100 : 0;
  
  return {
    mainCategory,
    total: categoryTotal,
    subCategories: breakdown,
    uncategorized: {
      assets: uncategorizedAssets,
      total: uncategorizedTotal,
      percentage: uncategorizedPercentage
    },
    summary: {
      totalSubCategories: breakdown.length,
      totalAssignedValue: breakdown.reduce((sum, sc) => sum + sc.actualValue, 0),
      totalAssignedPercentage: breakdown.reduce((sum, sc) => sum + sc.actualPercentage, 0),
      uncategorizedValue: uncategorizedTotal,
      uncategorizedPercentage
    }
  };
};

/**
 * Tüm portföy için özet istatistikler
 * 
 * @param {Object} allocations - calculateAllSubCategoryAllocations çıktısı
 * @returns {Object} Özet istatistikler
 */
export const getPortfolioSubCategorySummary = (allocations) => {
  if (!allocations) return null;
  
  let totalSubCategories = 0;
  let onTrackCount = 0;
  let overweightCount = 0;
  let underweightCount = 0;
  let emptyCount = 0;
  
  Object.values(allocations).forEach(({ subCategories }) => {
    subCategories.forEach(sc => {
      totalSubCategories++;
      if (sc.status === 'on-track') onTrackCount++;
      else if (sc.status === 'overweight') overweightCount++;
      else if (sc.status === 'underweight') underweightCount++;
      else if (sc.status === 'empty') emptyCount++;
    });
  });
  
  return {
    total: totalSubCategories,
    onTrack: onTrackCount,
    overweight: overweightCount,
    underweight: underweightCount,
    empty: emptyCount,
    needsRebalancing: overweightCount + underweightCount,
    healthScore: totalSubCategories > 0 
      ? Math.round((onTrackCount / totalSubCategories) * 100) 
      : 0
  };
};

/**
 * Alt kategori hedef yüzdesi toplamını kontrol eder
 * 
 * @param {Array} subCategories - Kontrol edilecek alt kategoriler
 * @param {string} parentCategory - Ana kategori
 * @returns {Object} { total, isValid, message }
 */
export const validateTargetPercentages = (subCategories, parentCategory) => {
  const categorySubCategories = subCategories.filter(
    sc => sc.parentCategory === parentCategory
  );
  
  const total = categorySubCategories.reduce(
    (sum, sc) => sum + (sc.targetPercentage || 0), 
    0
  );
  
  const isValid = total <= 100;
  
  return {
    total,
    isValid,
    message: isValid 
      ? `Toplam: %${total.toFixed(1)}` 
      : `⚠️ Hedef toplamı %100'ü aşıyor: %${total.toFixed(1)}`
  };
};
