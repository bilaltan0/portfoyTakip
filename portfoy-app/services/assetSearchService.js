/**
 * Asset Search Service - Varlık Arama Servisi
 * 
 * Kullanıcının girdiği varlık adını API'lerden arar ve bulur.
 * Statik mapping yerine dinamik arama yapar.
 */

/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirir
 * Örn: "tüpraş" → "tupras", "iş" → "is"
 */
function normalizeTurkish(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/**
 * CoinGecko'dan coin arar
 * @param {string} searchTerm - "bitcoin", "btc", "ethereum" gibi
 * @returns {Promise<Array>} Bulunan coin'ler
 */
export const searchCryptoAssets = async (searchTerm) => {
  try {
    // CoinGecko'nun coin listesini çek (cache'lenir)
    const coinList = await getCoinGeckoList();
    
    const search = searchTerm.toLowerCase().trim();
    
    // Türev token anahtar kelimeleri (bunları filtrele)
    const derivativeKeywords = ['staked', 'wrapped', 'liquid', 'bridged', 'synthetic', 'leveraged', 'interest bearing'];
    
    // Exact match öncelikli arama
    const exactMatches = [];
    const startsWith = [];
    const partialMatches = [];
    
    coinList.forEach(coin => {
      const name = coin.name.toLowerCase();
      const symbol = coin.symbol.toLowerCase();
      const id = coin.id.toLowerCase();
      
      // Türev token kontrolü - isminde türev kelimeler varsa atla
      const isDerivative = derivativeKeywords.some(keyword => name.includes(keyword));
      if (isDerivative) {
        return; // Bu coini atla
      }
      
      // 1. Exact match (tam eşleşme) - EN ÖNCELİKLİ
      if (symbol === search || name === search || id === search) {
        exactMatches.push(coin);
      }
      // 2. Starts with (başlangıç eşleşmesi) - SADECE isim veya sembol başında
      else if (name.startsWith(search) || symbol.startsWith(search)) {
        startsWith.push(coin);
      }
      // 3. Partial match - SADECE kelime başında eşleşirse
      else if (name.includes(search) || symbol.includes(search)) {
        // Coin ismini kelimelere ayır (boşluk, tire, parantez)
        const nameWords = name.split(/[\s\-\(\)]+/).filter(w => w.length > 0);
        
        // SADECE bir kelimenin başında varsa ekle
        // "avax" ararken: "Avalanche" ✅, "Staked AVAX" ❌, "BENQI Liquid Staked AVAX" ❌
        const matchesWordStart = nameWords.some(word => word.startsWith(search));
        
        if (matchesWordStart) {
          partialMatches.push(coin);
        }
      }
    });
    
    // Eğer exact match varsa, SADECE onu döndür (diğerlerini gösterme)
    let matches;
    if (exactMatches.length > 0) {
      matches = exactMatches;
    } else if (startsWith.length > 0) {
      // Exact match yoksa, sadece startsWith göster (partial'ı gösterme)
      matches = startsWith;
    } else {
      // İkisi de yoksa, partial göster
      matches = partialMatches;
    }
    
    // İlk 10 sonucu döndür (daha az sonuç = daha temiz liste)
    return matches.slice(0, 10).map(coin => ({
      assetName: `${coin.name} (${coin.symbol.toUpperCase()})`,
      symbol: coin.symbol.toUpperCase(),
      provider: 'coingecko',
      id: coin.id,
      currency: 'USD',
      category: 'Kripto',
      fullName: coin.name,
      ticker: coin.symbol.toUpperCase()
    }));
  } catch (error) {
    console.error('Crypto search error:', error);
    return [];
  }
};

/**
 * Yahoo Finance'dan SADECE BIST (Borsa İstanbul) hisselerini arar
 * TAMAMEN DİNAMİK - Yeni halka arzlar otomatik gelir
 * @param {string} searchTerm - "akbank", "thyao", "tuprs", "tat" gibi
 * @returns {Promise<Array>} Bulunan BIST hisseleri
 */
export const searchStockAssets = async (searchTerm) => {
  try {
    const search = searchTerm.trim();
    
    if (search.length < 1) {
      return [];
    }

    const searchLower = search.toLowerCase();
    const searchUpper = search.toUpperCase();
    
    // Türkçe karakterleri normalize et (tüpraş → tupras)
    const normalized = normalizeTurkish(search);
    const normalizedUpper = normalized.toUpperCase();
    
    // 6 arama stratejisi (Türkçe + normalize edilmiş)
    const searches = [
      // Türkçe karakterli aramalar
      fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search)}&quotesCount=15&newsCount=0`),
      fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchUpper + '.IS')}&quotesCount=15&newsCount=0`),
      fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search + ' istanbul')}&quotesCount=15&newsCount=0`),
      // Normalize edilmiş aramalar (İngilizce karakterler)
      fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(normalized)}&quotesCount=15&newsCount=0`),
      fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(normalizedUpper + '.IS')}&quotesCount=15&newsCount=0`),
      fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(normalized + ' stock')}&quotesCount=15&newsCount=0`)
    ];

    const responses = await Promise.allSettled(searches);
    const allResults = [];

    for (const response of responses) {
      if (response.status === 'fulfilled' && response.value.ok) {
        const data = await response.value.json();
        const quotes = data.quotes || [];
        
        // SADECE .IS ile biten BIST hisselerini al
        const bistStocks = quotes
          .filter(quote => 
            quote.quoteType === 'EQUITY' && 
            quote.symbol && 
            quote.symbol.endsWith('.IS')
          )
          .map(quote => ({
            assetName: `${quote.shortname || quote.longname} (${quote.symbol})`,
            symbol: quote.symbol,
            provider: 'yahoo',
            id: quote.symbol,
            currency: 'TRY',
            category: 'Borsa',
            fullName: quote.longname || quote.shortname,
            ticker: quote.symbol,
            exchange: 'IST'
          }));
        
        allResults.push(...bistStocks);
      }
    }

    // Duplikaları kaldır
    const unique = Array.from(
      new Map(allResults.map(item => [item.symbol, item])).values()
    );

    // Basit relevance sıralaması
    unique.sort((a, b) => {
      const aSymbol = a.symbol.toLowerCase().replace('.is', '');
      const bSymbol = b.symbol.toLowerCase().replace('.is', '');
      const aName = (a.fullName || '').toLowerCase();
      const bName = (b.fullName || '').toLowerCase();
      
      // 1. Tam sembol eşleşmesi
      if (aSymbol === searchLower && bSymbol !== searchLower) return -1;
      if (aSymbol !== searchLower && bSymbol === searchLower) return 1;
      
      // 2. Sembol ile başlayanlar
      if (aSymbol.startsWith(searchLower) && !bSymbol.startsWith(searchLower)) return -1;
      if (!aSymbol.startsWith(searchLower) && bSymbol.startsWith(searchLower)) return 1;
      
      // 3. İsim ile başlayanlar
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
      if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;
      
      // 4. İsimde geçenler
      if (aName.includes(searchLower) && !bName.includes(searchLower)) return -1;
      if (!aName.includes(searchLower) && bName.includes(searchLower)) return 1;
      
      return 0;
    });

    return unique.slice(0, 20);
  } catch (error) {
    console.error('❌ BIST stock search error:', error);
    return [];
  }
};

