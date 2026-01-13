# 🎯 Feature: Kullanıcı Tanımlı Alt Kategori Sistemi

**Branch:** `feature/custom-asset-subcategories`  
**Başlangıç:** 11 Ocak 2026  
**Son Güncelleme:** 12 Ocak 2026  
**Durum:** 🚧 Development (Phase 3 Tamamlandı)

**Progress:** ████████████░░░░░░░░ 60% (3/5 Phase)

**Son Commit:** `268de8e` - Inline subcategory creation modal eklendi

---

## 📊 PHASE DURUMU

| Phase | Durum | Tamamlanma | Commit | Açıklama |
|-------|-------|------------|--------|----------|
| Phase 1: Data Layer | ✅ | %100 | 7e7e15f | Storage operations, CRUD, asset mapping |
| Phase 2: Calculation Engine | ✅ | %100 | b2eb3d7 | 9 calculation function, rebalancing logic |
| Phase 3: Inline UI | ✅ | %100 | 268de8e | TransactionScreen modal, emoji/color picker |
| Phase 4: Transaction Integration | ⏳ | %0 | - | handleSubmit'e alt kategori kaydetme |
| Phase 5: Dashboard Visualization | ⏳ | %0 | - | Progress bars, drill-down, target % |
| Phase 6: Management Screen | ⏸️ | %0 | - | Opsiyonel standalone yönetim ekranı |

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

### ✅ Phase 1: Data Layer (Gün 1) - TAMAMLANDI ✅

**Commit:** `7e7e15f`  
**Tarih:** 11 Ocak 2026

**Dosyalar:**
- ✅ Branch oluşturuldu: `feature/custom-asset-subcategories`
- ✅ `utils/subCategoryStorage.js` - Storage CRUD operations (197 satır)
- ✅ `context/PortfolioContext.js` - Global state entegrasyonu

**Tamamlanan Görevler:**
- ✅ SubCategory model tanımlandı (id, name, parentCategory, icon, color, targetPercentage, assets, timestamps)
- ✅ AsyncStorage CRUD operations: addSubCategory, updateSubCategory, deleteSubCategory, loadSubCategories
- ✅ Asset-to-subcategory mapping: assignAssetToSubCategory, removeAssetFromSubCategory, getAssetSubCategory
- ✅ Parent filtering: getSubCategoriesByParent
- ✅ Test data setup function: setupTestSubCategories

**Başarı Kriterleri:**
- ✅ AsyncStorage'a kategori kaydedilebiliyor
- ✅ Kategoriler parent'a göre filtrelenebiliyor
- ✅ Varlıklar kategorilere atanabiliyor

---

### ✅ Phase 2: Calculation Engine (Gün 2) - TAMAMLANDI ✅

**Commit:** `b2eb3d7`  
**Tarih:** 11 Ocak 2026

**Dosyalar:**
- ✅ `utils/subCategoryCalculations.js` (500+ satır, 9 fonksiyon)

**Tamamlanan Fonksiyonlar:**
1. ✅ `calculateSubCategoryAllocations` - Her alt kategori için gerçek değer ve yüzde hesaplama
2. ✅ `getRebalancingSuggestions` - Hangi kategoriden ne kadar alınmalı/satılmalı analizi
3. ✅ `getSubCategoryBreakdown` - Detaylı breakdown (değer, hedef, sapma, varlıklar)
4. ✅ `calculateDeviations` - Hedef/gerçek sapma hesaplama
5. ✅ `prioritizeRebalancing` - Rebalancing öncelik sıralaması
6. ✅ `getTopDeviations` - En büyük sapmalar
7. ✅ `formatRebalancingAction` - Önerilerin formatlanması
8. ✅ `getUnassignedAssets` - Kategorisiz varlıkları tespit etme
9. ✅ `getCategoryHealth` - Kategori sağlık durumu (on-track, overweight, underweight)

**Test Sonuçları:**
- ✅ Setup Test: 6 alt kategori başarıyla oluşturuldu
- ✅ Allocations Test: Gerçek değerler doğru hesaplandı
- ✅ Rebalancing Test: Mantıklı öneriler üretildi
- ✅ Breakdown Test: Detaylı analiz çalıştı

**Başarı Kriterleri:**
- ✅ Alt kategoriler için doğru değer hesaplanıyor
- ✅ Hedef/gerçek karşılaştırması çalışıyor
- ✅ Rebalancing önerileri mantıklı
- ✅ Sapma hesaplamaları doğru
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

