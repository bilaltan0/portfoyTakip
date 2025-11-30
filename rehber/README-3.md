# 3. Sohbet Rehberi - Dashboard ve Navigation

Bu dosyada, 30 Kasım 2025 tarihli sohbet özelinde alınan kararlar, yaşanan teknik sorunlar ve çözümler özetlenmiştir.

## Yapılanlar

### 1. Teknik Kurulum ve Sorunlar
- Node.js v25.2.1 ve npm 11.6.2 kurulumu, PATH sorunları ve çözüm adımları
- Homebrew kurulumu ve alternatif Node.js yükleme yöntemleri
- VS Code'da birden fazla repo görünme sorunu çözüldü (portfoy-app içindeki .git klasörü silindi)
- Git, .git klasörü ve source control yönetimi
- Android Studio emülatör kurulumu ve yapılandırması

### 2. Paket Yönetimi ve Bağımlılıklar
**Kurulu Paketler:**
- `react-native-svg` - SVG grafik ve ikon desteği
- `@react-navigation/native` - Navigation temel paketi
- `@react-navigation/bottom-tabs` - Alt tab navigasyonu
- `@react-navigation/stack` - Stack navigasyonu (sorunlu, kaldırıldı)
- `react-native-safe-area-context` - SafeAreaView için
- `react-native-gesture-handler` - Touch gesture yönetimi

**Kaldırılan Paketler:**
- `react-native-reanimated` - Worklets bağımlılık hatası nedeniyle
- `react-native-screens` - Boolean cast hatası nedeniyle
- `@react-navigation/drawer` - Kullanılmadığı için

**Önemli Notlar:**
- Tüm paket kurulumları `--legacy-peer-deps` bayrağı ile yapıldı
- React 19.1.0 ve React DOM 19.2.0 sürüm uyuşmazlığı var (kritik değil)
- `babel.config.js` basit tutuldu, plugin'ler kullanılmadı

