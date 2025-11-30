# Transaction Screen Geliştirme Rehberi

## 📅 Tarih: 30 Kasım 2025
## 🌿 Branch: feature/transaction
## 👤 Geliştirici: Bilal Seyma

---

## 🎯 Amaç
Transaction (İşlem) ekranının geliştirilmesi. Kullanıcıların varlık alım/satım işlemlerini yapabilmesi ve işlem geçmişini görüntüleyebilmesi.

---

## 📊 Önceki Durum (feature/dashboard'dan gelen)

### ✅ Tamamlanan:
- Dashboard ekranı (portfolio özeti, grafik, varlık kartları)
- Tab Navigation (Home, Transaction, More)
- 9 adet icon component (Lucide SVG)
- Theme constants (renkler, spacing)
- Mock varlık verileri

### 🔄 Git Workflow:
```bash
feature/dashboard → dev (merged)
dev → feature/transaction (yeni branch)
```

---

## 🚀 Transaction Screen Özellikleri

### 📌 Proje Gereksinimlerine Göre:
**Takip Edilecek Varlıklar**: Altın, Kripto, Borsa, Döviz  
**Dil Desteği**: Türkçe ve İngilizce  
**Portföy Yapısı**: Ana varlıklar > Alt portföyler (esnek, isimlendirilebilir)

### 1. İşlem Ekleme Formu
- **Ana Varlık Seçimi**: Dropdown (Altın, Kripto, Borsa, Döviz)
- **Alt Portföy/Kategori**: Dropdown (ör. Borsa > Halka Arz / Normal Hisse)
  - Kullanıcı kendi kategorilerini oluşturabilir
  - Kategori isimleri özelleştirilebilir
- **Varlık Adı**: Text input (ör. Bitcoin, Gram Altın, Apple Hisse)
- **İşlem Türü**: Alış / Satış (Toggle/Button)
- **Adet/Miktar**: Number input
- **Birim Fiyat**: Number input (maliyet)
- **Para Birimi**: Dropdown (TL, USD, EUR, etc.)
- **Tarih**: Date picker
- **Not**: Optional text area

### 2. İşlem Listesi
- Son işlemler görünümü
- Tarih, varlık adı, ana kategori, alt kategori
- Miktar, birim fiyat, toplam değer
- Kar/Zarar gösterimi (anlık fiyat - maliyet)
- Swipe to delete
- Filter by kategori

### 3. Data Management
- **Context API**: Global state management
- **AsyncStorage**: Local persistence
- **Data Structure**: 
  ```javascript
  {
    id: uuid,
    mainCategory: 'Kripto', // Altın, Kripto, Borsa, Döviz
    subCategory: 'Long-term', // Kullanıcı tanımlı
    assetName: 'Bitcoin',
    type: 'buy' | 'sell',
    quantity: 0.5,
    unitPrice: 50000,
    currency: 'USD',
    date: '2025-11-30',
    note: 'optional'
  }
  ```

---

## 🗂️ Dosya Yapısı

```
portfoy-app/
├── screens/
│   ├── DashboardScreen.js ✅
│   ├── TransactionScreen.js 🆕 (geliştirilecek)
│   └── MoreScreen.js ✅
├── components/
│   ├── icons/ ✅
│   ├── TransactionForm.js 🆕
│   ├── TransactionList.js 🆕
│   └── TransactionItem.js 🆕
├── context/
│   └── PortfolioContext.js 🆕
├── utils/
│   └── storage.js 🆕 (AsyncStorage helper)
└── constants/
    └── theme.js ✅
```

---

## 📝 Adımlar

### ✅ Adım 1: Git Workflow Kurulumu
```bash
git checkout dev
git pull origin dev
git merge feature/dashboard
git push origin dev
git checkout -b feature/transaction
```
**Durum**: ✅ Tamamlandı

### 🔄 Adım 2: README Dokümantasyonu
- [x] README-4-transaction-screen.md oluştur
- [x] Proje gereksinimlerini README.md'den oku
- [x] Transaction screen planını gereksinimlere göre güncelle
- [ ] Commit: "docs: add transaction screen documentation"

### 🔄 Adım 3: Data Structure & Context API
- [ ] `context/PortfolioContext.js` oluştur
- [ ] State yapısı:
  - `transactions[]`: Tüm işlemler
  - `assets{}`: Kategori bazlı varlıklar
  - `categories{}`: Ana ve alt kategoriler
  - `totalValue`: Toplam portföy değeri