### ✅ Phase 3: Inline Subcategory Creation (Gün 3-4) - TAMAMLANDI ✅

**Commit:** `268de8e`  
**Tarih:** 12 Ocak 2026

**Uygulanan Yaklaşım:**
Ayrı bir management screen yerine, **TransactionScreen'e inline modal** entegrasyonu yapıldı. Kullanıcı işlem yaparken kategoriden sonra alt kategori seçebilir veya anında yeni oluşturabilir.

**Dosyalar:**
- ✅ `screens/TransactionScreen.js` - Alt kategori dropdown ve modal eklendi
- ✅ `context/PortfolioContext.js` - createSubCategory ve refreshSubCategories eklendi

**Ekran Akışı:**
```
İşlem Yap Ekranı:
  1. Kategori seç (Altın, Kripto, Borsa, Döviz)
  2. Alt Kategori dropdown görünür:
     ├─ ❌ Atanmayacak (default)
     ├─ Alt Kategori 1 (chip)
     ├─ Alt Kategori 2 (chip)
     └─ [+ Yeni Oluştur] butonu
  3. "+ Yeni Oluştur" tıklanırsa modal açılır:
     ├─ Ana Kategori: Altın (fixed, gösterim)
     ├─ Kategori Adı: [Text Input]
     ├─ İkon Seç: [16 emoji grid]
     ├─ Renk Seç: [8 renk horizontal scroll]
     └─ [İptal] [Oluştur] butonları
  4. Oluşturulduktan sonra:
     ├─ Modal kapanır
     ├─ Yeni kategori otomatik seçilir
     └─ Success toast gösterilir
```

**Teknik Detaylar:**

**Modal Özellikleri:**
- **16 Emoji Seçeneği:** 📁, 🔷, 🏦, 💵, 💻, ✈️, 🏆, 🎯, 📊, 🔥, ⭐, 💎, 🏠, 🚗, 💰, 📈
- **8 Renk Paleti:** #3B82F6, #8B5CF6, #10B981, #F59E0B, #EF4444, #06B6D4, #EC4899, #6366F1
- **Validation:** Boş isim kontrolü, duplicate kategori kontrolü
- **UX:** Auto-select yeni kategori, toast notification

**Context Integration:**
```javascript
// PortfolioContext.js
const createSubCategory = async (subCategoryData) => {
  const { addSubCategory } = await import('../utils/subCategoryStorage');
  const newSubCategory = await addSubCategory(subCategoryData);
  await refreshSubCategories();
  return newSubCategory;
};

const refreshSubCategories = async () => {
  const { loadSubCategories } = await import('../utils/subCategoryStorage');
  const loaded = await loadSubCategories();
  setSubCategories(loaded);
};
```

**Düzeltilen Critical Bug:**
- ❌ **Hata:** `context/PortfolioContext.js` içinde `createSubCategory` import ediliyordu ama `subCategoryStorage.js` dosyası `addSubCategory` export ediyordu
- ✅ **Çözüm:** Import statement düzeltildi: `const { addSubCategory } = await import(...)`
- 🐛 **Sebep:** Dynamic import ile renamed destructuring, undefined function hatası veriyordu

**Başarı Kriterleri:**
- ✅ Kullanıcı işlem sırasında yeni kategori oluşturabiliyor
- ✅ Modal form validation çalışıyor (boş isim, duplicate kontrolü)
- ✅ Emoji ve renk seçimi çalışıyor
- ✅ Yeni kategori otomatik seçiliyor
- ✅ Success toast gösterimi yapılıyor
- ✅ Alt kategoriler parent'a göre filtreleniyor