/**
 * Tüm kategorilerde varlık arar
 * @param {string} searchTerm - Arama terimi
 * @param {string} category - "Kripto", "Borsa", "Altın", "Döviz" veya boş string
 * @returns {Promise<Array>} Bulunan varlıkların array'i
 */
export const searchAllAssets = async (searchTerm, category = '') => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  try {
    const allResults = [];
    
    // Kategori bazlı arama
    if (!category || category === 'Kripto') {
      const cryptoResults = await searchCryptoAssets(searchTerm);
      allResults.push(...cryptoResults);
    }
    
    if (!category || category === 'Borsa') {
      const stockResults = await searchStockAssets(searchTerm);
      allResults.push(...stockResults);
    }
    
    if (!category || category === 'Altın') {
      // Altın araması - kullanıcı dostu arama terimleriyle
      const goldAssets = [
        { assetName: 'Gram Altın', symbol: 'Gram Altın', provider: 'metals', id: 'gold', currency: 'TRY', category: 'Altın', fullName: 'Gram Altın (24 Ayar)', ticker: 'XAU' },
        { assetName: '22 Ayar Altın', symbol: '22 Ayar Altın', provider: 'metals', id: 'gold-22k', currency: 'TRY', category: 'Altın', fullName: '22 Ayar Altın', ticker: 'XAU_22K' },
        { assetName: '18 Ayar Altın', symbol: '18 Ayar Altın', provider: 'metals', id: 'gold-18k', currency: 'TRY', category: 'Altın', fullName: '18 Ayar Altın', ticker: 'XAU_18K' },
        { assetName: '14 Ayar Altın', symbol: '14 Ayar Altın', provider: 'metals', id: 'gold-14k', currency: 'TRY', category: 'Altın', fullName: '14 Ayar Altın', ticker: 'XAU_14K' },
        { assetName: 'Çeyrek Altın', symbol: 'Çeyrek Altın', provider: 'metals', id: 'gold-quarter', currency: 'TRY', category: 'Altın', fullName: 'Çeyrek Altın (Cumhuriyet)', ticker: 'XAU_QUARTER' },
        { assetName: 'Yarım Altın', symbol: 'Yarım Altın', provider: 'metals', id: 'gold-half', currency: 'TRY', category: 'Altın', fullName: 'Yarım Altın (Cumhuriyet)', ticker: 'XAU_HALF' },
        { assetName: 'Tam Altın', symbol: 'Tam Altın', provider: 'metals', id: 'gold-republic', currency: 'TRY', category: 'Altın', fullName: 'Tam Altın (Cumhuriyet)', ticker: 'XAU_FULL' },
        { assetName: 'Reşat Altını', symbol: 'Reşat Altını', provider: 'metals', id: 'gold-resat', currency: 'TRY', category: 'Altın', fullName: 'Reşat Altını', ticker: 'XAU_RESAT' }
      ];
      const goldMatches = goldAssets.filter(g => 
        g.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      allResults.push(...goldMatches);
    }
    
    if (!category || category === 'Döviz') {
      // Döviz araması - basit statik liste
      const forexAssets = [
        { assetName: 'Amerikan Doları (USD)', symbol: 'USD', provider: 'tcmb', id: 'USD', currency: 'TRY', category: 'Döviz', fullName: 'Amerikan Doları', ticker: 'USD' },
        { assetName: 'Euro (EUR)', symbol: 'EUR', provider: 'tcmb', id: 'EUR', currency: 'TRY', category: 'Döviz', fullName: 'Euro', ticker: 'EUR' },
        { assetName: 'İngiliz Sterlini (GBP)', symbol: 'GBP', provider: 'tcmb', id: 'GBP', currency: 'TRY', category: 'Döviz', fullName: 'İngiliz Sterlini', ticker: 'GBP' },
        { assetName: 'Japon Yeni (JPY)', symbol: 'JPY', provider: 'tcmb', id: 'JPY', currency: 'TRY', category: 'Döviz', fullName: 'Japon Yeni', ticker: 'JPY' },
        { assetName: 'İsviçre Frangı (CHF)', symbol: 'CHF', provider: 'tcmb', id: 'CHF', currency: 'TRY', category: 'Döviz', fullName: 'İsviçre Frangı', ticker: 'CHF' },
        { assetName: 'Kanada Doları (CAD)', symbol: 'CAD', provider: 'tcmb', id: 'CAD', currency: 'TRY', category: 'Döviz', fullName: 'Kanada Doları', ticker: 'CAD' },
        { assetName: 'Avustralya Doları (AUD)', symbol: 'AUD', provider: 'tcmb', id: 'AUD', currency: 'TRY', category: 'Döviz', fullName: 'Avustralya Doları', ticker: 'AUD' }
      ];
      const forexMatches = forexAssets.filter(f => 
        f.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      allResults.push(...forexMatches);
    }
    
    return allResults;
  } catch (error) {
    console.error('Asset search error:', error);
    return [];
  }
};

// ========== CoinGecko Coin List Cache ==========

let coinListCache = null;
let coinListTimestamp = 0;
const COIN_LIST_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

/**
 * CoinGecko'nun market cap'e göre top 500 coin listesini çeker ve cache'ler
 * Bu liste günlük güncellenir ve yeni coinler market cap'e girerse otomatik eklenir
 * @returns {Promise<Array>} Top 500 coin listesi (market cap sıralı)
 */
const getCoinGeckoList = async () => {
  // Cache kontrolü
  if (coinListCache && Date.now() - coinListTimestamp < COIN_LIST_CACHE_DURATION) {
    return coinListCache;
  }
  
  try {
    console.log('🔄 Fetching CoinGecko top 500 coins by market cap...');
    
    // Market cap'e göre sıralı ilk 500 coin (5 sayfa x 100 coin)
    const pages = [1, 2, 3, 4, 5];
    const allCoins = [];
    
    // Paralel olarak 5 sayfayı da çek (daha hızlı)
    const requests = pages.map(page => 
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    );
    
    const results = await Promise.all(requests);
    
    // Tüm sonuçları birleştir
    results.forEach(pageData => {
      if (Array.isArray(pageData)) {
        pageData.forEach(coin => {
          allCoins.push({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            market_cap_rank: coin.market_cap_rank
          });
        });
      }
    });
    
    // Cache'e kaydet
    coinListCache = allCoins;
    coinListTimestamp = Date.now();
    
    console.log(`✅ Loaded ${allCoins.length} coins from CoinGecko (market cap sorted)`);
    
    return allCoins;
  } catch (error) {
    console.error('CoinGecko list fetch error:', error);
    
    // Cache varsa onu döndür
    if (coinListCache) {
      console.log('⚠️ Using stale cache');
      return coinListCache;
    }
    
    // Hata durumunda boş array döndür
    return [];
  }
};

// ========== Popüler Varlıklar (Hızlı Erişim) ==========

/**
 * Popüler kripto paralar
 */
export const POPULAR_CRYPTO = [
  { name: 'Bitcoin', symbol: 'BTC', id: 'bitcoin' },
  { name: 'Ethereum', symbol: 'ETH', id: 'ethereum' },
  { name: 'Tether', symbol: 'USDT', id: 'tether' },
  { name: 'BNB', symbol: 'BNB', id: 'binancecoin' },
  { name: 'Solana', symbol: 'SOL', id: 'solana' },
  { name: 'XRP', symbol: 'XRP', id: 'ripple' },
  { name: 'Cardano', symbol: 'ADA', id: 'cardano' },
  { name: 'Dogecoin', symbol: 'DOGE', id: 'dogecoin' },
  { name: 'Avalanche', symbol: 'AVAX', id: 'avalanche-2' },
  { name: 'Polkadot', symbol: 'DOT', id: 'polkadot' },
];

/**
 * Popüler BIST hisseleri (boş aramada gösterilecek)
 */
export const POPULAR_STOCKS_TR = [
  { name: 'Akbank', symbol: 'AKBNK.IS' },
  { name: 'Garanti Bankası', symbol: 'GARAN.IS' },
  { name: 'İş Bankası', symbol: 'ISCTR.IS' },
  { name: 'Yapı Kredi', symbol: 'YKBNK.IS' },
  { name: 'Türk Hava Yolları', symbol: 'THYAO.IS' },
  { name: 'Ereğli Demir Çelik', symbol: 'EREGL.IS' },
  { name: 'Tüpraş', symbol: 'TUPRS.IS' },
  { name: 'BİM', symbol: 'BIMAS.IS' },
  { name: 'Migros', symbol: 'MGROS.IS' },
  { name: 'Turkcell', symbol: 'TCELL.IS' },
];

/**
 * Fuzzy matching helper - sembol veya isimde arama terimini akıllıca bul
 */
function fuzzyMatch(text, searchTerm) {
  const textLower = text.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  // Tam eşleşme
  if (textLower === searchLower) return 100;
  
  // Başlangıç eşleşmesi
  if (textLower.startsWith(searchLower)) return 90;
  
  // Kelime başlangıcı eşleşmesi (örn: "tat" -> "Tat Gıda")
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(searchLower)) return 80;
  }
  
  // İçerik eşleşmesi
  if (textLower.includes(searchLower)) return 70;
  
  // Karakter karakter benzerlik (örn: "TATEN" için "TAT" -> 60%)
  let matchCount = 0;
  let searchIndex = 0;
  for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
    if (textLower[i] === searchLower[searchIndex]) {
      matchCount++;
      searchIndex++;
    }
  }
  const similarity = (matchCount / searchLower.length) * 60;
  return similarity;
}