### 3. Dashboard Ekranı Geliştirme
- `feature/dashboard` branch'i oluşturuldu (dev branch'inden)
- Renk paleti belirlendi: 
  - Koyu Mavi (#004AAD) - Ana renk
  - Altın (#FFD700) - Vurgu rengi
  - Beyaz (#FFFFFF) - Arka plan
  - Yeşil (#1ABC9C) - Pozitif değişim
  - Kırmızı (#E74C3C) - Negatif değişim
  - Mavi tonları (#2563eb, #60a5fa, #93c5fd) - Chart segmentleri

### 4. Mobil Uygulama Arayüzü (App.js)
**Dashboard Ekranı Bileşenleri:**
- **Üst Header:** 
  - Sol: Ayarlar ikonu (TouchableOpacity + Alert)
  - Orta: "PortföyMate" başlığı
  - Sağ: Bildirimler ikonu (TouchableOpacity + Alert)
- **Portföy Özeti:** 
  - Toplam değer: ₺350.750,23 (altın renk, 32px)
  - Kar/Zarar: +₺25.300,50 +7.8% Son 30 Gün (yeşil renk)
- **Varlık Dağılımı:** 
  - SVG Doughnut Chart (180x180, 5 segment)
  - Merkezde toplam değer göstergesi
  - Sağda legend (renk dot + isim + yüzde)
- **Hızlı Bakış Kartları:** 
  - Yatay ScrollView
  - 4 kart: Altın, Kripto, Borsa, Döviz
  - Her kartta: Renkli ikon, isim, değer, 24s değişim

**Navigation Yapısı:**
- Bottom Tab Navigator (çalışıyor ✅)
  - Ana Sayfa → DashboardScreen
  - İşlem Yap → TransactionScreen (placeholder)
  - Detaylı Analiz → AnalysisScreen (placeholder)
  - Daha Fazla → MoreScreen (placeholder)
- Üst bar ikonları Alert ile çalışıyor (Stack Navigator yerine)

### 5. Tasarım ve Prototip
- HTML prototip dosyası oluşturuldu (index.html) - Tailwind CSS ile
- Tasarım promptu hazırlandı (Gemini/ChatGPT için görsel oluşturma)
- FinTech tasarım standartları: Minimalist, modern, güvenli

### 6. İkon Kaynakları
Mobil geliştirme için ikon siteleri belirlendi:
- **Expo Icons** (icons.expo.fyi) - Expo projeler için hazır
- **React Native Vector Icons** (oblador.github.io/react-native-vector-icons)
- **Heroicons** (heroicons.com), **Feather Icons** (feathericons.com)
- **Flaticon** (flaticon.com), **Iconify** (icon-sets.iconify.design)

## Yaşanan Teknik Sorunlar ve Çözümler

### Sorun 1: React Navigation "java.lang.String cannot be cast to java.lang.Boolean"
**Hata:** Stack Navigator kullanımında Java tip dönüşüm hatası
**Denenen Çözümler:**
1. `headerShown` boolean değerlerini kontrol ettik
2. `tabBarLabelStyle` kullanımını kaldırdık
3. `headerBackTitle` prop'unu kaldırdık
4. `StatusBar` style prop'unu kaldırdık
5. SafeAreaView'i react-native-safe-area-context'ten import ettik

**Nihai Çözüm:**
- `@react-navigation/stack` paketini kaldırdık
- `react-native-screens` paketini kaldırdık (sorunun kaynağıydı)
- `react-native-reanimated` paketini kaldırdık (worklets bağımlılığı yoktu)
- Sadece Bottom Tab Navigator kullanıyoruz
- Üst bar ikonları Alert ile çalışıyor (geçici çözüm)

### Sorun 2: PATH ve Node.js Kurulumu
**Çözüm:** Her terminal komutunda `export PATH="/opt/homebrew/bin:$PATH"` eklendi

### Sorun 3: Paket Sürüm Uyumsuzlukları
**Çözüm:** Tüm npm komutlarında `--legacy-peer-deps` bayrağı kullanıldı

## Önemli Kararlar
- Stack Navigator kullanmıyoruz (şimdilik Alert ile hallettik)
- react-native-screens paketi uyumsuz (Android'de sorun çıkarıyor)
- Minimal paket yaklaşımı benimsendi
- Navigation basit tutuldu, karmaşıklık azaltıldı

## Sonraki Adımlar
1. ✅ Dashboard ekranı tamamlandı
2. ✅ Bottom Tab Navigation çalışıyor
3. ✅ Üst bar ikonları Alert ile çalışıyor
4. ⏳ Ayarlar ve Bildirimler için gerçek ekranlar (Modal veya farklı yaklaşım)
5. ⏳ İkonları özelleştirme ve entegre etme
6. ⏳ Varlık detay sayfaları
7. ⏳ Varlık ekleme/düzenleme özellikleri
8. ⏳ API entegrasyonu

## Modüler Yapıya Geçiş (30 Kasım 2025)
Projeyi daha sürdürülebilir ve profesyonel hale getirmek için modüler yapıya geçtik:

### Yeni Klasör Yapısı
```
MobilUygulamaPortfoy/
├── portfoy-app/
│   ├── screens/              # Ekran bileşenleri
│   │   ├── DashboardScreen.js
│   │   ├── TransactionScreen.js
│   │   └── MoreScreen.js
│   ├── components/           # Yeniden kullanılabilir bileşenler (henüz boş)
│   ├── constants/            # Sabit değerler ve tema
│   │   └── theme.js
│   ├── App.js               # Sadece navigation container
│   ├── app.json             # Expo yapılandırması
│   ├── package.json         # Proje bağımlılıkları
│   ├── babel.config.js      # Babel yapılandırması
│   └── node_modules/        # Yüklü paketler
└── rehber/
    ├── README.md
    ├── README-2.md
    └── README-3.md
```

### Dosya ve Klasör Açıklamaları

#### 📁 `/screens` - Ekran Bileşenleri
**Amaç:** Her bir ekranın (sayfa) tam kodunu içerir. Her ekran kendi styles, layout ve logic'ini içerir.

**Dosyalar:**
- `DashboardScreen.js` - Ana ekran
  - Header (Ayarlar ve Bildirim ikonları)
  - Portföy özeti (toplam değer, kar/zarar)
  - SVG Doughnut chart (varlık dağılımı)
  - Hızlı bakış kartları (Altın, Kripto, Borsa, Döviz)
  - Tüm styles bu dosyanın içinde
  
- `TransactionScreen.js` - İşlem yapma ekranı (placeholder)
  - Varlık alım/satım işlemleri yapılacak
  
- `MoreScreen.js` - Daha fazla menüsü (placeholder)
  - Ayarlar, profil, yardım vb. bağlantılar

**Kullanım:** `App.js` bu ekranları import edip navigation'a bağlar.

#### 📁 `/components` - Yeniden Kullanılabilir Bileşenler
**Amaç:** Birden fazla ekranda kullanılacak küçük, bağımsız UI parçaları.

**Planlanan Bileşenler:**
- `Header.js` - Özelleştirilebilir header bileşeni
- `PortfolioChart.js` - SVG doughnut chart
- `AssetCard.js` - Hızlı bakış kartları (tekrar kullanılabilir)
- `Button.js` - Özel stil button
- `Input.js` - Özel stil input field

**Avantajı:** 
- Kod tekrarını önler
- Değişiklik tek yerden yapılır
- Test edilebilir, bağımsız parçalar

#### 📁 `/constants` - Sabit Değerler
**Amaç:** Uygulama genelinde kullanılan değişmez değerler (renkler, yazı boyutları, API URL'leri vb.)

**Dosyalar:**
- `theme.js` - Renk paleti ve tema sabitleri
  ```javascript
  export const COLORS = {
    darkBlue: '#004AAD',   // Ana renk
    gold: '#FFD700',       // Vurgu rengi
    white: '#FFFFFF',      // Arka plan
    darkGray: '#333333',   // Metin
    green: '#1ABC9C',      // Pozitif değişim
    red: '#E74C3C',        // Negatif değişim
    blue1: '#2563eb',      // Chart segment 1
    blue2: '#60a5fa',      // Chart segment 2
    blue3: '#93c5fd'       // Chart segment 3
  }
  ```

**Planlanan Sabitler:**
- `API_URLS.js` - Backend endpoint'leri
- `FONTS.js` - Font aileleri ve boyutları
- `DIMENSIONS.js` - Standart boyutlar (padding, margin vb.)

**Avantajı:**
- Tasarım tutarlılığı
- Tek yerden tema değişikliği
- Renk/stil güncellemeleri kolay

#### 📄 `App.js` - Ana Uygulama Dosyası
**Amaç:** Sadece navigation yapısını yönetir. Ekranları import edip birbirine bağlar.

**İçeriği:**
- `NavigationContainer` - React Navigation wrapper
- `Tab.Navigator` - Alt tab navigation yapısı
- Screen import'ları
- Tab bar ikonları (SVG)
- Navigation konfigürasyonu

**Özellikler:**
- 78 satır - çok temiz ve okunabilir
- Hiç style kodu yok (hepsi screen'lerde)
- Sadece routing logic var

#### 📄 `app.json` - Expo Yapılandırma Dosyası
**Amaç:** Expo projesinin meta bilgileri ve yapılandırması.

**İçeriği:**
- Uygulama adı: `portfoy-app`
- Versiyon: `1.0.0`
- Yönelim: `portrait` (dikey)
- Platform ayarları:
  - iOS: iPad desteği
  - Android: Adaptive icon, edge-to-edge
  - Web: Favicon
- Asset path'leri (icon, splash screen)
- Yeni mimari: `newArchEnabled: true`

**Ne zaman değişir:**
- Uygulama adı değişirse
- Yeni permission eklenirse
- Platform-specific ayarlar gerekirse
- Icon/splash screen güncellenirse

#### 📄 `package.json` - Proje Bağımlılıkları
**Amaç:** Projenin kullandığı tüm npm paketlerini ve script'leri tanımlar.

**İçeriği:**
- **dependencies:** Çalışma zamanı paketleri
  - `expo`: Framework (v54.0.25)
  - `react`, `react-native`: Temel
  - `@react-navigation/*`: Navigation paketleri
  - `react-native-svg`: SVG desteği
  - `react-native-safe-area-context`: SafeArea
  
- **scripts:** Terminal komutları
  - `npm start`: Expo server başlat
  - `npm run android`: Android'de aç
  - `npm run ios`: iOS'ta aç
  - `npm run web`: Web'de aç

**Ne zaman değişir:**
- Yeni paket kurulunca: `npm install paket-adi`
- Paket kaldırılınca: `npm uninstall paket-adi`
- Script eklenince

### Modüler Yapının Avantajları

1. **Kod Organizasyonu** 📂
   - Her dosya tek bir sorumluluğa odaklanır
   - Dosyaları bulmak ve anlamak kolay

2. **Yeniden Kullanılabilirlik** ♻️
   - Components klasöründeki bileşenler her yerde kullanılabilir
   - Kod tekrarı olmaz

3. **Bakım Kolaylığı** 🔧
   - Hata düzeltmek kolay (hangi dosyada olduğu belli)
   - Yeni özellik eklemek hızlı

4. **Takım Çalışması** 👥
   - Farklı geliştiriciler farklı dosyalarda çalışabilir
   - Git conflict'leri azalır

5. **Test Edilebilirlik** ✅
   - Her component bağımsız test edilebilir
   - Mock data ile kolayca test

6. **Ölçeklenebilirlik** 📈
   - Proje büyüdükçe yapı bozulmaz
   - Yeni ekranlar/componentler kolayca eklenir

### Dosya İsimlendirme Kuralları

- **Screen dosyaları:** `PascalCase` + `Screen.js` soneki
  - Örnek: `DashboardScreen.js`, `SettingsScreen.js`
  
- **Component dosyaları:** `PascalCase` + `.js` uzantısı
  - Örnek: `Button.js`, `AssetCard.js`
  
- **Constants dosyaları:** `camelCase` + `.js` uzantısı
  - Örnek: `theme.js`, `apiUrls.js`
  
- **Klasörler:** `lowercase` (küçük harf)
  - Örnek: `screens/`, `components/`, `constants/`

### Import/Export Yapısı

**Screens (Default Export):**
```javascript
// DashboardScreen.js
export default function DashboardScreen() { ... }

// App.js
import DashboardScreen from './screens/DashboardScreen';
```

**Constants (Named Export):**
```javascript
// theme.js
export const COLORS = { ... }

// DashboardScreen.js
import { COLORS } from '../constants/theme';
```

**Components (Default Export - gelecekte):**
```javascript
// Header.js
export default function Header({ title }) { ... }

// DashboardScreen.js
import Header from '../components/Header';
```

## Dosya Yapısı (Eski)
```
MobilUygulamaPortfoy/
├── portfoy-app/
│   ├── App.js (Ana uygulama - Dashboard + Navigation)
│   ├── babel.config.js (Basit Babel config)
│   ├── package.json (Bağımlılıklar)
│   ├── index.html (HTML prototip - Tailwind CSS)
│   └── node_modules/
└── rehber/
    ├── README.md (Genel proje bilgisi)
    ├── README-2.md (İlk sohbet notları)
    └── README-3.md (Bu dosya - 30 Kasım 2025)
```

---
**Durum:** Dashboard ekranı Android Studio emülatöründe başarıyla çalışıyor! Bottom Tab Navigation aktif, üst bar ikonları Alert ile çalışıyor. 🎉
