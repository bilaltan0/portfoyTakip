/**
 * Price Service - Fiyat Çekme Servisi
 * 
 * Farklı API'lerden varlık fiyatlarını çeker ve cache'ler.
 * 
 * Kullanılan API'ler:
 * - CoinGecko: Kripto paralar (ücretsiz, rate limit: 10-50/dakika)
 * - Yahoo Finance: Hisse senetleri (ücretsiz)
 * - Metals-API veya Investing.com: Altın fiyatları
 * - TCMB: Döviz kurları
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAssetMapping } from '../constants/apiMapping';

// Cache yapılandırması
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
const CACHE_KEY_PREFIX = 'price_cache_';

// In-memory cache
const memoryCache = new Map();

/**
 * CoinGecko API'den kripto fiyatı çeker
 * @param {string} coinId - 'bitcoin', 'ethereum' gibi
 * @returns {Promise<number>} USD cinsinden fiyat
 */
const fetchCoinGeckoPrice = async (coinId) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,try`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      usd: data[coinId]?.usd || 0,
      try: data[coinId]?.try || 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    throw error;
  }
};

/**
 * Yahoo Finance API'den hisse fiyatı çeker
 * NOT: Yahoo Finance unofficial API kullanıyoruz
 * @param {string} symbol - 'AKBNK.IS', 'THYAO.IS' gibi
 * @returns {Promise<number>} TRY cinsinden fiyat
 */
const fetchYahooPrice = async (symbol) => {
  try {
    // Yahoo Finance v8 API endpoint
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const data = await response.json();
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
    
    return {
      try: price,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Yahoo Finance fetch error:', error);
    throw error;
  }
};

/**
 * TCMB API'den döviz kuru çeker
 * @param {string} currency - 'USD', 'EUR', 'GBP'
 * @returns {Promise<number>} TRY karşısında kur
 */
const fetchTCMBRate = async (currency) => {
  try {
    // TCMB Döviz Kurları XML API
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    const response = await fetch(
      `https://www.tcmb.gov.tr/kurlar/${year}${month}/${day}${month}${year}.xml`
    );
    
    if (!response.ok) {
      // Bugünkü veri yoksa dünün verisini al
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yDay = yesterday.getDate().toString().padStart(2, '0');
      const yMonth = (yesterday.getMonth() + 1).toString().padStart(2, '0');
      const yYear = yesterday.getFullYear();
      
      const retryResponse = await fetch(
        `https://www.tcmb.gov.tr/kurlar/${yYear}${yMonth}/${yDay}${yMonth}${yYear}.xml`
      );
      
      if (!retryResponse.ok) {
        throw new Error(`TCMB API error: ${retryResponse.status}`);
      }
      
      const xmlText = await retryResponse.text();
      return parseTCMBXML(xmlText, currency);
    }
    
    const xmlText = await response.text();
    return parseTCMBXML(xmlText, currency);
  } catch (error) {
    console.error('TCMB fetch error:', error);
    throw error;
  }
};

/**
 * TCMB XML'den döviz kurunu parse eder
 */
const parseTCMBXML = (xmlText, currency) => {
  // Basit XML parsing (production'da xml2js kullan)
  const regex = new RegExp(`<Currency.*?CurrencyCode="${currency}".*?<ForexSelling>(.*?)</ForexSelling>`, 's');
  const match = xmlText.match(regex);
  
  if (match && match[1]) {
    return {
      try: parseFloat(match[1]),
      timestamp: Date.now(),
    };
  }
  
  throw new Error(`Currency ${currency} not found in TCMB data`);
};

/**
 * Altın fiyatını çeker (şimdilik mock data)
 * TODO: Gerçek API entegre et (investing.com, goldapi.io)
 * @param {string} goldType - 'gold', 'gold-quarter', 'gold-republic'
 * @returns {Promise<number>} TRY cinsinden fiyat
 */
const fetchGoldPrice = async (goldType) => {
  try {
    // ŞİMDİLİK MOCK DATA - Gerçek API eklenecek
    // Gram altın yaklaşık fiyatı (2024-2025)
    const mockPrices = {
      'gold': 2850, // Gram altın TL
      'gold-quarter': 4700, // Çeyrek altın TL
      'gold-republic': 19000, // Cumhuriyet altını TL
    };
    
    return {
      try: mockPrices[goldType] || 0,
      timestamp: Date.now(),
      isMock: true, // Mock data olduğunu belirt
    };
  } catch (error) {
    console.error('Gold price fetch error:', error);
    throw error;
  }
};

/**
 * Varlık adından provider ve ID bilgisini çıkarır (dinamik)
 * @param {string} assetName - "Bitcoin (BTC)" veya "AKBNK (Akbank)" gibi
 * @returns {object} { provider, id, symbol, currency, category }
 */
