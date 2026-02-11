/**
 * Price Service - Fiyat Çekme Servisi
 * 
 * Farklı API'lerden varlık fiyatlarını çeker ve cache'ler.
 * 
 * Kullanılan API'ler:
 * - Binance: Kripto paralar (ücretsiz, rate limit yok)
 * - Yahoo Finance: Hisse senetleri (ücretsiz)
 * - TCMB: Döviz kurları (ücretsiz)
 * - Metals API: Altın fiyatları (ücretsiz)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache yapılandırması
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
const CACHE_KEY_PREFIX = 'price_cache_';

// In-memory cache
const memoryCache = new Map();

/**
 * Binance API'den kripto fiyatı çeker
 * @param {string} symbolOrName - 'ETH', 'AVAX' veya 'ethereum', 'avalanche-2' gibi
 * @returns {Promise<Object>} USD fiyatı
 */
const fetchBinancePrice = async (symbolOrName) => {
  try {
    // Symbol'ü temizle ve büyük harfe çevir
    let baseSymbol = symbolOrName.toUpperCase().trim();
    
    // CoinGecko ID formatında ise (ethereum, avalanche-2, bitcoin, vb.) 
    // Symbol'e çevir (ETH, AVAX, BTC)
    const coinGeckoToBinanceSymbol = {
      'ETHEREUM': 'ETH',
      'BITCOIN': 'BTC',
      'BINANCECOIN': 'BNB',
      'RIPPLE': 'XRP',
      'CARDANO': 'ADA',
      'DOGECOIN': 'DOGE',
      'SOLANA': 'SOL',
      'POLKADOT': 'DOT',
      'AVALANCHE-2': 'AVAX',
      'TRON': 'TRX',
    };
    
    baseSymbol = coinGeckoToBinanceSymbol[baseSymbol] || baseSymbol;
    
    // Binance sembolü: ETHUSDT, BTCUSDT, AVAXUSDT, vb.
    const binanceSymbol = `${baseSymbol}USDT`;
    
    console.log(`🔶 Binance API çağrısı: ${binanceSymbol}`);
    
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
    );
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    const usdPrice = parseFloat(data.price);
    
    console.log(`✅ Binance ${binanceSymbol}: ${usdPrice} USD`);
    
    return {
      usd: usdPrice,
      try: 0, // TRY için ayrı dönüşüm gerekir
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Binance fetch error:', error);
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
 * Exchange Rate API'den döviz kuru çeker (Ücretsiz, güvenilir)
 * @param {string} currency - 'USD', 'EUR', 'GBP'
 * @returns {Promise<number>} TRY karşısında kur
 */
const fetchTCMBRate = async (currency) => {
  try {
    // Exchange Rate API - TRY bazlı kurlar
    // Ücretsiz tier: 1500 istek/ay, API key gerekmez
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${currency}`
    );
    
    if (!response.ok) {
      throw new Error(`Exchange Rate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // TRY kuru al
    const tryRate = data.rates?.TRY;
    
    if (!tryRate) {
      throw new Error(`TRY rate not found for ${currency}`);
    }
    
    console.log(`💱 ${currency} → TRY: ${tryRate.toFixed(4)}`);
    
    return {
      try: tryRate,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Exchange Rate API fetch error:', error);
    throw error;
  }
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
        console.log(`🔶 Binance API çağrısı yapılıyor: symbol="${mapping.symbol}"`);
        const searchTerm = mapping.symbol || mapping.id;
        priceData = await fetchBinancePrice(searchTerm);
        console.log(`✅ Binance yanıt:`, priceData);
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
    console.error(`❌ ${assetName} fiyat çekme hatası:`, error.message);
    
    // Cache'i kontrol et
    const cachedPrice = await getCachedPrice(assetName);
    if (cachedPrice) {
      console.log(`✅ Cache'den kullanılıyor: ${assetName}`);
      return cachedPrice;
    }
    
    // Cache de yok - fiyat çekilemedi
    console.error(`❌ ${assetName} için cache yok ve API başarısız!`);
    
    // Fiyat çekilemediğinde NULL döndür
    return {
      assetName,
      price: null,
      currency: mapping.currency,
      timestamp: Date.now(),
      isMock: false,
      error: true,
    };
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

// ============================================
// TARİHSEL FİYAT ÇEKME FONKSİYONLARI
// ============================================

const HIST_CACHE_KEY_PREFIX = 'hist_price_';

/**
 * Tarihsel fiyat cache'i - tarihsel fiyatlar değişmez, uzun süre cache'lenir
 */
const getHistoricalCachedPrice = async (cacheKey) => {
  try {
    const cached = await AsyncStorage.getItem(`${HIST_CACHE_KEY_PREFIX}${cacheKey}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Historical cache read error:', error);
  }
  return null;
};

const setHistoricalCachedPrice = async (cacheKey, priceData) => {
  try {
    await AsyncStorage.setItem(
      `${HIST_CACHE_KEY_PREFIX}${cacheKey}`,
      JSON.stringify(priceData)
    );
  } catch (error) {
    console.error('Historical cache write error:', error);
  }
};

/**
 * Binance API'den tarihsel kripto fiyatı çeker (klines/candlestick)
 * @param {string} symbolOrName - 'BTC', 'ETH' gibi
 * @param {Date} targetDate - Hedef tarih
 * @returns {Promise<number>} USD fiyatı
 */
const fetchHistoricalBinancePrice = async (symbolOrName, targetDate) => {
  try {
    let baseSymbol = symbolOrName.toUpperCase().trim();
    
    const coinGeckoToBinanceSymbol = {
      'ETHEREUM': 'ETH', 'BITCOIN': 'BTC', 'BINANCECOIN': 'BNB',
      'RIPPLE': 'XRP', 'CARDANO': 'ADA', 'DOGECOIN': 'DOGE',
      'SOLANA': 'SOL', 'POLKADOT': 'DOT', 'AVALANCHE-2': 'AVAX', 'TRON': 'TRX',
    };
    
    baseSymbol = coinGeckoToBinanceSymbol[baseSymbol] || baseSymbol;
    const binanceSymbol = `${baseSymbol}USDT`;
    
    // Klines API: 1 günlük mum verisi
    const startTime = targetDate.getTime();
    const endTime = startTime + 24 * 60 * 60 * 1000; // +1 gün
    
    console.log(`📊 Binance Historical: ${binanceSymbol} @ ${targetDate.toISOString().split('T')[0]}`);
    
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error(`Binance klines API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error(`No historical data for ${binanceSymbol} at ${targetDate.toISOString()}`);
    }
    
    // Kline format: [openTime, open, high, low, close, volume, ...]
    // close fiyatını kullan (index 4)
    const closePrice = parseFloat(data[0][4]);
    
    console.log(`✅ Historical ${binanceSymbol}: ${closePrice} USD @ ${targetDate.toISOString().split('T')[0]}`);
    
    return closePrice;
  } catch (error) {
    console.warn('Binance historical fetch error:', error.message);
    throw error;
  }
};

/**
 * Yahoo Finance'dan tarihsel hisse/altın fiyatı çeker
 * @param {string} symbol - 'AKBNK.IS', 'GC=F' gibi
 * @param {Date} targetDate - Hedef tarih
 * @returns {Promise<number>} Fiyat
 */
const fetchHistoricalYahooPrice = async (symbol, targetDate) => {
  try {
    // period1 ve period2: Unix timestamp (saniye)
    const period1 = Math.floor(targetDate.getTime() / 1000);
    const period2 = period1 + 86400 * 3; // +3 gün (hafta sonu kapalıysa komşu gün)
    
    console.log(`📊 Yahoo Historical: ${symbol} @ ${targetDate.toISOString().split('T')[0]}`);
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`
    );
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance historical API error: ${response.status}`);
    }
    
    const data = await response.json();
    const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
    const closes = quotes?.close;
    
    if (!closes || closes.length === 0) {
      throw new Error(`No historical data for ${symbol}`);
    }
    
    // İlk geçerli (null olmayan) close fiyatını al
    const validClose = closes.find(c => c != null && c > 0);
    
    if (!validClose) {
      throw new Error(`No valid close price for ${symbol}`);
    }
    
    console.log(`✅ Historical ${symbol}: ${validClose} @ ${targetDate.toISOString().split('T')[0]}`);
    
    return validClose;
  } catch (error) {
    console.warn('Yahoo historical fetch error:', error.message);
    throw error;
  }
};

/**
 * Ana tarihsel fiyat çekme fonksiyonu
 * @param {string} assetName - Varlık adı
 * @param {object} assetInfo - Varlık bilgisi (provider, symbol, vb.)
 * @param {Date} targetDate - Hedef tarih
 * @returns {Promise<object>} { price, currency, date }
 */
export const fetchHistoricalAssetPrice = async (assetName, assetInfo, targetDate) => {
  const dateStr = targetDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  const cacheKey = `${assetName}_${dateStr}`;
  
  // Cache kontrolü (tarihsel fiyatlar değişmez)
  const cached = await getHistoricalCachedPrice(cacheKey);
  if (cached) {
    return cached;
  }
  
  const mapping = detectAssetProvider(assetName, assetInfo);
  
  if (!mapping) {
    throw new Error(`No mapping for historical price: ${assetName}`);
  }
  
  let price = 0;
  let currency = mapping.currency;
  
  try {
    switch (mapping.provider) {
      case 'coingecko': {
        // Crypto: Binance klines API
        const searchTerm = mapping.symbol || mapping.id;
        price = await fetchHistoricalBinancePrice(searchTerm, targetDate);
        currency = 'USD';
        break;
      }
      
      case 'yahoo': {
        // Borsa / Altın: Yahoo Finance chart
        price = await fetchHistoricalYahooPrice(mapping.symbol || mapping.id, targetDate);
        break;
      }
      
      case 'metals': {
        // Altın: Yahoo Finance GC=F üzerinden tarihsel
        const goldOuncePrice = await fetchHistoricalYahooPrice('GC=F', targetDate);
        // Bu ham ons fiyatı (USD), dönüşüm periodCalculations'da yapılacak
        price = goldOuncePrice;
        currency = 'USD';
        break;
      }
      
      case 'tcmb': {
        // Döviz: Tarihsel kur verisi alamayacağız, güncel kuru kullan
        const rateData = await fetchTCMBRate(mapping.id);
        price = rateData.try;
        currency = 'TRY';
        break;
      }
      
      default:
        throw new Error(`Unknown provider for historical: ${mapping.provider}`);
    }
  } catch (error) {
    console.warn(`⚠️ Historical price failed for ${assetName} @ ${dateStr}:`, error.message);
    // Tarihsel fiyat çekilemezse null dön
    return { price: null, currency, date: dateStr, error: true };
  }
  
  const result = { price, currency, date: dateStr };
  
  // Cache'e kaydet (tarihsel fiyatlar DEĞİŞMEZ)
  await setHistoricalCachedPrice(cacheKey, result);
  
  return result;
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