- [ ] Actions:
  - `addTransaction()`
  - `deleteTransaction()`
  - `addCategory()` - Yeni alt kategori ekleme
  - `updateAssetPrice()` - API entegrasyonu için
- [ ] Provider'ı App.js'e ekle
- [ ] AsyncStorage integration

### 🔄 Adım 4: Category Management
- [ ] `components/CategoryPicker.js` - Ana kategori seçici
- [ ] `components/SubCategoryPicker.js` - Alt kategori seçici
- [ ] `components/AddCategoryModal.js` - Yeni kategori ekleme
- [ ] Kategori isimlendirme (Türkçe/İngilizce)
- [ ] Kategori silme/düzenleme

### 🔄 Adım 5: TransactionForm Component
- [ ] Ana varlık seçimi (Altın, Kripto, Borsa, Döviz)
- [ ] Alt kategori seçimi / yeni kategori ekleme
- [ ] Varlık adı input
- [ ] İşlem türü toggle (Alış/Satış)
- [ ] Miktar ve birim fiyat input
- [ ] Para birimi seçimi (TL, USD, EUR)
- [ ] Tarih seçici
- [ ] Not alanı
- [ ] Form validation
- [ ] Submit handler

### 🔄 Adım 6: TransactionList Component
- [ ] FlatList ile işlem listesi
- [ ] `TransactionItem.js` komponenti
  - Varlık adı, kategori, miktar
  - Birim fiyat, toplam değer
  - Kar/Zarar gösterimi
- [ ] Filter by kategori
- [ ] Sort by tarih
- [ ] Swipe to delete
- [ ] Empty state (işlem yok)

### 🔄 Adım 7: AsyncStorage Integration
- [ ] `utils/storage.js` helper
  - `saveTransactions()`
  - `loadTransactions()`
  - `saveCategories()`
  - `loadCategories()`
- [ ] App başlangıcında veri yükleme
- [ ] Otomatik kaydetme (her değişiklikte)
- [ ] Error handling

### 🔄 Adım 8: Dashboard Integration
- [ ] Context'ten veri çekme
- [ ] Gerçek verilerle grafik güncelleme
- [ ] Yüzdelik dağılım hesaplama (ana kategori bazlı)
- [ ] Alt kategori dağılımları (detay gösterim)
- [ ] Mock data kaldırma
- [ ] Toplam portföy değeri hesaplama

