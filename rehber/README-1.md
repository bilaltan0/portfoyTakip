# 1. Sohbet Rehberi

Bu dosya, Mobil Portföy Takip Uygulaması geliştirme sürecinin 1. sohbetinde yapılan adımları ve alınan kararları içerir.

## Yapılanlar

## Alınan Kararlar
- Uygulama React Native ile geliştirilecek.
- Hem iOS hem Android desteği olacak.
- Mac bilgisayarda geliştirme yapılacak.
- Brew kuruldu, başka ek yazılım yok (VS Code haricinde).

## İlk Adımlar
1. Node.js kurulacak
2. React Native CLI veya Expo CLI kurulacak (Expo yeni başlayanlar için önerilir)
3. Xcode yüklenecek (iOS için)
4. Android Studio yüklenecek (Android için)
5. Ortam değişkenleri ayarlanacak (özellikle Android için)
6. React Native projesi başlatılacak

## React Native Projesi Başlatma

Expo ile yeni bir React Native projesi başlatıldı:
- Komut: `npx create-expo-app portfoy-app`
- Template: blank (temiz başlangıç)

Proje klasörü: `portfoy-app`
Proje başlatıldıktan sonra çalıştırmak için:

## Web Desteği ve Paket Uyumsuzluğu Notları

- Web desteği için `react-native-web` ve `react-dom` paketleri eklendi.
- Paketler arasında sürüm uyuşmazlığı olduğu için `--legacy-peer-deps` ile kurulum yapıldı.
- Bu yöntem temel projelerde genellikle sorun çıkarmaz, ancak ileride paket güncellemelerinde veya yeni paket eklerken hata riski olabilir.
- İleride hata alınırsa, paket sürümleri ve Node sürümü kontrol edilmeli, gerekirse güncellenmeli veya düşürülmeli.

## Webde İlk Açılış
- Webde ilk açılışta "Welcome to Expo" veya "Open up App.js to start working on your app!" gibi bir ekran görünmelidir.
- Eğer ekranda hiçbir şey yazmıyorsa, `App.js` dosyasını kontrol et ve örnek bir içerik ekle:

```jsx
import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text>Portföy Uygulamasına Hoş Geldiniz!</Text>
		</View>
	);
}
```

Bu adımlar tamamlandıkça rehber güncellenecek ve yeni kararlar eklenecek.

## Kurulum Adımları ve Nedenleri

1. Homebrew
	- Amaç: Mac üzerinde paket ve yazılım yönetimini kolaylaştırmak için kullanılır. Gerekli araçları hızlıca kurabilmek için ilk adımda yüklenir.
	- Durum: Homebrew başarıyla kuruldu ve PATH'e eklendi.

2. Node.js
	- Amaç: React Native ve JavaScript tabanlı araçlar için gereklidir. Uygulamanın temel altyapısı Node.js ile çalışır.
	- Durum: Node.js başarıyla kuruldu. (v25.2.1)

3. React Native CLI veya Expo CLI
	- Amaç: React Native projelerini başlatmak ve yönetmek için kullanılır. Expo yeni başlayanlar için daha kolaydır, React Native CLI ise daha fazla özelleştirme sunar.
	- Durum: Expo CLI başarıyla kuruldu. (v6.3.12)
	- Not: Legacy Expo CLI Node.js 17 ve üzeri sürümlerde tam destek vermeyebilir. Yeni Expo CLI'ye geçiş önerilir. Daha fazla bilgi: https://blog.expo.dev/the-new-expo-cli-f4250d8e3421

4. Xcode
	- Amaç: iOS uygulamalarını geliştirmek ve simüle etmek için gereklidir. Sadece Mac üzerinde çalışır.
	- Durum: App Store üzerinden indirilebilir. Kurulumdan sonra Xcode'u açıp lisans anlaşmasını onaylamak gerekir.
	- Sonuç: Xcode başarıyla kuruldu.

5. Android Studio
	- Amaç: Android uygulamalarını geliştirmek ve test etmek için gereklidir. Android emülatörü ve araçları bu paketle gelir.
	- Durum: https://developer.android.com/studio adresinden indirilebilir. Kurulumdan sonra Android emülatörü ve SDK ayarları yapılmalı.
	- Sonuç: Android Studio başarıyla kuruldu.

### Android Studio Kurulum Rehberi
1. https://developer.android.com/studio adresine git.
2. "Download Android Studio" butonuna tıkla ve kurulum dosyasını indir.
3. İndirilen dosyayı açıp Android Studio’yu yükle.
4. İlk açılışta "Standard" kurulum seçeneğini seç ve devam et.
5. Android SDK, Android Virtual Device (AVD) ve gerekli araçlar otomatik olarak kurulacak.
6. "Device Manager" üzerinden yeni bir sanal cihaz (emülatör) oluşturabilirsin.
7. Kurulumdan sonra Android Studio’yu ve emülatörü test etmek için örnek bir proje açabilirsin.
8. Gerekirse ayarlardan SDK yolunu ve ortam değişkenlerini kontrol et (özellikle ANDROID_HOME).

6. Ortam Değişkenleri
	- Amaç: Android geliştirme araçlarının doğru çalışması için bazı sistem ayarlarının yapılması gerekir (ör. ANDROID_HOME).

Her adım tamamlandıkça, kurulumun amacı ve süreci bu dosyada güncellenecek.


## Not
Her yeni sohbet için rehber klasöründe yeni bir README dosyası oluşturulacak ve numaralandırılacaktır. Bu sayede süreci takip eden herkes kendi adımlarını ayrı dosyalarda tutabilir ve kolayca süreci izleyebilir.