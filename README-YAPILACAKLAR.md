# Portföy Takip Uygulaması - Yapılacaklar

## 📋 Bağlam

**Kullanıcı Sorusu:**
> "şimdi bunu pushlayıp bir sonraki aşamada apiler yardımıyla güncel fiyatları çekip kar zarar hesabı falan yaptırmayı düşünüyorum sence bundan önce yapılması gereken çok kritik bir konu var mı?"

**Tarih:** 30 Kasım 2025

**Durum:** 
- Modülerleştirme tamamlandı (13 component, 4 screen optimize edildi, -554 satır)
- Tüm buglar düzeltildi ve uygulama test edilebilir durumda
- Bir sonraki aşama: API entegrasyonu ile gerçek zamanlı fiyat çekme ve kar/zarar hesaplama

Bu dokümantasyon, API entegrasyonuna geçmeden önce yapılması gereken kritik görevleri ve sonrasında uygulanabilecek geliştirmeleri içermektedir.

---

## 🎯 API Entegrasyonu Öncesi Kritik Görevler

### 1. ⚠️ Varlık API Mapping Sistemi (EN KRİTİK!)

**Sorun:** API'den fiyat çekmek için varlıkları eşleştirme sistemi gerekli.

**Çözüm:** Her varlık için API identifier'ı sakla

```javascript
// constants/apiMapping.js oluştur
export const ASSET_API_MAPPING = {
  'Bitcoin (BTC)': { 
    symbol: 'BTC', 
    provider: 'coingecko',
    id: 'bitcoin',
    currency: 'USD'
  },
  'Ethereum (ETH)': { 
    symbol: 'ETH', 
    provider: 'coingecko',
    id: 'ethereum',
    currency: 'USD'
  },
  'Akbank (AKBNK)': { 
    symbol: 'AKBNK.IS', 
    provider: 'yahoo',
    id: 'AKBNK.IS',
    currency: 'TRY'
  },
  'Türk Hava Yolları (THYAO)': {
    symbol: 'THYAO.IS',
    provider: 'yahoo',
    id: 'THYAO.IS',
    currency: 'TRY'
  },
  'Altın': {
    symbol: 'XAU',
    provider: 'metals',
    id: 'gold',
    currency: 'USD'
  },
  // Daha fazla varlık eklenecek...
};
```

**Transaction objesine eklenecek field:**
```javascript
{
  assetName: "Bitcoin (BTC)",
  apiSymbol: "BTC",     // API için identifier
  apiProvider: "coingecko",  // Hangi API kullanılacak
  ticker: "BTC"         // Kısa kod
}
```

---

### 2. 💱 Currency Handling İyileştirmesi

**Sorun:** 
- Her işlem kendi currency'sini kaydediyor ama hesaplamalarda hep TRY varsayılıyor
- API'den gelen fiyatlar farklı currency'lerde olabilir

**Yapılacaklar:**
- [ ] Her varlığın hangi currency'de alındığını doğru takip et
- [ ] API'den gelen fiyatların currency'sini kontrol et
- [ ] Kar/zarar hesabında currency dönüşümünü doğrula
- [ ] Gerçek zamanlı döviz kurları çek (örn: exchangerate-api.com)

---

### 3. 🔄 API Rate Limiting & Caching

**Sorun:** Çok fazla API call → Rate limit, yavaşlık, maliyet

**Çözüm:**
```javascript
// services/priceCache.js
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
const priceCache = new Map();

export const getCachedPrice = async (assetId) => {
  const cached = priceCache.get(assetId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }
  
  // API'den çek
  const price = await fetchPriceFromAPI(assetId);
  
  // Cache'e kaydet
  priceCache.set(assetId, {
    price,
    timestamp: Date.now()
  });
  
  // AsyncStorage'e de kaydet (offline için)
  await AsyncStorage.setItem(`price_${assetId}`, JSON.stringify({
    price,
    timestamp: Date.now()
  }));
  
  return price;
};
```

**Yapılacaklar:**
- [ ] Price cache servisi oluştur
- [ ] AsyncStorage'de son fiyatları sakla
- [ ] Cache süresi ayarlanabilir yap
- [ ] Manuel refresh butonu ekle

---

### 4. 🛡️ Error Handling & Offline Mode

**Sorun:** API çalışmazsa uygulama çökmemeli