const detectAssetProvider = (assetName) => {
  // Önce statik mapping'e bak
  const staticMapping = getAssetMapping(assetName);
  if (staticMapping) {
    return staticMapping;
  }
  
  // Parantez içindeki sembolü al: "Bitcoin (BTC)" -> "BTC"
  const symbolMatch = assetName.match(/\(([^)]+)\)/);
  const symbol = symbolMatch ? symbolMatch[1] : assetName;
  
  // Hisse senedi kontrolü (.IS, .US, vb.)
  if (symbol.includes('.IS')) {
    return {
      symbol,
      provider: 'yahoo',
      id: symbol,
      currency: 'TRY',
      category: 'Borsa'
    };
  }
  
  if (symbol.includes('.') || symbol.length > 5) {
    return {
      symbol,
      provider: 'yahoo',
      id: symbol,
      currency: 'USD',
      category: 'Borsa'
    };
  }
  
  // Kripto para varsayımı (2-5 karakter ticker)
  if (symbol.length >= 2 && symbol.length <= 5) {
    return {
      symbol,
      provider: 'coingecko',
      id: symbol.toLowerCase(),
      currency: 'USD',
      category: 'Kripto'
    };
  }
  
  throw new Error(`Cannot detect provider for: ${assetName}`);
};

/**
 * Ana fiyat çekme fonksiyonu - Provider'a göre doğru API'yi çağırır
 * @param {string} assetName - "Bitcoin (BTC)" gibi tam varlık adı
 * @param {object} assetInfo - (Opsiyonel) Transaction'dan gelen detaylı bilgi
 * @returns {Promise<object>} { price, currency, timestamp } objesi
 */
export const fetchAssetPrice = async (assetName, assetInfo = null) => {
  // Transaction'dan gelen bilgi varsa kullan
  const mapping = assetInfo?.apiMapping || detectAssetProvider(assetName);
  
  if (!mapping) {
    throw new Error(`No API mapping found for asset: ${assetName}`);
  }
  
  // Cache kontrolü
  const cachedPrice = await getCachedPrice(assetName);
  if (cachedPrice) {
    console.log(`💰 Cached price for ${assetName}:`, cachedPrice);
    return cachedPrice;
  }
  
  console.log(`🔄 Fetching fresh price for ${assetName} from ${mapping.provider}...`);
  
  let priceData;
  
  switch (mapping.provider) {
    case 'coingecko':
      priceData = await fetchCoinGeckoPrice(mapping.id);
      break;
      
    case 'yahoo':
      priceData = await fetchYahooPrice(mapping.symbol);
      break;
      
    case 'tcmb':
      priceData = await fetchTCMBRate(mapping.id);
      break;
      
    case 'metals':
      priceData = await fetchGoldPrice(mapping.id);
      break;
      
    default:
      throw new Error(`Unknown provider: ${mapping.provider}`);
  }
  
  // Price objesi oluştur
  const priceObject = {
    assetName,
    price: priceData[mapping.currency.toLowerCase()] || priceData.usd || 0,
    currency: mapping.currency,
    timestamp: priceData.timestamp,
    isMock: priceData.isMock || false,
  };
  
  // Cache'e kaydet
  await setCachedPrice(assetName, priceObject);
  
  return priceObject;
};

/**
 * Cache'den fiyat oku
 */
const getCachedPrice = async (assetName) => {
  // 1. In-memory cache
  const memCached = memoryCache.get(assetName);
  if (memCached && Date.now() - memCached.timestamp < CACHE_DURATION) {
    return memCached;
  }
  
  // 2. AsyncStorage cache
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${assetName}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Memory cache'e de kaydet
        memoryCache.set(assetName, parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  
  return null;
};

/**
 * Cache'e fiyat yaz
 */
const setCachedPrice = async (assetName, priceObject) => {
  // 1. Memory cache
  memoryCache.set(assetName, priceObject);
  
  // 2. AsyncStorage
  try {
    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${assetName}`,
      JSON.stringify(priceObject)
    );
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

/**
 * Tüm cache'i temizle
 */
export const clearPriceCache = async () => {
  memoryCache.clear();
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('✅ Price cache cleared');
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

/**
 * Birden fazla varlık için fiyat çek (batch)
 * @param {Array<string>} assetNames - Varlık adları dizisi
 * @returns {Promise<Array>} Fiyat objeleri dizisi
 */
export const fetchMultipleAssetPrices = async (assetNames) => {
  try {
    const promises = assetNames.map(name => fetchAssetPrice(name));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to fetch price for ${assetNames[index]}:`, result.reason);
        return {
          assetName: assetNames[index],
          price: 0,
          error: result.reason.message,
          timestamp: Date.now(),
        };
      }
    });
  } catch (error) {
    console.error('Batch fetch error:', error);
    throw error;
  }
};
