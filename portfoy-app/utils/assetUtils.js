/**
 * assetUtils.js - Varlık Yardımcı Fonksiyonları
 * 
 * Varlık miktar etiketleri ve formatlama
 */

/**
 * Varlık için miktar etiketi al
 * @param {string} assetName - Varlık adı
 * @param {string} categoryName - Kategori adı
 * @returns {string} - Miktar etiketi (Gram, Lot, BTC, vb.)
 */
export const getQuantityLabel = (assetName, categoryName) => {
  const lowerName = assetName.toLowerCase();
  
  if (categoryName === 'Altın') {
    if (lowerName.includes('gram')) return 'Gram';
    if (lowerName.includes('çeyrek')) return 'Adet (Çeyrek)';
    if (lowerName.includes('yarım')) return 'Adet (Yarım)';
    if (lowerName.includes('tam')) return 'Adet (Tam)';
    return 'Adet';
  }
  
  if (categoryName === 'Borsa') {
    return 'Lot';
  }
  
  if (categoryName === 'Kripto') {
    if (lowerName.includes('bitcoin') || lowerName.includes('btc')) return 'BTC';
    if (lowerName.includes('ethereum') || lowerName.includes('eth')) return 'ETH';
    return 'Coin';
  }
  
  if (categoryName === 'Döviz') {
    if (lowerName.includes('dolar') || lowerName.includes('usd')) return 'USD';
    if (lowerName.includes('euro') || lowerName.includes('eur')) return 'EUR';
    if (lowerName.includes('sterlin') || lowerName.includes('gbp')) return 'GBP';
    return 'Adet';
  }
  
  return 'Adet';
};

/**
 * Varlık adını kısalt (parantez içindeki kısmı temizle)
 * @param {string} fullName - Tam varlık adı
 * @returns {string} - Kısaltılmış ad
 */
export const getShortAssetName = (fullName) => {
  return fullName.includes('(') ? fullName.split('(')[0].trim() : fullName;
};
