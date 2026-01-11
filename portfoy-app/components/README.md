# Components Klasörü

Bu klasör **yeniden kullanılabilir UI bileşenlerini** içerir.

## Amaç
Birden fazla ekranda kullanılacak küçük, bağımsız bileşenler burada tanımlanır.
Kod tekrarını önler ve bakımı kolaylaştırır.

## Planlanan Bileşenler

### 1. Header.js
```javascript
/**
 * Header.js - Özelleştirilebilir Üst Bar Bileşeni
 * 
 * AMAÇ: Ekranların üst kısmında kullanılacak başlık çubuğu
 * 
 * PROPS:
 * - title: Başlık metni
 * - leftIcon: Sol ikon (opsiyonel)
 * - rightIcon: Sağ ikon (opsiyonel)
 * - onLeftPress: Sol ikon tıklama fonksiyonu
 * - onRightPress: Sağ ikon tıklama fonksiyonu
 */
```

### 2. Button.js
```javascript
/**
 * Button.js - Özel Stil Button Bileşeni
 * 
 * AMAÇ: Uygulama genelinde tutarlı buton tasarımı
 * 
 * PROPS:
 * - title: Buton metni
 * - onPress: Tıklama fonksiyonu
 * - variant: 'primary' | 'secondary' | 'outline'
 * - disabled: Boolean (aktif/pasif)
 * - loading: Boolean (yükleniyor göstergesi)
 */
```

### 3. AssetCard.js
```javascript
/**
 * AssetCard.js - Varlık Kartı Bileşeni
 * 
 * AMAÇ: Dashboard'daki hızlı bakış kartları için tekrar kullanılabilir kart
 * 
 * PROPS:
 * - name: Varlık adı
 * - value: Değer (₺120.000)
 * - change: Değişim yüzdesi (+2.1%)
 * - icon: İkon bileşeni
 * - color: Kart rengi
 * - onPress: Tıklama fonksiyonu
 */
```

### 4. PortfolioChart.js
```javascript
/**
 * PortfolioChart.js - Portföy Dağılımı Grafiği
 * 
 * AMAÇ: SVG doughnut chart bileşeni
 * 
 * PROPS:
 * - data: Grafik verileri array [{name, value, percentage, color}]
 * - size: Grafik boyutu (px)
 * - centerText: Merkez metni
 * - showLegend: Legend göster/gizle
 */
```

### 5. Input.js
```javascript
/**
 * Input.js - Özel Stil Input Field
 * 
 * AMAÇ: Form inputları için tutarlı tasarım
 * 
 * PROPS:
 * - label: Üst etiket
 * - placeholder: Yer tutucu metin
 * - value: Input değeri
 * - onChangeText: Değişim fonksiyonu
 * - type: 'text' | 'number' | 'email' | 'password'
 * - error: Hata mesajı
 */
```

## Kullanım Örneği

```javascript
// Bir ekranda component kullanımı
import Header from '../components/Header';
import Button from '../components/Button';
import AssetCard from '../components/AssetCard';

export default function MyScreen() {
  return (
    <View>
      <Header 
        title="Başlık" 
        leftIcon={<BackIcon />}
        onLeftPress={() => navigation.goBack()}
      />
      
      <AssetCard
        name="Altın"
        value="₺120.000"
        change="+2.1%"
        color="#FFD700"
        onPress={() => console.log('Kart tıklandı')}
      />
      
      <Button
        title="Kaydet"
        variant="primary"
        onPress={handleSave}
      />
    </View>
  );
}
```

## Dosya İsimlendirme
- PascalCase kullanın: `Button.js`, `AssetCard.js`
- Export default kullanın: `export default function Button() { ... }`

## Stil Yönetimi
- Her component kendi styles'ını içerir
- Renkler `constants/theme.js`'den import edilir
- Props ile özelleştirilebilir olmalı

## Bağımsızlık Prensibi
Her component:
- Tek başına çalışabilmeli
- Dış bağımlılığı minimum olmalı
- Test edilebilir olmalı
- Dokümante edilmiş olmalı
