/**
 * API Mapping - Varlık API Eşleştirme Sistemi
 * 
 * Her varlık için hangi API'den fiyat çekileceğini belirler.
 * 
 * Provider'lar:
 * - coingecko: Kripto paralar için
 * - yahoo: Hisse senetleri için
 * - metals: Altın/gümüş gibi değerli metaller için
 * - tcmb: Türkiye Cumhuriyet Merkez Bankası (döviz kurları)
 */

export const ASSET_API_MAPPING = {
  // ========== KRİPTO PARALAR ==========
  'Bitcoin (BTC)': {
    symbol: 'BTC',
    provider: 'coingecko',
    id: 'bitcoin',
    currency: 'USD',
    category: 'Kripto'
  },
  'Ethereum (ETH)': {
    symbol: 'ETH',
    provider: 'coingecko',
    id: 'ethereum',
    currency: 'USD',
    category: 'Kripto'
  },
  'Ripple (XRP)': {
    symbol: 'XRP',
    provider: 'coingecko',
    id: 'ripple',
    currency: 'USD',
    category: 'Kripto'
  },
  'Cardano (ADA)': {
    symbol: 'ADA',
    provider: 'coingecko',
    id: 'cardano',
    currency: 'USD',
    category: 'Kripto'
  },
  'Solana (SOL)': {
    symbol: 'SOL',
    provider: 'coingecko',
    id: 'solana',
    currency: 'USD',
    category: 'Kripto'
  },
  'Polkadot (DOT)': {
    symbol: 'DOT',
    provider: 'coingecko',
    id: 'polkadot',
    currency: 'USD',
    category: 'Kripto'
  },
  'Dogecoin (DOGE)': {
    symbol: 'DOGE',
    provider: 'coingecko',
    id: 'dogecoin',
    currency: 'USD',
    category: 'Kripto'
  },
  'Avalanche (AVAX)': {
    symbol: 'AVAX',
    provider: 'coingecko',
    id: 'avalanche-2',
    currency: 'USD',
    category: 'Kripto'
  },

  // ========== HİSSE SENETLERİ (BIST) ==========
  'AKBNK (Akbank)': {
    symbol: 'AKBNK.IS',
    provider: 'yahoo',
    id: 'AKBNK.IS',
    currency: 'TRY',
    category: 'Borsa'
  },
  'THYAO (Türk Hava Yolları)': {
    symbol: 'THYAO.IS',
    provider: 'yahoo',
    id: 'THYAO.IS',
    currency: 'TRY',
    category: 'Borsa'
  },
  'BIST 100': {
    symbol: 'XU100.IS',
    provider: 'yahoo',
    id: 'XU100.IS',
    currency: 'TRY',
    category: 'Borsa'
  },
  'GARAN (Garanti Bankası)': {
    symbol: 'GARAN.IS',
    provider: 'yahoo',
    id: 'GARAN.IS',
    currency: 'TRY',
    category: 'Borsa'
  },
  'EREGL (Ereğli Demir Çelik)': {
    symbol: 'EREGL.IS',
    provider: 'yahoo',
    id: 'EREGL.IS',
    currency: 'TRY',
    category: 'Borsa'
  },
  'TUPRS (Tüpraş)': {
    symbol: 'TUPRS.IS',
    provider: 'yahoo',
    id: 'TUPRS.IS',
    currency: 'TRY',
    category: 'Borsa'
  },

  // ========== ALTIN ==========
  'Gram Altın': {
    symbol: 'XAU',
    provider: 'metals',
    id: 'gold',
    currency: 'TRY', // Gram altın TL cinsinden
    category: 'Altın'
  },
  'Çeyrek Altın': {
    symbol: 'XAU',
    provider: 'metals',
    id: 'gold-quarter',
    currency: 'TRY',
    category: 'Altın'
  },
  'Cumhuriyet Altın': {
    symbol: 'XAU',
    provider: 'metals',
    id: 'gold-republic',
    currency: 'TRY',
    category: 'Altın'
  },

  // ========== DÖVİZ ==========
  'Dolar (USD)': {
    symbol: 'USD',
    provider: 'tcmb',
    id: 'USD',
    currency: 'TRY', // TL karşısında
    category: 'Döviz'
  },
  'Euro (EUR)': {
    symbol: 'EUR',
    provider: 'tcmb',
    id: 'EUR',
    currency: 'TRY',
    category: 'Döviz'
  },
  'Sterlin (GBP)': {
    symbol: 'GBP',
    provider: 'tcmb',
    id: 'GBP',
    currency: 'TRY',
    category: 'Döviz'
  },
};

/**
 * Varlık adından API mapping bilgisini döndürür
 * @param {string} assetName - "Bitcoin (BTC)" gibi tam varlık adı
 * @returns {object|null} API mapping objesi veya null
 */
export const getAssetMapping = (assetName) => {
  return ASSET_API_MAPPING[assetName] || null;
};

/**
 * Bir kategori için tüm varlıkları döndürür
 * @param {string} category - "Kripto", "Borsa", "Altın", "Döviz"
 * @returns {Array} O kategorideki varlıkların mapping'leri
 */
export const getAssetsByCategory = (category) => {
  return Object.entries(ASSET_API_MAPPING)
    .filter(([_, mapping]) => mapping.category === category)
    .map(([name, mapping]) => ({ name, ...mapping }));
};

/**
 * Provider'a göre varlıkları gruplar
 * @returns {object} Provider'a göre gruplandırılmış varlıklar
 */
export const getAssetsByProvider = () => {
  const grouped = {};
  
  Object.entries(ASSET_API_MAPPING).forEach(([name, mapping]) => {
    if (!grouped[mapping.provider]) {
      grouped[mapping.provider] = [];
    }
    grouped[mapping.provider].push({ name, ...mapping });
  });
  
  return grouped;
};
