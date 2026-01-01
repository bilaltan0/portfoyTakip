/**
 * HelpScreen.js - Yardım & Destek Ekranı
 * 
 * AMAÇ:
 * Kullanıcıların öneri, şikayet ve destek talebi göndermesini sağlar.
 * 
 * ÖZELLİKLER:
 * - İstek/Öneri/Şikayet kategorisi seçimi
 * - Mesaj yazma alanı
 * - EmailJS ile direkt e-posta gönderimi
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export default function HelpScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'feature', label: 'Özellik İsteği', emoji: '💡' },
    { id: 'suggestion', label: 'Öneri', emoji: '✨' },
    { id: 'bug', label: 'Hata Bildirimi', emoji: '🐛' },
    { id: 'complaint', label: 'Şikayet', emoji: '⚠️' },
    { id: 'other', label: 'Diğer', emoji: '💬' },
  ];

  const handleSubmit = async () => {
    // Validasyon
    if (!selectedCategory) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Uyarı', 'Lütfen mesajınızı yazın.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Uyarı', 'Lütfen e-posta adresinizi girin.');
      return;
    }

    // E-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    // Kategori ismini bul
    const category = categories.find(c => c.id === selectedCategory);
    const categoryLabel = category ? `${category.emoji} ${category.label}` : 'Diğer';

    setIsLoading(true);

    try {
      // EmailJS parametreleri
      const templateParams = {
        category: categoryLabel,
        name: name || 'İsimsiz',
        email: email.trim(),
        message: message.trim(),
        date: new Date().toLocaleString('tr-TR'),
      };

      // EmailJS REST API ile e-posta gönder
      console.log('📧 EmailJS isteği gönderiliyor...');
      console.log('📦 Template params:', templateParams);
      
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_gg2ed12',
          template_id: 'template_cp2iar4',
          user_id: '84hb1HPn6d_96WlbV',
          accessToken: 'mxTZJBfM0DaYRiHe3zjFh',
          template_params: templateParams,
        }),
      });

      console.log('📬 Response status:', response.status);
      const responseText = await response.text();
      console.log('📬 Response body:', responseText);

      if (response.ok) {
        // Başarılı mesajı
        Alert.alert(
          '✅ Gönderildi!',
          'Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağız.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                // Formu temizle
                setMessage('');
                setSelectedCategory('');
                setName('');
                setEmail('');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error(`E-posta gönderilemedi: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      Alert.alert(
        '❌ Hata',
        'Mesaj gönderilirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım & Destek</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Açıklama */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💌 Bizimle İletişime Geçin</Text>
          <Text style={styles.infoText}>
            Önerileriniz, şikayetleriniz veya destek talepleriniz için aşağıdaki formu doldurabilirsiniz.
          </Text>
        </View>

        {/* İsim */}
        <View style={styles.section}>
          <Text style={styles.label}>İsim (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Adınız"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* E-posta */}
        <View style={styles.section}>
          <Text style={styles.label}>E-posta *</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@mail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Kategori Seçimi */}
        <View style={styles.section}>
          <Text style={styles.label}>Kategori *</Text>
          <View style={styles.categoryGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mesaj */}
        <View style={styles.section}>
          <Text style={styles.label}>Mesajınız *</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Mesajınızı buraya yazın..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length} / 1000</Text>
        </View>

        {/* Gönder Butonu */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedCategory || !message.trim() || !email.trim() || isLoading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedCategory || !message.trim() || !email.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>📤 Gönder</Text>
          )}
        </TouchableOpacity>

        {/* Alt Bilgi */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            * işaretli alanlar zorunludur
          </Text>
          <Text style={styles.footerText}>
            Mesajınıza en kısa sürede yanıt vereceğiz.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.darkBlue,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: '48%',
  },
  categoryButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: COLORS.gold,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.darkBlue,
    fontWeight: '600',
  },
  messageInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.gold,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});
