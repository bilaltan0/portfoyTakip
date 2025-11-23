# Mobil Portföy Takip Uygulaması Geliştirme Rehberi

Bu rehberde, portföy takip uygulamasını sıfırdan adım adım nasıl geliştirdiğimizi ve her aşamada neler yaptığımızı bulabilirsiniz. Amaç, hiçbir ön bilgiye sahip olmayan birinin bile süreci takip ederek uygulamayı geliştirebilmesidir.

## Proje Başlangıcı
- Proje klasörleri oluşturuldu: `portfoy-app` (uygulama geliştirme alanı), `rehber` (adım adım rehber ve notlar)
- Bu dosyada, yapılan her adım ve alınan kararlar özetlenecek.

Sonraki adımda ilk gereksinimleri ve planı yazacağız.
---

## Proje İsterleri ve Planı

### Amaç
Kullanıcıların portföylerini takip edebileceği, mobil cihazlarda çalışan bir uygulama geliştirmek.

### Temel Gereksinimler (Taslak)
İlk aşamada takip edilecek araçlar:
- Altın
- Kripto paralar
- Borsa
- Döviz

Dil seçenekleri:
- Uygulama İngilizce ve Türkçe dil desteğine sahip olacak

Kullanıcılar:
- Her varlık için maliyet ve adet girebilecek
- Anlık fiyata göre toplam kar/zarar durumunu görebilecek

Portföyde:
- Araçların (altın, kripto, borsa, döviz) yüzdelik dağılımı görüntülenebilecek
- Alt varlıkların portföy içindeki yüzdesel dağılımı görüntülenebilecek

Gelişmiş portföy yönetimi:
- Her ana araç (ör. borsa, kripto) kendi içinde alt portföylere bölünebilecek (ör. borsa > halka arz, borsa > normal hisse)
- Alt portföyler ve varlıklar, hem ana portföyde hem kendi gruplarında yüzdesel olarak ayrı ayrı gösterilebilecek
- Kullanıcı, portföyünü ve alt portföylerini istediği gibi isimlendirebilecek ve gruplandırabilecek
- Yüzdelik dağılımlar hem genel hem alt gruplar için otomatik hesaplanacak

Özet:
Kullanıcı, ana araçları kullanarak portföy içinde alt portföyler oluşturabilir, bu portföyleri isimlendirebilir ve farklı ana portföyler altında gruplayabilir. Portföy yapısı tamamen esnek ve kişiselleştirilebilir olacaktır.

Ek Özellikler:
- Varlık fiyatlarını otomatik güncelleme (API ile anlık veri çekme)
- Portföy geçmişi ve performans grafikleri
- Çoklu para birimi desteği
- Mobil uygulama için sade ve kullanıcı dostu arayüz

Geliştirme Yaklaşımı:
Proje, agile (çevik) yöntemlerle yönetilecek ve geliştirme aşamasında gereksinimler değiştirilebilecek, yeni özellikler eklenebilecek veya çıkarılabilecektir.

### Yol Haritası (Taslak)
Henüz detaylandırılmadı. Gereksinimler belirlendikten sonra oluşturulacak.

### Takvim (Taslak)
Başlangıç tarihi: 23 Kasım 2025

Çalışma düzeni:
- Haftada 4 gün ofisten, 1 gün online çalışıyorsun.
- Haftasonları tatil, online gününde ve haftasonu toplamda günlük max 3 saat projeye vakit ayırabiliyorsun.

### Tahmini Süreler ve Takvim
1. Kurulum ve ortam hazırlığı (Node.js, CLI, Xcode, Android Studio): 1 hafta (23-29 Kasım)
2. Temel uygulama iskeleti ve ana ekranlar: 1 hafta (30 Kasım - 6 Aralık)
3. Portföy ve varlık yönetimi: 1 hafta (7-13 Aralık)
4. Yüzdelik dağılımlar, alt portföyler: 1 hafta (14-20 Aralık)
5. Otomatik fiyat güncelleme (API entegrasyonu): 1 hafta (21-27 Aralık)
6. Performans grafikleri ve geçmiş: 1 hafta (28 Aralık - 3 Ocak)
7. Çoklu para birimi desteği ve arayüz iyileştirmeleri: 1 hafta (4-10 Ocak)
8. Testler, son düzenlemeler ve yayın: 1 hafta (11-17 Ocak)

Toplam tahmini süre: 8 hafta
### İlerleme Durumu
- 23-29 Kasım: Kurulum ve ortam hazırlığı tamamlandı (Node.js, Expo CLI, Xcode, Android Studio, emülatörler, ilk proje başlatıldı)
- Sonraki adım: Temel uygulama iskeleti ve ana ekranların oluşturulması

Not: Agile yöntemle ilerleyeceğimiz için gereksinimler ve süreler değişebilir. Her aşama sonunda rehber güncellenecek.
## Kurallar ve Notlar

- Her yeni sohbet için rehber klasöründe numaralandırılmış bir README dosyası (`README-1.md`, `README-2.md`, ...) oluşturulacaktır.
- Genel rehber dosyasında (bu dosyada) proje ile ilgili genel bilgiler ve kurallar yer alır.
- Numara verilen README dosyalarında sadece ilgili sohbetin adımları ve içerikleri bulunur.
- Bu sayede süreci takip eden herkes kendi adımlarını ayrı dosyalarda tutabilir ve kolayca süreci izleyebilir.