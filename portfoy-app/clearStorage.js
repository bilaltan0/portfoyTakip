/**
 * clearStorage.js - Development-Only AsyncStorage Temizleme Aracı
 * 
 * ⚠️ DİKKAT: Bu dosya SADECE development ortamında çalışmalıdır!
 * Production build'ine dahil edilmemelidir.
 * 
 * KULLANIM:
 * Terminal'de: node clearStorage.js
 * 
 * Bu script:
 * - AsyncStorage'daki TÜM verileri siler
 * - Sadece development/test sırasında kullanılmalıdır
 * - Production'da bu dosya bundle'a dahil edilmemelidir
 */

// Development kontrolü
if (process.env.NODE_ENV === 'production') {
  console.error('❌ HATA: Bu script production ortamında çalıştırılamaz!');
  console.error('Bu dosya sadece development için tasarlanmıştır.');
  process.exit(1);
}

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

/**
 * Tüm AsyncStorage verilerini temizler
 */
async function clearStorage() {
  try {
    console.log('🧹 AsyncStorage temizleniyor...');
    
    // Önce mevcut key'leri listele
    const keys = await AsyncStorage.getAllKeys();
    console.log(`📋 Bulunan key'ler (${keys.length} adet):`);
    keys.forEach(key => console.log(`  - ${key}`));
    
    // Onay iste (production güvenliği için)
    console.log('\n⚠️  TÜM VERİLER SİLİNECEK! Devam etmek için Enter\'a basın...');
    
    // Temizle
    await AsyncStorage.clear();
    
    console.log('✅ AsyncStorage başarıyla temizlendi!');
    console.log('💡 Uygulamayı yeniden başlatmanız önerilir.');
  } catch (error) {
    console.error('❌ AsyncStorage temizlenirken hata oluştu:', error);
    process.exit(1);
  }
}

/**
 * Sadece belirli key'leri temizler
 * @param {Array<string>} keys - Silinecek key'ler
 */
async function clearSpecificKeys(keys) {
  try {
    console.log(`🧹 ${keys.length} key temizleniyor...`);
    
    await AsyncStorage.multiRemove(keys);
    
    console.log('✅ Belirtilen key\'ler temizlendi:');
    keys.forEach(key => console.log(`  - ${key}`));
  } catch (error) {
    console.error('❌ Key\'ler silinirken hata oluştu:', error);
    process.exit(1);
  }
}

/**
 * Tüm key'leri ve değerlerini listeler (debug için)
 */
async function listAllData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    
    if (keys.length === 0) {
      console.log('📭 AsyncStorage boş.');
      return;
    }
    
    console.log(`📦 AsyncStorage İçeriği (${keys.length} key):\n`);
    
    const pairs = await AsyncStorage.multiGet(keys);
    
    pairs.forEach(([key, value]) => {
      console.log(`🔑 ${key}:`);
      try {
        const parsed = JSON.parse(value);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(value);
      }
      console.log('---\n');
    });
  } catch (error) {
    console.error('❌ Veriler listelenirken hata oluştu:', error);
    process.exit(1);
  }
}

// Script parametrelerine göre işlem yap
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listAllData();
    break;
  case 'clear':
    clearStorage();
    break;
  case 'remove':
    if (args.length < 2) {
      console.error('❌ Kullanım: node clearStorage.js remove <key1> <key2> ...');
      process.exit(1);
    }
    clearSpecificKeys(args.slice(1));
    break;
  default:
    console.log('📘 Kullanım:');
    console.log('  node clearStorage.js list          - Tüm verileri listele');
    console.log('  node clearStorage.js clear         - Tüm verileri temizle');
    console.log('  node clearStorage.js remove <key>  - Belirli key\'leri sil');
    console.log('\nÖrnek:');
    console.log('  node clearStorage.js remove @portfolio_portfolios');
    process.exit(0);
}