**Yapılacaklar:**
```javascript
// Error Boundary Component
- [ ] ErrorBoundary.js component'i oluştur
- [ ] API hatalarını yakala ve kullanıcıya göster
- [ ] Offline modda son bilinen fiyatları göster
- [ ] Network durumunu kontrol et (NetInfo)
- [ ] Retry mekanizması ekle

// Loading States
- [ ] PortfolioContext'e isLoading, isRefreshing flag'leri ekle
- [ ] Skeleton loading screen'ler ekle
- [ ] Pull-to-refresh özelliği ekle
```

---

### 5. 📊 Kar/Zarar Hesaplama Doğrulaması

**Mevcut Durum:** ✅ Ortalama alış fiyatı doğru hesaplanıyor

**İleride Yapılacaklar:**
- [ ] Gerçek zamanlı fiyat ile karşılaştırma
- [ ] Günlük/haftalık/aylık kar/zarar grafikleri
- [ ] FIFO/LIFO muhasebe yöntemi (opsiyonel, gelişmiş)
- [ ] Vergi hesaplama modülü (Türkiye için)

---

### 6. 🧪 Test & Production Ayarları

**Yapılacaklar:**
```javascript
// config/environment.js
export const ENV = {
  isDevelopment: __DEV__,
  useMockData: __DEV__, // Geliştirmede mock, production'da gerçek API
  apiKeys: {
    coingecko: process.env.COINGECKO_API_KEY,
    yahoo: process.env.YAHOO_API_KEY,
    // ...
  }
};
```

- [ ] Environment değişkenleri (.env dosyası)
- [ ] Mock data flag'i ekle
- [ ] Production/Development ayırımı yap
- [ ] API key'leri güvenli şekilde sakla

---

## 🚀 API Entegrasyonu Sonrası Yapılacaklar

### 7. 📡 API Servisleri

**Kullanılabilecek API'ler:**
- **Kripto:** CoinGecko (ücretsiz), Binance API, CoinMarketCap
- **Hisse Senedi:** Yahoo Finance API, Alpha Vantage, Borsa İstanbul API
- **Döviz:** ExchangeRate-API, Fixer.io, TCMB API
- **Altın/Emtia:** MetalsAPI, Investing.com

**Servis Yapısı:**
```javascript
// services/priceService.js
export const fetchPrice = async (asset) => {
  const mapping = ASSET_API_MAPPING[asset.assetName];
  
  switch(mapping.provider) {
    case 'coingecko':
      return await fetchCoinGeckoPrice(mapping.id);
    case 'yahoo':
      return await fetchYahooPrice(mapping.symbol);
    case 'metals':
      return await fetchMetalsPrice(mapping.id);
    default:
      throw new Error('Unknown provider');
  }
};
```

- [ ] priceService.js oluştur
- [ ] Her API provider için fetch fonksiyonu yaz
- [ ] Rate limiting ekle
- [ ] Error handling ekle

---

### 8. 🔔 Bildirimler & Alarmlar

- [ ] Fiyat alarm sistemi (hedef fiyat)
- [ ] Günlük kar/zarar bildirimi
- [ ] Push notification entegrasyonu

---

### 9. 📈 Gelişmiş Özellikler

- [ ] Grafikler (react-native-chart-kit veya Victory)
- [ ] Portföy performans analizi
- [ ] Varlık karşılaştırma
- [ ] Export/Import (JSON, CSV)
- [ ] Portfolio paylaşma
- [ ] Dark mode

---

## 📝 Notlar

- Her adım için ayrı branch aç (feature/api-mapping, feature/caching, vb.)
- Test yazarak ilerle
- Dokümantasyonu güncelle
- Commit'leri küçük ve anlamlı tut

---

## ✅ Tamamlanan Görevler (Son Güncelleme: 30 Kasım 2025)

- [x] Modüler component yapısı (13 component)
- [x] Screen'leri modülerleştirme (-554 satır, %28.6 azalma)
- [x] Context API ile state management
- [x] AsyncStorage ile veri kalıcılığı
- [x] Para birimi dönüşüm altyapısı
- [x] ChartLegend layout düzeltmesi
- [x] TransactionItem renk ve fiyat düzeltmeleri
- [x] Varlık kartı tıklama bug fix
- [x] JSX yorum hatası düzeltmesi