/**
 * Popüler varlıkları döndür
 * @param {string} category - "Kripto", "Borsa", "Altın" veya "Döviz"
 * @returns {Array} Popüler varlıklar
 */
export const getPopularAssets = (category) => {
  if (category === 'Kripto') {
    return POPULAR_CRYPTO.map(coin => ({
      assetName: `${coin.name} (${coin.symbol})`,
      symbol: coin.symbol,
      provider: 'coingecko',
      id: coin.id,
      currency: 'USD',
      category: 'Kripto',
      fullName: coin.name,
      ticker: coin.symbol
    }));
  }
  
  if (category === 'Borsa') {
    return POPULAR_STOCKS_TR.map(stock => ({
      assetName: `${stock.name} (${stock.symbol})`,
      symbol: stock.symbol,
      provider: 'yahoo',
      id: stock.symbol,
      currency: 'TRY',
      category: 'Borsa',
      fullName: stock.name,
      ticker: stock.symbol
    }));
  }
  
  if (category === 'Altın') {
    return [
      { assetName: 'Gram Altın', symbol: 'Gram Altın', provider: 'metals', id: 'gold', currency: 'TRY', category: 'Altın', fullName: 'Gram Altın (24 Ayar)', ticker: 'XAU' },
      { assetName: '22 Ayar Altın', symbol: '22 Ayar Altın', provider: 'metals', id: 'gold-22k', currency: 'TRY', category: 'Altın', fullName: '22 Ayar Altın', ticker: 'XAU_22K' },
      { assetName: '18 Ayar Altın', symbol: '18 Ayar Altın', provider: 'metals', id: 'gold-18k', currency: 'TRY', category: 'Altın', fullName: '18 Ayar Altın', ticker: 'XAU_18K' },
      { assetName: '14 Ayar Altın', symbol: '14 Ayar Altın', provider: 'metals', id: 'gold-14k', currency: 'TRY', category: 'Altın', fullName: '14 Ayar Altın', ticker: 'XAU_14K' },
      { assetName: 'Çeyrek Altın', symbol: 'Çeyrek Altın', provider: 'metals', id: 'gold-quarter', currency: 'TRY', category: 'Altın', fullName: 'Çeyrek Altın (Cumhuriyet)', ticker: 'XAU_QUARTER' },
      { assetName: 'Yarım Altın', symbol: 'Yarım Altın', provider: 'metals', id: 'gold-half', currency: 'TRY', category: 'Altın', fullName: 'Yarım Altın (Cumhuriyet)', ticker: 'XAU_HALF' }
    ];
  }
  
  if (category === 'Döviz') {
    return [
      { assetName: 'Amerikan Doları (USD)', symbol: 'USD', provider: 'tcmb', id: 'USD', currency: 'TRY', category: 'Döviz', fullName: 'Amerikan Doları', ticker: 'USD' },
      { assetName: 'Euro (EUR)', symbol: 'EUR', provider: 'tcmb', id: 'EUR', currency: 'TRY', category: 'Döviz', fullName: 'Euro', ticker: 'EUR' },
      { assetName: 'İngiliz Sterlini (GBP)', symbol: 'GBP', provider: 'tcmb', id: 'GBP', currency: 'TRY', category: 'Döviz', fullName: 'İngiliz Sterlini', ticker: 'GBP' },
      { assetName: 'Japon Yeni (JPY)', symbol: 'JPY', provider: 'tcmb', id: 'JPY', currency: 'TRY', category: 'Döviz', fullName: 'Japon Yeni', ticker: 'JPY' },
      { assetName: 'İsviçre Frangı (CHF)', symbol: 'CHF', provider: 'tcmb', id: 'CHF', currency: 'TRY', category: 'Döviz', fullName: 'İsviçre Frangı', ticker: 'CHF' }
    ];
  }
  
  return [];
};
