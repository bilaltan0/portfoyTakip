# 🎯 Feature: Kullanıcı Tanımlı Alt Kategori Sistemi

**Branch:** `feature/custom-asset-subcategories`  
**Tarih:** 11 Ocak 2026  
**Durum:** 🚧 Development

---

## 📋 ÖZELLİK TANIMI

Kullanıcıların **her varlık kategorisi** (Borsa, Altın, Kripto, Döviz) için **kendi alt kategorilerini oluşturabilmesi** ve yatırımlarını bu alt kategorilere göre **hedef oranlarla** yönetebilmesi.

### Örnek Kullanım Senaryoları:

**Borsa için:**
- 🆕 Halka Arz Hisseleri (%15)
- 📈 Büyüme Hisseleri (%35)
- 💰 Temettü Hisseleri (%50)

**Kripto için:**
- 🔵 Layer 1 (%60)
- 🟣 DeFi Tokens (%30)
- 🟢 Stablecoin (%10)

**Altın için:**
- 💍 Takı Amaçlı (%30)
- 💰 Yatırım Amaçlı (%70)

**Döviz için:**
- 💪 Güçlü Para (USD, EUR, CHF) (%70)
- 🌏 Gelişen Piyasalar (%30)

---

## 🎨 KULLANICI DENEYİMİ

### 1. Alt Kategori Oluşturma

```
Ayarlar → Varlık Kategorileri
├─ 📊 Borsa
│   ├─ [+] Alt Kategori Ekle
│   ├─ 🆕 Halka Arz Hisseleri (Kullanıcı oluşturdu)
│   ├─ 📈 Büyüme Hisseleri
│   └─ 💰 Temettü Hisseleri
│
├─ 🥇 Altın
│   ├─ [+] Alt Kategori Ekle
│   ├─ 💍 Takı Amaçlı (Kullanıcı oluşturdu)
│   └─ 💰 Yatırım Amaçlı
│
├─ 💎 Kripto
│   ├─ [+] Alt Kategori Ekle
│   ├─ 🔵 Layer 1
│   ├─ 🟣 DeFi Tokens
│   └─ 🟢 Stablecoin
│
└─ 💵 Döviz
    ├─ [+] Alt Kategori Ekle
    ├─ 🇺🇸 Dolar Bazlı
    └─ 🇪🇺 Euro Bazlı
```

### 2. Kategori Oluşturma Modal

```
┌─────────────────────────────────┐
│  Yeni Alt Kategori Oluştur      │
├─────────────────────────────────┤
│  Ana Kategori: 📊 Borsa (fixed) │
│                                  │
│  Kategori Adı:                  │
│  [Halka Arz Hisseleri_________] │
│                                  │
│  İkon Seç:                      │
│  [🆕] [📈] [💰] [🎯] [🔥] ...   │
│                                  │
│  Renk Seç:                      │
│  [🔵] [🟣] [🟢] [🔴] [🟡] ...   │
│                                  │
│  Hedef Oran: %[15____]          │
│  (Bu kategorinin Borsa içindeki │
│   hedef payı)                   │
│                                  │
│  [İptal]        [Oluştur]       │
└─────────────────────────────────┘
```

### 3. Varlık Atama

```
Dashboard → Borsa Detay → THYAO (Türk Hava Yolları)

┌─────────────────────────────────┐
│  THYAO - 150 adet               │
├─────────────────────────────────┤
│  Alt Kategori:                  │
│  [▼ Kategori Seç___________]    │
│     • Kategori Yok (varsayılan) │
│     • 🆕 Halka Arz              │
│     • 📈 Büyüme                 │
│     • 💰 Temettü                │
│                                  │
│  [Kaydet]                        │
└─────────────────────────────────┘
```

### 4. Dashboard'da Görüntüleme

```
BORSA (50%) ₺143,250  [▼]
├─ 🆕 Halka Arz (15%) → ₺21,487
│   ├─ Progress: ████░░░░░░ 15% (Hedefe ulaştı ✅)
│   └─ Varlıklar: KONTR, TKNSA
│
├─ 📈 Büyüme (35%) → ₺50,137
│   ├─ Progress: ██████████ 40% (5% fazla ⚠️)
│   └─ Varlıklar: THYAO, ASELS
│
├─ 💰 Temettü (50%) → ₺60,000
│   ├─ Progress: ███████░░░ 42% (8% eksik ❌)
│   └─ Varlıklar: EREGL, TUPRS
│
└─ Kategorisiz (0%) → ₺11,626
    └─ Henüz kategoriye atanmamış varlıklar
```

