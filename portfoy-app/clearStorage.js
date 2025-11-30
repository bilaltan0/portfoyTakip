// AsyncStorage temizleme scripti
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearStorage() {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage temizlendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

clearStorage();
