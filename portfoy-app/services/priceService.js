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

// Cache yapılandırması
const CACHE_DURATION = 15 * 60 * 1000; // 15 dakika (Rate Limit için artırıldı)
const CACHE_KEY_PREFIX = 'price_cache_';

// Rate Limit yönetimi
let lastCoinGeckoCall = 0;
const COINGECKO_RATE_LIMIT_DELAY = 2000; // 2 saniye (dakikada max 30 istek)

// In-memory cache
const memoryCache = new Map();

/**
 * CoinGecko API'den kripto fiyatı çeker (BATCH destekli)
 * @param {string|string[]} coinIds - 'bitcoin' veya ['bitcoin', 'ethereum']
 * @returns {Promise<Object>} Coin ID'ye göre fiyat map'i
 */
const fetchCoinGeckoPrice = async (coinIds) => {
  try {
    // Rate Limit kontrolü - son çağrıdan 2 saniye geçmemişse bekle
    const now = Date.now();
    const timeSinceLastCall = now - lastCoinGeckoCall;
    if (timeSinceLastCall < COINGECKO_RATE_LIMIT_DELAY) {
      const waitTime = COINGECKO_RATE_LIMIT_DELAY - timeSinceLastCall;
      console.log(`⏳ CoinGecko Rate Limit: ${waitTime}ms bekleniyor...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Tekil veya çoklu ID desteği
    const idsArray = Array.isArray(coinIds) ? coinIds : [coinIds];
    const idsString = idsArray.join(',');
    
    lastCoinGeckoCall = Date.now(); // Son çağrı zamanını kaydet
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd,try`
    );
    
    if (!response.ok) {
      // 429 Rate Limit hatası için özel mesaj
      if (response.status === 429) {
        console.warn('⚠️ CoinGecko Rate Limit (429)! Cache kullanılacak.');
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const timestamp = Date.now();
    
    console.log(`📥 CoinGecko API yanıt:`, JSON.stringify(data, null, 2));
    
    // Tekil ID için eski format döndür (geriye uyumluluk)
    if (idsArray.length === 1) {
      const coinId = idsArray[0];
      const result = {
        usd: data[coinId]?.usd || 0,
        try: data[coinId]?.try || 0,
        timestamp,
      };
      console.log(`💰 CoinGecko ${coinId}: USD=${result.usd}, TRY=${result.try}`);
      return result;
    }
    
    // Çoklu ID için map döndür
    const result = {};
    idsArray.forEach(coinId => {
      result[coinId] = {
        usd: data[coinId]?.usd || 0,
        try: data[coinId]?.try || 0,
        timestamp,
      };
    });
    
    return result;
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
 * Altın fiyatını çeker (Yahoo Finance - XAU ons fiyatı)
 * @param {string} goldType - 'gold', 'gold-quarter', 'gold-half', 'gold-republic'
 * @returns {Promise<number>} TRY cinsinden fiyat
 */
const fetchGoldPrice = async (goldType) => {
  try {
    // Yahoo Finance'dan altın ons fiyatını TRY cinsinden çek
    // XAU = 1 troy ons altın (31.1035 gram)
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d'
    );
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance gold API error: ${response.status}`);
    }
    
    const data = await response.json();
    const goldPricePerOunce = data.chart?.result?.[0]?.meta?.regularMarketPrice; // USD/ons
    
    if (!goldPricePerOunce) {
      throw new Error('Gold price not found in Yahoo Finance response');
    }
    
    // USD/ons'u TRY/gram'a çevir
    // 1 troy ons = 31.1035 gram
    // Önce USD kurunu çek
    const usdRate = await fetchTCMBRate('USD');
    const goldPricePerGramUSD = goldPricePerOunce / 31.1035;
    const goldPricePerGramTRY = goldPricePerGramUSD * usdRate.try;
    
    // Altın türüne göre fiyat hesapla
    const goldWeights = {
      'gold': 1, // 1 gram (24 ayar)
      'gold-22k': 1, // 1 gram (22 ayar)
      'gold-18k': 1, // 1 gram (18 ayar)
      'gold-14k': 1, // 1 gram (14 ayar)
      'gold-quarter': 1.6, // Çeyrek altın (~1.6 gram)
      'gold-half': 3.2, // Yarım altın (~3.2 gram)
      'gold-republic': 7.2, // Cumhuriyet altını (~7.2 gram - 22 ayar)
      'gold-resat': 7.2, // Reşat altını (~7.2 gram - 22 ayar)
    };
    
    // Ayar bazlı saflık çarpanları
    const purityMap = {
      'gold': 1.0,        // 24 ayar = %100 saflık
      'gold-22k': 0.9167, // 22 ayar = %91.67 saflık (22/24)
      'gold-18k': 0.75,   // 18 ayar = %75 saflık (18/24)
      'gold-14k': 0.5833, // 14 ayar = %58.33 saflık (14/24)
      'gold-quarter': 0.9167,  // Çeyrek altın 22 ayar
      'gold-half': 0.9167,     // Yarım altın 22 ayar
      'gold-republic': 0.9167, // Cumhuriyet altını 22 ayar
      'gold-resat': 0.9167,    // Reşat altını 22 ayar
    };
    
    const purity = purityMap[goldType] || 1.0;
    const weight = goldWeights[goldType] || 1;
    const finalPrice = goldPricePerGramTRY * weight * purity;
    
    console.log(`🥇 Altın fiyatı: ${goldPricePerOunce.toFixed(2)} USD/ons → ${goldPricePerGramTRY.toFixed(2)} TRY/gram → ${goldType}: ${finalPrice.toFixed(2)} TRY`);
    
    return {
      try: finalPrice,
      timestamp: Date.now(),
      isMock: false,
    };
  } catch (error) {
    console.error('Gold price fetch error:', error);
    
    // Fallback: Mock fiyatlar
    console.warn('⚠️ Altın fiyatı çekilemedi, mock data kullanılıyor');
    const mockPrices = {
      'gold': 3250,        // 24 ayar gram altın
      'gold-22k': 2980,    // 22 ayar gram altın
      'gold-18k': 2440,    // 18 ayar gram altın
      'gold-14k': 1895,    // 14 ayar gram altın
      'gold-quarter': 5350,   // Çeyrek altın
      'gold-half': 10700,     // Yarım altın
      'gold-republic': 21500, // Cumhuriyet altını
      'gold-resat': 21500,    // Reşat altını
    };
    
    return {
      try: mockPrices[goldType] || 0,
      timestamp: Date.now(),
      isMock: true,
    };
  }
};

/**
 * Varlık adından provider ve ID bilgisini çıkarır (tamamen dinamik)
 * @param {string} assetName - "Bitcoin (BTC)" veya "AKBNK (Akbank)" gibi
 * @param {object} assetInfo - Ek bilgi (symbol, mainCategory, vb.)
 * @returns {object} { provider, id, symbol, currency, category }
 */
const detectAssetProvider = (assetName, assetInfo = null) => {
  // 1. EN ÖNCELİKLİ: Transaction'da kaydedilen API bilgisi (apiId, provider)
  if (assetInfo?.apiId && assetInfo?.provider) {
    return {
      symbol: assetInfo.symbol || assetName,
      provider: assetInfo.provider,
      id: assetInfo.apiId, // Transaction'da kaydedilen doğru ID
      currency: assetInfo.apiCurrency || assetInfo.currency || 'USD',
      category: assetInfo.category || assetInfo.mainCategory
    };
  }
  
  // 2. assetSearchService'den gelen bilgi (TransactionScreen'de anlık fiyat çekerken)
  if (assetInfo?.id && assetInfo?.provider) {
    return {
      symbol: assetInfo.symbol || assetName,
      provider: assetInfo.provider,
      id: assetInfo.id,
      currency: assetInfo.currency || 'USD',
      category: assetInfo.category
    };
  }
  
  // 2. Transaction'da saklanan symbol bilgisine bak (eski işlemler için)
  //    "DOF ROBOTIK" için symbol="DOFRB.IS" gibi
  if (assetInfo?.symbol) {
    const symbol = assetInfo.symbol;
    
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
    
    // Crypto için symbol (fallback - normalde yukarıdaki blok çalışmalı)
    if (symbol.length >= 2 && symbol.length <= 5) {
      return {
        symbol,
        provider: 'coingecko',
        id: symbol.toLowerCase(),
        currency: 'USD',
        category: 'Kripto'
      };
    }
  }
  
  // 3. Kategori bilgisi varsa kullan (eski işlemler için fallback)
  const category = assetInfo?.category || assetInfo?.mainCategory;
  
  if (category === 'Kripto') {
    // Parantez içinde ticker varsa onu kullan: "Bitcoin (BTC)" -> "bitcoin"
    const tickerMatch = assetName.match(/\(([A-Z]+)\)/i);
    let cryptoId;
    
    if (tickerMatch) {
      // Ticker'ı direkt küçük harfle kullan (basitleştirilmiş fallback)
      cryptoId = tickerMatch[1].toLowerCase();
    } else {
      // Ticker yoksa ismi kullan: "Ethereum" -> "ethereum", "Binance Coin" -> "binance-coin"
      cryptoId = assetName.toLowerCase().replace(/\s+/g, '-');
    }
    
    return {
      symbol: assetName,
      provider: 'coingecko',
      id: cryptoId,
      currency: 'USD',
      category: 'Kripto'
    };
  }
  
  if (category === 'Borsa') {
    // DOF ROBOTIK, Garanti Bankası gibi
    // En iyi tahmin: parantez içinde ticker varsa onu kullan
    const tickerMatch = assetName.match(/\(([A-Z]{4,6})\)/i);
    let ticker;
    
    if (tickerMatch) {
      ticker = tickerMatch[1].toUpperCase(); // "(DOFRB)" -> "DOFRB"
    } else {
      // Ticker yoksa kelime kısaltması yap
      const words = assetName.split(/\s+/);
      if (words.length > 1) {
        ticker = words.map(w => w[0]).join('').toUpperCase();
      } else {
        ticker = assetName.substring(0, 5).toUpperCase();
      }
    }
    
    return {
      symbol: `${ticker}.IS`,
      provider: 'yahoo',
      id: `${ticker}.IS`,
      currency: 'TRY',
      category: 'Borsa'
    };
  }
  
  // 3. Symbol yoksa parantez içindeki sembolü al: "Bitcoin (BTC)" -> "BTC"
  const symbolMatch = assetName.match(/\(([^)]+)\)/);
  let symbol = symbolMatch ? symbolMatch[1] : assetName;
  
  // 3. Hisse senedi kontrolü (.IS, .US, vb.)
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
  
  // 4. BIST hisse senetleri: 4-5 harfli büyük harf ticker'lar (AKBNK, THYAO, DOFRB, vb.)
  // Kategori bilgisi varsa "Borsa" ise veya büyük harfli 4-5 karakter ise .IS ekle
  if (/^[A-Z]{4,5}$/.test(symbol) || (assetInfo?.mainCategory === 'Borsa')) {
    return {
      symbol: symbol.includes('.IS') ? symbol : `${symbol}.IS`,
      provider: 'yahoo',
      id: symbol.includes('.IS') ? symbol : `${symbol}.IS`,
      currency: 'TRY',
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
  // Her zaman dinamik algılama - daha basit ve güvenilir
  const mapping = detectAssetProvider(assetName, assetInfo);
  
  if (!mapping) {
    throw new Error(`No API mapping found for asset: ${assetName}`);
  }
  
  console.log(`🎯 Mapping for ${assetName} (${assetInfo?.category || 'unknown'}):`, JSON.stringify(mapping, null, 2));
  
  // Cache kontrolü
  const cachedPrice = await getCachedPrice(assetName);
  if (cachedPrice) {
    console.log(`💰 Cached price for ${assetName}:`, cachedPrice);
    return cachedPrice;
  }
  
  console.log(`🔄 Fetching fresh price for ${assetName} from ${mapping.provider}...`);
  console.log(`   Provider: ${mapping.provider}`);
  console.log(`   ID: ${mapping.id}`);
  console.log(`   Symbol: ${mapping.symbol}`);
  console.log(`   Currency: ${mapping.currency}`);
  
  let priceData;
  
  try {
    switch (mapping.provider) {
      case 'coingecko':
        console.log(`🌐 CoinGecko API çağrısı yapılıyor: id="${mapping.id}"`);
        priceData = await fetchCoinGeckoPrice(mapping.id);
        console.log(`✅ CoinGecko yanıt:`, priceData);
        break;
        
      case 'yahoo':
        console.log(`📈 Yahoo Finance API çağrısı yapılıyor: symbol="${mapping.symbol}"`);
        priceData = await fetchYahooPrice(mapping.symbol);
        console.log(`✅ Yahoo Finance yanıt:`, priceData);
        break;
        
      case 'tcmb':
        console.log(`💱 TCMB API çağrısı yapılıyor: currency="${mapping.id}"`);
        priceData = await fetchTCMBRate(mapping.id);
        console.log(`✅ TCMB yanıt:`, priceData);
        break;
        
      case 'metals':
        console.log(`🥇 Metals API çağrısı yapılıyor: type="${mapping.id}"`);
        priceData = await fetchGoldPrice(mapping.id);
        console.log(`✅ Metals yanıt:`, priceData);
        break;
        
      default:
        throw new Error(`Unknown provider: ${mapping.provider}`);
    }
  } catch (error) {
    // 429 Rate Limit hatası - eski cache'i kullan (süre dolmuş olsa bile)
    if (error.message.includes('429')) {
      console.warn(`⚠️ Rate Limit! ${assetName} için eski cache aranıyor...`);
      
      // Memory cache'de var mı? (süre dolmuş olabilir)
      const oldMemCache = memoryCache.get(assetName);
      if (oldMemCache) {
        console.log(`✅ Eski memory cache kullanılıyor: ${assetName}`);
        return oldMemCache;
      }
      
      // AsyncStorage'da var mı?
      try {
        const oldStorageCache = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${assetName}`);
        if (oldStorageCache) {
          const parsed = JSON.parse(oldStorageCache);
          console.log(`✅ Eski storage cache kullanılıyor: ${assetName}`);
          return parsed;
        }
      } catch (e) {
        // Cache okunamadı
      }
      
      console.error(`❌ ${assetName} için hiç cache yok ve Rate Limit aktif!`);
    }
    
    // Hatayı yukarı fırlat
    throw error;
  }
  
  // Price objesi oluştur
  const currencyLower = mapping.currency.toLowerCase();
  const priceObject = {
    assetName,
    price: priceData[currencyLower] || priceData[mapping.currency] || priceData.usd || priceData.price || 0,
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