---

## 📊 VERİ MODELİ

### SubCategory Schema

```javascript
const SubCategorySchema = {
  id: 'uuid-v4',                      // Benzersiz ID
  name: 'Halka Arz Hisseleri',        // Kullanıcı tanımlı isim
  parentCategory: 'Borsa',            // Ana kategori (Altın, Borsa, Kripto, Döviz)
  icon: '🆕',                         // Emoji (kullanıcı seçer)
  color: '#3B82F6',                   // Hex color (kullanıcı seçer)
  targetPercentage: 15,               // Hedef oran (0-100)
  assets: [                           // Bu kategoriye atanan varlıklar
    {
      assetName: 'KONTR',
      addedAt: '2026-01-11'
    },
    {
      assetName: 'TKNSA',
      addedAt: '2026-01-11'
    }
  ],
  createdAt: '2026-01-11',
  updatedAt: '2026-01-11'
};
```

### AsyncStorage Yapısı

```javascript
const StorageStructure = {
  // Alt kategoriler listesi
  '@portfolio_subcategories': [
    {
      id: 'sub-1',
      name: 'Halka Arz',
      parentCategory: 'Borsa',
      icon: '🆕',
      color: '#3B82F6',
      targetPercentage: 15,
      assets: ['KONTR', 'TKNSA', 'SMRTG']
    },
    {
      id: 'sub-2',
      name: 'Büyüme',
      parentCategory: 'Borsa',
      icon: '📈',
      color: '#8B5CF6',
      targetPercentage: 35,
      assets: ['THYAO', 'ASELS']
    },
    {
      id: 'sub-3',
      name: 'Layer 1',
      parentCategory: 'Kripto',
      icon: '🔵',
      color: '#F59E0B',
      targetPercentage: 60,
      assets: ['Bitcoin', 'Ethereum', 'Solana']
    }
  ],
  
  // İşlem - Alt Kategori eşleştirmesi
  '@portfolio_transaction_subcategory_mapping': {
    'transaction-uuid-1': 'sub-1',  // Bu işlem "Halka Arz" kategorisine ait
    'transaction-uuid-2': 'sub-2',  // Bu işlem "Büyüme" kategorisine ait
  }
};
```

---

## 🛠️ DOSYA YAPISI

```
portfoy-app/
├─ context/
│   └─ SubCategoryContext.js (YENİ)
│
├─ models/
│   └─ SubCategory.js (YENİ)
│
├─ screens/
│   ├─ SubCategoryManagerScreen.js (YENİ) - Kategori yönetim ekranı
│   ├─ SubCategoryCreateModal.js (YENİ) - Yeni kategori oluşturma
│   └─ AssetAllocationScreen.js (YENİ) - Dashboard detay görünümü
│
├─ components/
│   ├─ SubCategoryCard.js (YENİ) - Kategori kartı
│   ├─ SubCategoryPicker.js (YENİ) - Varlık atama dropdown
│   ├─ AllocationProgressBar.js (YENİ) - Hedef/Gerçek progress bar
│   └─ EmojiPicker.js (YENİ) - Emoji seçici
│
├─ utils/
│   ├─ subCategoryCalculations.js (YENİ) - Hesaplama mantığı
│   └─ subCategoryStorage.js (YENİ) - AsyncStorage operations
│
└─ constants/
    └─ defaultIcons.js (YENİ) - Hazır emoji seti
```

---

## 📋 İMPLEMENTASYON PLANI

### ✅ Phase 1: Data Layer (Gün 1)

**Dosyalar:**
- [x] Branch oluşturuldu: `feature/custom-asset-subcategories`
- [ ] `models/SubCategory.js` - Model tanımı
- [ ] `utils/subCategoryStorage.js` - Storage CRUD operations
- [ ] `context/SubCategoryContext.js` - Global state management

**Görevler:**
```javascript
// 1. SubCategory model tanımla
// 2. AsyncStorage read/write fonksiyonları
// 3. CRUD operations:
//    - createSubCategory(category)
//    - updateSubCategory(id, updates)
//    - deleteSubCategory(id)
//    - getSubCategoriesByParent(parentCategory)
// 4. Asset assignment:
//    - assignAssetToSubCategory(assetName, subCategoryId)
//    - removeAssetFromSubCategory(assetName)
```