**Kalan İşler (Phase 3 devamı):**
- [ ] Transaction kaydetme: Alt kategori atamasını transaction'a kaydet
- [ ] Edit mode: Mevcut transaction'ın alt kategorisini yükle ve göster
- [ ] Asset-to-subcategory mapping: Transaction save'de güncelle
- [ ] Standalone management screen (opsiyonel, Phase 5'e taşınabilir)

---

### 🔄 Phase 4: Transaction Integration (Gün 5)

**Dosyalar:**
- [ ] `screens/TransactionScreen.js` - handleSubmit güncelleme (alt kategori kaydetme)
- [ ] `utils/subCategoryStorage.js` - assignAssetToSubCategory kullanımı

**Özellikler:**
```javascript
// Transaction kaydetme sırasında:
const handleSubmit = async () => {
  // 1. Transaction'ı kaydet
  const newTransaction = await addTransaction({...});
  
  // 2. Eğer alt kategori seçildiyse ata
  if (selectedSubCategory) {
    await assignAssetToSubCategory(assetName, selectedSubCategory.id);
  }
  
  // 3. Navigation
  navigation.goBack();
};

// Edit mode sırasında:
useEffect(() => {
  if (editingTransaction?.subCategoryId) {
    // Mevcut kategorinin bilgisini yükle
    const existing = subCategories.find(sc => sc.id === editingTransaction.subCategoryId);
    setSelectedSubCategory(existing);
  }
}, [editingTransaction]);
```

**Başarı Kriterleri:**
- [ ] İşlem kaydedilirken alt kategori ataması yapılıyor
- [ ] Edit mode'da mevcut kategori yükleniyor
- [ ] Kategori değiştirildiğinde mapping güncelleniyor
- [ ] Asset-to-subcategory ilişkisi AsyncStorage'da kalıcı

---

### 📊 Phase 5: Dashboard Visualization & Target Percentages (Gün 6-7)

**Dosyalar:**
- [ ] `components/AllocationProgressBar.js` - Progress bar component
- [ ] `screens/SubCategoryDetailScreen.js` - Detay ekranı
- [ ] `screens/DashboardScreen.js` - Güncelleme (drill-down ekle)
- [ ] `screens/TransactionScreen.js` - Target percentage input ekle modal'a

**Özellikler:**

**1. Target Percentage Girişi:**
```
Modal güncelleme:
  ├─ Kategori Adı: [Text Input]
  ├─ İkon Seç: [Emoji grid]
  ├─ Renk Seç: [Color picker]
  └─ Hedef Oran: %[__] ← YENİ
      └─ "Bu kategorinin Borsa içindeki hedef payı"
```

**2. Dashboard Drill-Down:**
```
DashboardScreen → Kategori kartına tıkla:
  └─ SubCategoryDetailScreen açılır
      ├─ Ana kategori özet (Borsa toplam değer)
      ├─ Alt kategoriler (expandable list)
      │   ├─ Progress bar (hedef % vs gerçek %)
      │   │   └─ Renk: Yeşil (on-track), Kırmızı (off-track)
      │   ├─ Değer ve yüzde gösterimi
      │   ├─ Varlık listesi (chip format)
      │   └─ [Düzenle] butonu
      └─ Rebalancing önerileri card
          └─ "X TL Y kategorisinden Z kategorisine aktarın"
```

**3. Rebalancing Suggestions:**
```javascript
// Phase 2'deki calculation engine'i kullan
const suggestions = getRebalancingSuggestions(allocations, totalValue);

// Örnek çıktı:
[
  {
    from: 'DeFi Tokens',
    to: 'Layer 1',
    amount: 5000, // TRY
    reason: 'DeFi %35 (hedef %30), Layer 1 %55 (hedef %60)'
  }
]
```

**Başarı Kriterleri:**
- [ ] Target percentage modal'a eklendi
- [ ] Dashboard'da alt kategoriler görülebiliyor
- [ ] Progress bar'lar doğru çalışıyor (hedef/gerçek karşılaştırma)
- [ ] Rebalancing önerileri gösteriliyor
- [ ] Drill-down akışı sorunsuz
- [ ] Alt kategori düzenleme ekranı çalışıyor

---

### 🔧 Phase 6: Management & Editing (Opsiyonel)

**Dosyalar:**
- [ ] `screens/SubCategoryManagerScreen.js` - Standalone yönetim ekranı
- [ ] `components/SubCategoryEditModal.js` - Düzenleme modal

**Özellikler:**
```
Daha Fazla → Alt Kategori Yönetimi:
  ├─ Tab bar (Borsa, Kripto, Altın, Döviz)
  ├─ Alt kategori listesi
  │   ├─ Kategori kartı (isim, icon, renk, hedef %)
  │   ├─ Atanan varlık sayısı
  │   └─ [Düzenle] [Sil] butonları
  └─ [+ Yeni Kategori] FAB
```

**Başarı Kriterleri:**
- [ ] Tüm kategoriler tek ekranda yönetilebiliyor
- [ ] Bulk edit/delete yapılabiliyor
- [ ] Kategori silme işleminde varlık atamaları temizleniyor
- [ ] Overview analytics gösteriliyor

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