### 🔄 Adım 9: Çoklu Dil Desteği (i18n)
- [ ] `i18n` kütüphanesi kurulumu
- [ ] Türkçe ve İngilizce dil dosyaları
- [ ] Form label'ları çeviri
- [ ] Kategori isimlerini çeviri
- [ ] Dil değiştirme ayarı (More Screen'de)

### 🔄 Adım 10: Testing & Refinement
- [ ] Form validasyonu test
- [ ] Kategori ekleme/silme test
- [ ] İşlem ekleme/silme test
- [ ] Dashboard güncellenmesi test
- [ ] AsyncStorage save/load test
- [ ] UI/UX iyileştirmeleri

---

## 🎨 UI/UX Tasarım

### Renk Paleti (theme.js'den):
```javascript
COLORS = {
  primary: '#004AAD',      // Mavi
  gold: '#FFD700',         // Altın
  indigo: '#6366F1',       // Kripto
  green: '#10B981',        // Borsa
  orange: '#F59E0B',       // Döviz
  background: '#F8FAFC',
  text: '#1E293B',
}
```

### Form Stili:
- Input fields: Beyaz arka plan, border radius 12
- Buttons: Gradient (opsiyonel) veya solid color
- Spacing: theme.SPACING kullan
- Typography: theme.TYPOGRAPHY kullan

---

## 🧪 Test Senaryoları

1. ✅ Form validasyonu (boş alanlar)
2. ✅ İşlem ekleme (başarılı)
3. ✅ İşlem listeleme
4. ✅ İşlem silme
5. ✅ AsyncStorage save/load
6. ✅ Dashboard güncellenmesi

---

## 📦 Kullanılacak Paketler

```json
{
  "@react-native-async-storage/async-storage": "^1.x",
  "@react-native-community/datetimepicker": "^7.x" (opsiyonel),
  "react-native-picker-select": "^8.x" (dropdown için)
}
```

---

## 🔗 İlgili Commitler

- `feat: setup transaction screen structure`
- `feat: add PortfolioContext with AsyncStorage`
- `feat: create TransactionForm component`
- `feat: create TransactionList component`
- `feat: integrate transaction data with Dashboard`

---

## 📚 Öğrenilen Konseptler

1. **Context API**: Global state management
2. **AsyncStorage**: Local data persistence
3. **Form Handling**: Input validation, state management
4. **Component Composition**: Form, List, Item ayrımı
5. **Git Workflow**: Feature branching, merging

---

## 🐛 Karşılaşılan Sorunlar ve Çözümler

### Problem 1: FONTS Undefined Hatası
**Açıklama:** PortfolioSelector componentinde `FONTS.h4` kullanıldı ama `theme.js`'den FONTS export edilmiyordu.
```
TypeError: Cannot read property 'h4' of undefined
```
**Çözüm:** 
- `constants/theme.js` dosyasına `FONTS` ve `SIZES` objeleri eklendi
- `FONTS.h3`, `FONTS.h4`, `FONTS.body4` tanımlandı
- Export listesine eklendi: `export const FONTS = { ... }`

### Problem 2: PortfolioSelector Görünmezlik Sorunu
**Açıklama:** Dashboard header'da portfolio selector componenti beyaz arka plana sahip olduğu için beyaz metin görünmüyordu.
**Çözüm:**
- `PortfolioSelector.js` stil güncellendi
- Arka plan: `rgba(255,255,255,0.2)` → `#F0F4FF` (açık mavi)
- Metin rengi: `COLORS.white` → `COLORS.darkBlue` (koyu mavi)
- Kontrast sorunu çözüldü

### Problem 3: Header Kalabalığı
**Açıklama:** Dashboard header'da hem uygulama ismi, hem portfolio selector, hem para birimi, hem ayarlar ikonu vardı. Görsel olarak çok kalabalık görünüyordu.
**Çözüm:**
- Ayarlar ikonu header'dan kaldırıldı
- MoreScreen ekranı yeniden tasarlandı
- Ayarlar menü sistemi oluşturuldu (Ayarlar, Yardım, Hakkında, Verileri Temizle)
- 3 yeni icon component eklendi (TrashIcon, HelpCircleIcon, InfoIcon)

### Problem 4: Header Layout Optimizasyonu
**Açıklama:** İlk olarak portfolio selector ortalanmış dikey layout denendi ama beğenilmedi.
**Çözüm:**
- Horizontal layout'a geri dönüldü
- 3 kolonlu yapı: Sol (Uygulama Adı), Orta (Portfolio Selector), Sağ (Para Birimi)
- Uygulama adı font size küçültüldü: `18px` → `16px`
- Portfolio selector bold yapıldı: `fontWeight: '700'`
- Dengeli görünüm sağlandı

---

## 🎨 Yapılan UI/UX İyileştirmeleri

### 1. Theme Sistemi Genişletildi
```javascript
// constants/theme.js
export const FONTS = {
  h3: { fontSize: 20, fontWeight: '700' },
  h4: { fontSize: 16, fontWeight: '600' },
  body4: { fontSize: 14, fontWeight: '400' },
};
export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
};
// Yeni renkler eklendi:
lightPrimary: '#F0F4FF',
primary: '#004AAD',
dark: '#1E293B',
gray: '#64748B',
danger: '#EF4444',
```

### 2. PortfolioSelector Stili
```javascript
// components/PortfolioSelector.js
selectorButton: {
  backgroundColor: '#F0F4FF',    // Açık mavi arka plan
  minWidth: 140,
  maxWidth: 180,
  // ...
}
selectorText: {
  color: COLORS.darkBlue,        // Koyu mavi metin
  fontSize: 16,
  fontWeight: '700',
}
```

### 3. DashboardScreen Header Layout
```javascript
// screens/DashboardScreen.js
<View style={styles.header}>
  <Text style={styles.headerTitle}>PortföyMate</Text>  // Sol - 16px
  <PortfolioSelector />                                 // Orta - 16px bold
  <TouchableOpacity style={styles.currencyButton}>     // Sağ
    <Text style={styles.currencyText}>₺ TRY</Text>
  </TouchableOpacity>
</View>

// Stiller:
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 56,
  paddingHorizontal: 16,
}
headerTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.white,
}
```

### 4. MoreScreen Menu Sistemi
```javascript
// screens/MoreScreen.js
const menuItems = [
  {
    id: 'settings',
    title: 'Ayarlar',
    description: 'Uygulama ayarları ve tercihler',
    icon: SettingsIcon,
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  },
  {
    id: 'help',
    title: 'Yardım & SSS',
    description: 'Sık sorulan sorular ve destek',
    icon: HelpCircleIcon,
    color: '#0891B2',
    bgColor: '#ECFEFF',
  },
  {
    id: 'about',
    title: 'Hakkında',
    description: 'Uygulama bilgileri ve sürüm',
    icon: InfoIcon,
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    id: 'debug',
    title: 'Verileri Temizle',
    description: 'Tüm portföy verilerini sıfırla',
    icon: TrashIcon,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    danger: true,
  },
];
```

### 5. Yeni Icon Componentler
- **`components/icons/TrashIcon.js`**: Çöp kutusu ikonu (Verileri Temizle)
- **`components/icons/HelpCircleIcon.js`**: Yardım ikonu (Yardım & SSS)
- **`components/icons/InfoIcon.js`**: Bilgi ikonu (Hakkında)
- **`components/icons/index.js`**: Export listesine eklendi

---

## 🔄 Context API İyileştirmeleri

### Migration Kodu Eklendi
```javascript
// context/PortfolioContext.js
// Eski tek portföy yapısından yeni multi-portfolio yapısına geçiş
const oldTransactions = await AsyncStorage.getItem('@portfolio_transactions');
if (oldTransactions && !storedPortfolios) {
  const migratedPortfolios = [
    {
      id: '1',
      name: 'Ana Portföy',
      transactions: JSON.parse(oldTransactions),
    },
  ];
  await AsyncStorage.setItem('@portfolios', JSON.stringify(migratedPortfolios));
  await AsyncStorage.removeItem('@portfolio_transactions');
  setPortfolios(migratedPortfolios);
}
```

### clearAllData Fonksiyonu Güncellendi
```javascript
const clearAllData = async () => {
  setPortfolios([
    {
      id: '1',
      name: 'Ana Portföy',
      transactions: [],
    },
  ]);
  setActivePortfolioId('1');
  await AsyncStorage.removeItem('@portfolios');
  await AsyncStorage.removeItem('@active_portfolio');
};
```

---

## 📈 Sonraki Adımlar

1. ✅ More Screen geliştirme - **TAMAMLANDI**
2. Settings ekranı detaylandırma (Stack Navigator)
3. Yardım & SSS içeriği ekleme
4. Hakkında ekranı bilgileri
5. API entegrasyonu
6. Real-time data sync
7. Çoklu dil desteği (i18n)

---

## 📝 Notlar

- ✅ Multi-portfolio UI tasarımı tamamlandı
- ✅ Header layout optimize edildi (3 iterasyon)
- ✅ MoreScreen menu sistemi oluşturuldu
- ✅ 3 yeni custom icon eklendi
- ✅ FONTS ve SIZES theme'e eklendi
- ✅ Migration kodu ile eski veriler korundu
- Transaction Screen core feature olduğu için öncelikli
- Form validation önemli (miktar > 0, tarih geçerli, vs.)
- AsyncStorage için error handling ekle
- Context API ile Dashboard otomatik güncellenecek

---

## 📂 Değiştirilen/Eklenen Dosyalar

### Değiştirilen:
1. `constants/theme.js` - FONTS, SIZES, yeni renkler
2. `components/PortfolioSelector.js` - Stil güncellemesi (görünürlük)
3. `screens/DashboardScreen.js` - Header layout optimizasyonu
4. `screens/MoreScreen.js` - Komple yeniden tasarım
5. `context/PortfolioContext.js` - Migration kodu, clearAllData fix
6. `components/icons/index.js` - Yeni icon exportları

### Yeni Eklenen:
1. `components/icons/TrashIcon.js`
2. `components/icons/HelpCircleIcon.js`
3. `components/icons/InfoIcon.js`

---

**Son Güncelleme:** 1 Ocak 2025  
**Durum:** � Multi-Portfolio UI Tamamlandı  
**Branch:** feature/dashboard  
**Önceki README:** README-3.md (Dashboard & Icons)
**Sonraki README:** README-5.md (Transaction Form Implementation)