**Başarı Kriterleri:**
- ✅ AsyncStorage'a kategori kaydedilebiliyor
- ✅ Kategoriler parent'a göre filtrelenebiliyor
- ✅ Varlıklar kategorilere atanabiliyor

---

### ✅ Phase 2: Calculation Engine (Gün 2)

**Dosyalar:**
- [ ] `utils/subCategoryCalculations.js`

**Fonksiyonlar:**
```javascript
// 1. calculateSubCategoryAllocation(transactions, prices, subCategories)
//    - Her alt kategori için gerçek değer ve yüzde hesapla
//    - Hedef ile gerçek arasındaki farkı bul
//    - Status belirle: 'on-track' | 'overweight' | 'underweight'

// 2. getRebalancingSuggestions(allocations, totalValue)
//    - Hangi kategoriden ne kadar alınmalı/satılmalı?
//    - Önceliklendirme: En büyük sapmadan başla

// 3. matchAssetToSubCategory(assetName, subCategories)
//    - Bir varlık hangi alt kategoriye ait?
//    - Kategorisiz varlıkları tespit et
```

**Başarı Kriterleri:**
- ✅ Alt kategoriler için doğru değer hesaplanıyor
- ✅ Hedef/gerçek karşılaştırması çalışıyor
- ✅ Rebalancing önerileri mantıklı

---

### ✅ Phase 3: Management UI (Gün 3-4)

**Dosyalar:**
- [ ] `screens/SubCategoryManagerScreen.js` - Ana yönetim ekranı
- [ ] `components/SubCategoryCreateModal.js` - Kategori oluşturma modal
- [ ] `components/SubCategoryCard.js` - Kategori kartı
- [ ] `components/EmojiPicker.js` - Emoji seçici
- [ ] `constants/defaultIcons.js` - Hazır emoji listesi

**Ekran Akışı:**
```
Daha Fazla → Varlık Kategorileri
  └─ SubCategoryManagerScreen
      ├─ Parent kategori seçimi (Tab bar)
      ├─ Alt kategori listesi
      ├─ [+ Yeni Kategori] butonu
      └─ Edit/Delete aksiyonları

Modal açılır:
  └─ SubCategoryCreateModal
      ├─ İsim input
      ├─ Emoji picker
      ├─ Color picker
      ├─ Target percentage slider
      └─ Kaydet butonu
```

**Başarı Kriterleri:**
- ✅ Kullanıcı yeni kategori oluşturabiliyor
- ✅ Mevcut kategorileri düzenleyebiliyor
- ✅ Kategorileri silebiliyor
- ✅ Emoji ve renk seçimi çalışıyor

---

### ✅ Phase 4: Asset Assignment (Gün 5)

**Dosyalar:**
- [ ] `components/SubCategoryPicker.js` - Dropdown component
- [ ] `screens/TransactionScreen.js` - Güncelleme (kategori seçimi ekle)
- [ ] `screens/AssetDetailScreen.js` - Güncelleme (kategori değiştirme)

**Özellikler:**
```
Transaction Screen'e ekle:
  └─ "Alt Kategori" dropdown
      ├─ Kategorisiz (default)
      ├─ Liste (parent kategoriye göre filtrelenmiş)
      └─ [+ Yeni Kategori] quick action

Asset Detail Screen'e ekle:
  └─ "Kategori Değiştir" butonu
      └─ SubCategoryPicker modal açar
```

**Başarı Kriterleri:**
- ✅ İşlem ekleme sırasında kategori seçilebiliyor
- ✅ Mevcut varlıkların kategorisi değiştirilebiliyor
- ✅ Kategorisiz varlıklar tespit ediliyor

---

### ✅ Phase 5: Visualization (Gün 6-7)

**Dosyalar:**
- [ ] `components/AllocationProgressBar.js` - Progress bar component
- [ ] `screens/AssetAllocationScreen.js` - Detay ekranı
- [ ] `screens/DashboardScreen.js` - Güncelleme (drill-down ekle)

**Dashboard Değişiklikleri:**
```
DoughnutChart'a tıklayınca:
  └─ AssetAllocationScreen açılır
      ├─ Ana kategori özet
      ├─ Alt kategoriler (expandable list)
      │   ├─ Progress bar (hedef vs gerçek)
      │   ├─ Değer ve yüzde
      │   └─ Varlık listesi
      └─ Rebalancing önerileri card
```

**Başarı Kriterleri:**
- ✅ Dashboard'da alt kategoriler görülebiliyor
- ✅ Progress bar'lar doğru çalışıyor
- ✅ Rebalancing önerileri gösteriliyor
- ✅ Drill-down akışı sorunsuz

---

## 🎯 TEKNİK DETAYLAR

### Hesaplama Algoritması

```javascript
// Örnek: Borsa kategorisi için hesaplama

const borsaTransactions = transactions.filter(t => t.mainCategory === 'Borsa');
const borsaTotalValue = calculateCategoryValue(borsaTransactions, prices);

// Alt kategoriler
const subCategories = [
  { id: 'sub-1', name: 'Halka Arz', targetPercentage: 15, assets: ['KONTR', 'TKNSA'] },
  { id: 'sub-2', name: 'Büyüme', targetPercentage: 35, assets: ['THYAO', 'ASELS'] },
  { id: 'sub-3', name: 'Temettü', targetPercentage: 50, assets: ['EREGL', 'TUPRS'] }
];

// Her alt kategori için
subCategories.map(sub => {
  // Bu kategoriye ait işlemleri filtrele
  const subTransactions = borsaTransactions.filter(t => 
    sub.assets.includes(t.assetName)
  );
  
  // Değeri hesapla
  const subValue = calculateCategoryValue(subTransactions, prices);
  
  // Gerçek yüzdeyi hesapla (Borsa içindeki payı)
  const actualPercentage = (subValue / borsaTotalValue) * 100;
  
  // Farkı bul
  const diff = actualPercentage - sub.targetPercentage;
  
  // Status belirle
  const status = Math.abs(diff) < 2 ? 'on-track' : 
                 diff > 0 ? 'overweight' : 'underweight';
  
  return {
    ...sub,
    actualValue: subValue,
    actualPercentage,
    difference: diff,
    status
  };
});
```

---

## 🧪 TEST SENARYOLARI

### Test 1: Kategori Oluşturma
```
1. Ayarlar → Varlık Kategorileri → Borsa
2. [+ Alt Kategori Ekle] tıkla
3. İsim: "Halka Arz", Emoji: 🆕, Renk: Mavi, Hedef: 15%
4. Kaydet
5. Kontrol: Liste'de görünüyor mu?
```

### Test 2: Varlık Atama
```
1. Dashboard → Borsa → THYAO detay
2. "Alt Kategori Seç" → "Büyüme" seç
3. Kaydet
4. Kontrol: THYAO artık "Büyüme" kategorisinde mi?
```

### Test 3: Progress Bar
```
1. Dashboard → Borsa (genişlet)
2. Kontrol: Alt kategoriler görünüyor mu?
3. Kontrol: Progress bar'lar doğru hesaplanmış mı?
4. Kontrol: Status ikonları (✅ ⚠️ ❌) doğru mu?
```

### Test 4: Rebalancing
```
1. Dashboard → Borsa detay
2. Kontrol: "Dengeleme Önerileri" kartı var mı?
3. Kontrol: Öneriler mantıklı mı?
   Örnek: "Büyüme kategorisinden 7,000₺ sat"
```

---

## 📱 NAVIGATION AKIŞI

```
MoreScreen (Daha Fazla)
  └─ [Varlık Kategorileri] menu item ekle
      └─ SubCategoryManagerScreen
          ├─ Tab Bar: [Altın] [Borsa] [Kripto] [Döviz]
          ├─ Alt kategori listesi (FlatList)
          │   └─ SubCategoryCard (her kategori için)
          │       ├─ İsim + İkon + Renk
          │       ├─ Hedef yüzde
          │       ├─ Varlık sayısı
          │       └─ [Düzenle] [Sil] butonları
          └─ [+] FAB (Floating Action Button)
              └─ SubCategoryCreateModal açar

DashboardScreen
  └─ DoughnutChart segment tıklama
      └─ AssetAllocationScreen (yeni ekran)
          ├─ Header: Kategori adı + toplam değer
          ├─ Alt kategoriler (Expandable)
          │   └─ SubCategoryCard (detaylı görünüm)
          │       ├─ AllocationProgressBar
          │       ├─ Varlık listesi
          │       └─ Değer/yüzde bilgileri
          └─ Rebalancing önerileri card
```

---

## 💾 MİGRATION PLANI

Mevcut kullanıcılar için veri taşıma:

```javascript
// Migration script
async function migrateToSubCategories() {
  // 1. Mevcut işlemleri oku
  const transactions = await loadData(STORAGE_KEYS.TRANSACTIONS);
  
  // 2. Yeni storage key'leri oluştur
  const subCategories = [];
  const mapping = {};
  
  // 3. Her işlem için kategorisiz olarak işaretle
  transactions.forEach(transaction => {
    mapping[transaction.id] = null; // Kategorisiz
  });
  
  // 4. Kaydet
  await saveData('@portfolio_subcategories', subCategories);
  await saveData('@portfolio_transaction_subcategory_mapping', mapping);
  
  console.log('✅ Migration completed: Sub-categories initialized');
}
```

---

## 🚀 ÖNEMLİ NOTLAR

### Performans Optimizasyonu
- Sub-category hesaplamaları **memoize** edilmeli
- FlatList'lerde `keyExtractor` ve `getItemLayout` kullan
- Progress bar animasyonları **60 FPS** tutmalı

### Kullanılabilirlik
- Kategori adı max 30 karakter
- Emoji picker: Sık kullanılan emoji'ler üstte
- Color picker: Hazır palet + custom color
- Target percentage: Slider + manuel input

### Hata Durumları
- Toplam hedef yüzde %100'ü aşarsa uyarı göster
- Kategori silinirken varlıkları "kategorisiz" yap
- Aynı isimde kategori varsa hata göster

### Accessibility
- Renk körü modu: İkonlar da kullan (sadece renk değil)
- Screen reader desteği
- Büyük font desteği

---

## 📝 COMMIT STRATEJİSİ

Her phase için ayrı commit:

```bash
# Phase 1
git add models/ utils/ context/
git commit -m "feat(subcategories): Add data layer and storage operations

- SubCategory model with schema validation
- AsyncStorage CRUD operations
- SubCategoryContext with global state
- Asset assignment functionality"

# Phase 2
git add utils/subCategoryCalculations.js
git commit -m "feat(subcategories): Add calculation engine

- Allocation percentage calculator
- Rebalancing suggestions algorithm
- Asset-to-category matching logic"

# Phase 3
git add screens/SubCategory* components/
git commit -m "feat(subcategories): Add management UI

- SubCategoryManagerScreen with CRUD
- Create/Edit modal with emoji & color picker
- SubCategoryCard component
- Default icons constant"

# Phase 4
git add screens/Transaction* screens/AssetDetail*
git commit -m "feat(subcategories): Add asset assignment UI

- SubCategoryPicker dropdown component
- Transaction screen integration
- Asset detail screen category change"

# Phase 5
git add components/Allocation* screens/AssetAllocation*
git commit -m "feat(subcategories): Add visualization and drill-down

- AllocationProgressBar with target/actual display
- AssetAllocationScreen with expandable subcategories
- Dashboard drill-down integration
- Rebalancing suggestions card"
```

---

## ✅ CHECKLIST

### Phase 1: Data Layer
- [ ] `models/SubCategory.js` oluşturuldu
- [ ] `utils/subCategoryStorage.js` oluşturuldu
- [ ] `context/SubCategoryContext.js` oluşturuldu
- [ ] CRUD operations test edildi
- [ ] AsyncStorage integration çalışıyor

### Phase 2: Calculations
- [ ] `utils/subCategoryCalculations.js` oluşturuldu
- [ ] Allocation hesaplama fonksiyonu test edildi
- [ ] Rebalancing algoritması test edildi
- [ ] Asset matching çalışıyor

### Phase 3: Management UI
- [ ] `SubCategoryManagerScreen` oluşturuldu
- [ ] `SubCategoryCreateModal` oluşturuldu
- [ ] Emoji picker çalışıyor
- [ ] Color picker çalışıyor
- [ ] CRUD operations UI'da test edildi

### Phase 4: Asset Assignment
- [ ] `SubCategoryPicker` component oluşturuldu
- [ ] TransactionScreen'e entegre edildi
- [ ] AssetDetailScreen'e entegre edildi
- [ ] Kategori değiştirme çalışıyor

### Phase 5: Visualization
- [ ] `AllocationProgressBar` oluşturuldu
- [ ] `AssetAllocationScreen` oluşturuldu
- [ ] Dashboard drill-down eklendi
- [ ] Rebalancing suggestions gösteriliyor

### Final
- [ ] Tüm test senaryoları geçti
- [ ] Migration script hazır
- [ ] Dökümantasyon tamamlandı
- [ ] PR oluşturuldu

---

**Son Güncelleme:** 11 Ocak 2026  
**Tahmini Tamamlanma:** 18 Ocak 2026 (7 gün)
