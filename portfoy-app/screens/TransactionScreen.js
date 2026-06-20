/**
 * TransactionScreen.js - İşlem Yap Ekranı
 */

import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputAccessoryView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, PREDEFINED_ASSETS, CURRENCY_SYMBOLS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';
import { useSubCategories } from '../context/SubCategoryContext';
import CategoryButton from '../components/CategoryButton';
import AssetChip from '../components/AssetChip';
import CurrencyButton from '../components/CurrencyButton';
import ActionButton from '../components/ActionButton';
import { BuyIcon, SellIcon } from '../components/icons';
import AdBanner from '../components/AdBanner';
import { searchAllAssets, getPopularAssets } from '../services/assetSearchService';
import { fetchAssetPrice } from '../services/priceService';

// Ekran boyutunu al - Responsive tasarım için
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modal için sabitler
const COMMON_EMOJIS = ['📁', '🔷', '🏦', '💵', '💻', '✈️', '🏆', '🎯', '📊', '🔥', '⭐', '💎', '🏠', '🚗', '💰', '📈'];
const PRESET_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1'];

export default function TransactionScreen({ route, navigation }) {
  const {
    addTransaction,
    updateTransaction,
    categories,
    activePortfolio,
    refreshSubCategories
  } = usePortfolio();

  const {
    subCategories,
    createSubCategory,
    assignAssetToSubCategory,
    removeAssetFromCategory,
    getSubCategoryForAssetName,
    updateSubCategory,
    deleteSubCategory
  } = useSubCategories();
  // (Uzun basım ile düzenle/sil için) aktif menü state aşağıda
  // edit modal kontrolü
  const [isEditingSubCategory, setIsEditingSubCategory] = useState(false);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState(null);
  // alt kategori işlem menüsü (görsel, modal tabanlı)
  const [showSubCategoryMenu, setShowSubCategoryMenu] = useState(false);
  const [activeSubCategoryForMenu, setActiveSubCategoryForMenu] = useState(null);
  const [menuConfirmDelete, setMenuConfirmDelete] = useState(false);
  // Layout states to position the create button under the last category
  const [categoryContainerLayout, setCategoryContainerLayout] = useState(null);
  const [lastCategoryLayout, setLastCategoryLayout] = useState(null);
  const [createButtonLayout, setCreateButtonLayout] = useState(null);
  // Edit mode kontrolü
  const editingTransaction = route?.params?.editingTransaction;
  const isEditMode = !!editingTransaction;

  // Form state
  const [mainCategory, setMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // Alt kategori seçimi
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  const [note, setNote] = useState('');

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularAssets, setPopularAssets] = useState([]);

  // SubCategory Modal state
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryIcon, setNewSubCategoryIcon] = useState('📁');
  const [newSubCategoryColor, setNewSubCategoryColor] = useState('#3B82F6');
  const [isCreatingSubCategory, setIsCreatingSubCategory] = useState(false);

  // Price fetching state
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState(null); // API mapping bilgisi

  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Animated keyboard-aware footer
  const insets = useSafeAreaInsets();
  const keyboardAnim = useRef(new Animated.Value(12 + (insets.bottom || 0))).current;
  const INPUT_ACC_VIEW_ID = 'transactionAccessory';

  // Preselected asset kontrolü için ref
  const isPreselectingRef = React.useRef(false);
  const searchTimeoutRef = React.useRef(null);

  // Toast notification göster
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    // Animasyon: aşağıdan yukarı çık
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setToastVisible(false);
    });
  };

  // Edit mode: Formu doldur
  useEffect(() => {
    if (editingTransaction) {
      console.log('✏️ Edit mode aktif, form dolduruluyor:', editingTransaction);
      setMainCategory(editingTransaction.mainCategory || '');
      setAssetName(editingTransaction.assetName || '');
      setQuantity(editingTransaction.quantity.toString());
      setUnitPrice(editingTransaction.unitPrice.toString());
      setCurrency(editingTransaction.currency || 'TRY');
      setNote(editingTransaction.note || '');

      // Asset info varsa set et
      if (editingTransaction.symbol) {
        setSelectedAssetInfo({
          symbol: editingTransaction.symbol,
          provider: editingTransaction.provider,
          id: editingTransaction.apiId,
          currency: editingTransaction.apiCurrency,
          category: editingTransaction.mainCategory,
          fullName: editingTransaction.assetName
        });
      }

      // Eğer transaction alt kategori bilgisi içeriyorsa yükle (varsa subCategories zaten context'ten gelmiş olur)
      if (editingTransaction.subCategoryId) {
        const existing = subCategories.find(sc => sc.id === editingTransaction.subCategoryId) || null;
        setSelectedSubCategory(existing);
        console.log('🔎 edit: selectedSubCategory set from editingTransaction.subCategoryId ->', existing && { id: existing.id, name: existing.name });
      } else {
        // Eğer transaction kendi içinde subCategoryId yoksa, asset->subcategory mapping'ine bak
        try {
          const mapped = getSubCategoryForAssetName(editingTransaction.assetName);
          if (mapped) {
            setSelectedSubCategory(mapped);
            console.log('🔎 edit: selectedSubCategory set from asset mapping ->', { id: mapped.id, name: mapped.name });
          } else {
            setSelectedSubCategory(null);
            console.log('🔎 edit: no subCategoryId on editingTransaction and no asset mapping found');
          }
        } catch (err) {
          console.error('❌ edit: error while checking asset->subcategory mapping', err);
          setSelectedSubCategory(null);
        }
      }
    }
  }, [editingTransaction, subCategories]);

  // Preselected asset için ayrı useEffect
  useFocusEffect(
    React.useCallback(() => {
      // Edit mode'daysa preselect çalıştırma
      if (editingTransaction) {
        return;
      }

      const preselectedAsset = route?.params?.preselectedAsset;

      if (preselectedAsset) {
        isPreselectingRef.current = true;
        console.log('➡️ TransactionScreen preselect params:', preselectedAsset);
        setMainCategory(preselectedAsset.mainCategory || '');
        setAssetName(preselectedAsset.assetName || '');

        // ✅ selectedAssetInfo varsa set et (buton için gerekli!)
        if (preselectedAsset.selectedAssetInfo) {
          setSelectedAssetInfo(preselectedAsset.selectedAssetInfo);
        }

        // Eğer bu varlık zaten bir alt kategoriye atanmışsa, otomatik seç ve kullanıcıyı bilgilendir
        try {
          const assigned = getSubCategoryForAssetName(preselectedAsset.assetName);
          if (assigned) {
            setSelectedSubCategory(assigned);
            console.log('🔎 preselect: asset auto-assigned to subcategory ->', { id: assigned.id, name: assigned.name });
            // Note: previously we showed a toast here informing the user the asset
            // was auto-assigned to a subcategory. Per UX request, remove that
            // notification but keep the automatic selection behavior.
          }
        } catch (err) {
          console.warn('❌ preselect: error while checking asset->subcategory mapping', err);
        }

        // Parametreleri temizle
        navigation.setParams({ preselectedAsset: undefined });
        // Preselecting işlemi bittiğini işaretle
        setTimeout(() => {
          isPreselectingRef.current = false;
        }, 100);
      }
    }, [route?.params?.preselectedAsset, navigation, editingTransaction])
  );

  // Ana kategori değiştiğinde varlık adını temizle (sadece manuel değişiklikse ve edit mode değilse)
  useEffect(() => {
    if (!isPreselectingRef.current && !isEditMode) {
      if (mainCategory === 'Nakit') {
        setAssetName('Türk Lirası (TRY)');
        setCurrency('TRY');
        setUnitPrice('1');
      } else {
        setAssetName('');
        setUnitPrice(''); // Fiyatı da temizle
      }
      
      setSelectedAssetInfo(null); // API mapping'i de temizle
      setSelectedSubCategory(null); // Alt kategori seçimini de temizle
    }

    // Kategori seçildiğinde popüler varlıkları yükle
    if (mainCategory) {
      loadPopularAssets(mainCategory);
    }
  }, [mainCategory]);

  // Popüler varlıkları yükle
  const loadPopularAssets = (category) => {
    const popular = getPopularAssets(category);
    setPopularAssets(popular);
  };

  // Screen'den ayrılınca formu resetle
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Screen'den ayrılınca (blur) çalışır - Her durumda formu temizle
        console.log('🔄 Screenden ayrılıyor, form resetleniyor');

        // Edit mode parametresini temizle
        if (editingTransaction) {
          navigation.setParams({ editingTransaction: undefined });
        }

        // Formu tamamen temizle
        resetForm();
      };
    }, [editingTransaction, navigation])
  );

  // Varlık arama fonksiyonu (debounced)
  const handleAssetSearch = (text) => {
    setAssetName(text);

    // Eğer seçili bir varlık varsa, temizle (kullanıcı değiştirmeye başladı)
    if (selectedAssetInfo) {
      setSelectedAssetInfo(null);
      setUnitPrice('');
    }

    // Eğer text boşsa, sadece popüler varlıkları göster
    if (!text.trim()) {
      setSearchResults([]);
      setShowDropdown(popularAssets.length > 0);
      return;
    }

    // Önceki timeout'u temizle
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    setShowDropdown(true);

    // İlk karakter veya kısa metinlerde hızlı arama (200ms), uzun metinlerde normal (300ms)
    const debounceTime = text.length <= 2 ? 200 : 300;

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchAllAssets(text, mainCategory);
        setSearchResults(results);
        setIsSearching(false);
      } catch (error) {
        console.error('Asset search error:', error);
        setIsSearching(false);
        setSearchResults([]);
      }
    }, debounceTime);
  };

  // Dropdown'dan varlık seçildiğinde
  const handleSelectAsset = (asset) => {
    // Parantez içindeki sembolü kaldır: "Bitcoin (BTC)" → "Bitcoin"
    const displayName = asset.fullName || asset.assetName || asset.name;
    const cleanName = displayName.split('(')[0].trim();

    setAssetName(cleanName);
    setShowDropdown(false);
    setSearchResults([]);

    // API mapping bilgisini sakla (anlık fiyat için)
    setSelectedAssetInfo({
      symbol: asset.symbol,
      provider: asset.provider,
      id: asset.id,
      currency: asset.currency,
      category: asset.category,
      fullName: displayName
    });
    // Eğer bu varlık zaten bir alt kategoriye atanmışsa, otomatik seç
    try {
      const assigned = getSubCategoryForAssetName(cleanName);
      if (assigned) {
        setSelectedSubCategory(assigned);
      } else {
        // Do not clear an existing manual sub-category selection when the
        // selected asset has no mapping. Previously this would erase a
        // user-selected sub-category unexpectedly when they picked an
        // unmapped asset. Keep the user's choice.
        // setSelectedSubCategory(null);
      }
    } catch (err) {
      // ignore
    }

    console.log('✅ Varlık seçildi:', {
      original: displayName,
      clean: cleanName,
      symbol: asset.symbol,
      category: asset.category
    });
  };

  // Anlık fiyat çekme fonksiyonu
  const handleFetchLivePrice = async () => {
    if (!assetName.trim()) {
      Alert.alert('Uyarı', 'Önce bir varlık seçin');
      return;
    }

    // Eğer varlık bilgisi yoksa otomatik arama yap
    let assetInfo = selectedAssetInfo;
    if (!assetInfo) {
      console.log('⚠️ Varlık bilgisi yok, otomatik arama yapılıyor...');

      try {
        // Kategori bazlı arama yap
        const results = await searchAssets(assetName, mainCategory);

        if (results && results.length > 0) {
          // İlk sonucu otomatik seç
          assetInfo = {
            symbol: results[0].symbol,
            provider: results[0].provider,
            id: results[0].id,
            currency: results[0].currency,
            category: results[0].category,
            fullName: results[0].assetName
          };

          // Sonraki kullanımlar için kaydet
          setSelectedAssetInfo(assetInfo);

          console.log('✅ Otomatik varlık bulundu:', assetInfo);
        } else {
          Alert.alert('Uyarı', 'Varlık bulunamadı. Lütfen doğru ismi girin veya kategorisini kontrol edin.');
          return;
        }
      } catch (error) {
        Alert.alert('Hata', 'Varlık ararken hata oluştu');
        return;
      }
    }

    try {
      setIsFetchingPrice(true);

      // API'den fiyat çek (assetSearchService'den gelen tüm bilgiyi gönder)
      const priceData = await fetchAssetPrice(assetName, assetInfo);

      // Rate limit hatası kontrolü
      if (priceData?.rateLimitError) {
        Alert.alert(
          '⚠️ Rate Limit',
          priceData.message || 'Fiyat şu an çekilemiyor. Lütfen manuel olarak girin.',
          [{ text: 'Tamam' }]
        );
        return; // Fiyat alanını boş bırak, kullanıcı manuel girecek
      }

      if (priceData && priceData.price && priceData.price > 0) {
        // Fiyatı forma doldur (sessizce) - max 3 decimal places
        setUnitPrice(priceData.price.toFixed(3));
        setCurrency(priceData.currency);
      } else {
        Alert.alert('Hata', 'Fiyat bilgisi alınamadı. Lütfen manuel olarak girin.');
      }
    } catch (error) {
      console.error('Fiyat çekme hatası:', error);
      Alert.alert('Hata', `Fiyat alınırken hata oluştu. Lütfen manuel girin:\n${error.message}`);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Butonlar artık sabit - klavye açılınca hareket etmeyecek
  // Tab bar'ın hemen üstünde kalacaklar

  // Ana kategoriler
  const mainCategories = Object.keys(categories);

  // Form validation
  const validateForm = () => {
    if (!mainCategory) {
      Alert.alert('Hata', 'Lütfen ana kategori seçin');
      return false;
    }
    if (!assetName.trim()) {
      Alert.alert('Hata', 'Lütfen varlık adı girin');
      return false;
    }

    // Miktar validasyonu
    const quantityNum = parseFloat(quantity);
    if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin (sadece rakam)');
      return false;
    }

    // Birim fiyat validasyonu (Nakit hariç)
    const priceNum = parseFloat(unitPrice);
    if (mainCategory !== 'Nakit' && (!unitPrice || isNaN(priceNum) || priceNum <= 0)) {
      Alert.alert('Hata', 'Lütfen geçerli bir birim fiyat girin (sadece rakam)');
      return false;
    }

    return true;
  };

  // Form submit with transaction type - ASYNC ile tam doğru timing
  const handleSubmit = async (transactionType) => {
    if (!validateForm()) return;

    // Edit mode: Mevcut transaction'ı güncelle
    if (isEditMode) {
      const updatedData = {
        mainCategory,
        assetName: assetName.trim(),
        symbol: selectedAssetInfo?.symbol || null,
        provider: selectedAssetInfo?.provider || null,
        apiId: selectedAssetInfo?.id || null,
        apiCurrency: selectedAssetInfo?.currency || null,
        subCategoryId: selectedSubCategory?.id || null,
        type: transactionType,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        currency,
        note: note.trim(),
      };

      const ok = await updateTransaction(editingTransaction.id, updatedData);
      if (ok) {
        try {
          if (selectedSubCategory && selectedSubCategory.id) {
            await assignAssetToSubCategory(assetName.trim(), selectedSubCategory.id);
          } else {
            await removeAssetFromCategory(assetName.trim());
          }
        } catch (err) {
          console.error('⚠️ Mapping update failed after transaction update:', err);
        }
        showToast('İşlem güncellendi', 'success');
        // İşlem geçmişine geri dön
        setTimeout(() => {
          navigation.navigate('TransactionHistory');
        }, 1000);
      } else {
        Alert.alert('Hata', 'İşlem güncellenemedi. Lütfen tekrar deneyin.');
      }
      return;
    }

    // Normal mode: Yeni transaction ekle
    const transaction = {
      mainCategory,
      assetName: assetName.trim(),
      // Dinamik algılama için tüm API bilgisini sakla
      symbol: selectedAssetInfo?.symbol || null,
      provider: selectedAssetInfo?.provider || null,
      apiId: selectedAssetInfo?.id || null, // CoinGecko ID, Yahoo symbol, vb.
      apiCurrency: selectedAssetInfo?.currency || null,
      subCategoryId: selectedSubCategory?.id || null,
      type: transactionType,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      currency,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    console.log('💾 Transaction kaydediliyor:', {
      assetName: transaction.assetName,
      symbol: transaction.symbol,
      provider: transaction.provider,
      apiId: transaction.apiId,
      mainCategory: transaction.mainCategory
    });

    // AsyncStorage'a kaydedilene kadar BEKLE
    const success = await addTransaction(transaction);

    if (success) {
      // Eğer alt kategori seçildiyse mapping'i güncelle -> önce mapping'i kaydet, sonra formu temizle
      const chosenSubCategoryId = selectedSubCategory?.id || null;
      if (chosenSubCategoryId) {
        try {
          await assignAssetToSubCategory(transaction.assetName, chosenSubCategoryId);
        } catch (err) {
          console.error('⚠️ Mapping update failed after transaction create:', err);
        }
      }

      // Form temizle (kategori korunur)
      resetForm();

      // Toast bildirim göster - Artık kesin kaydedildi!
      showToast('İşlem gerçekleştirildi', transactionType === 'buy' ? 'success' : 'error');
    } else {
      // Hata durumu
      Alert.alert('Hata', 'İşlem kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Form reset - Tamamen temizle
  const resetForm = () => {
    setMainCategory('');
    setSelectedSubCategory(null);
    setAssetName('');
    setQuantity('');
    setUnitPrice('');
    setCurrency('TRY');
    setNote('');
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedAssetInfo(null);
    setPopularAssets([]);
  };

  // Alt Kategori Oluştur
  const handleCreateSubCategory = async () => {
    const trimmedName = newSubCategoryName.trim();

    console.log('🔵 handleCreateSubCategory çağrıldı, name:', trimmedName, 'mainCategory:', mainCategory);

    if (!trimmedName) {
      Alert.alert('Hata', 'Lütfen kategori adı girin');
      return;
    }

    // Aynı isimde kategori var mı kontrol et
    const exists = subCategories.some(
      sc => sc.parentCategory === mainCategory &&
        sc.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      Alert.alert('Hata', 'Bu isimde bir alt kategori zaten var');
      return;
    }

    setIsCreatingSubCategory(true);

    try {
      console.log('🔵 createSubCategory çağrılıyor...');
      const newSubCat = await createSubCategory({
        name: trimmedName,
        parentCategory: mainCategory,
        icon: newSubCategoryIcon,
        color: newSubCategoryColor,
        targetPercentage: 0,
      });

      console.log('✅ Yeni kategori oluşturuldu:', newSubCat);

      setSelectedSubCategory(newSubCat);
      setShowSubCategoryModal(false);
      setNewSubCategoryName('');
      setNewSubCategoryIcon('📁');
      setNewSubCategoryColor('#3B82F6');

      showToast(`✅ ${trimmedName} oluşturuldu!`, 'success');
    } catch (error) {
      console.error('❌ Alt kategori oluşturma hatası:', error);
      Alert.alert('Hata', 'Alt kategori oluşturulamadı: ' + error.message);
    } finally {
      setIsCreatingSubCategory(false);
    }
  };

  // Alt kategori düzenleme işlemi
  const handleUpdateSubCategory = async () => {
    if (!editingSubCategoryId) return;
    const trimmedName = newSubCategoryName.trim();
    if (!trimmedName) {
      Alert.alert('Hata', 'Lütfen kategori adı girin');
      return;
    }

    try {
      const updated = await updateSubCategory(editingSubCategoryId, {
        name: trimmedName,
        icon: newSubCategoryIcon,
        color: newSubCategoryColor
      });

      // Yerel seçimleri güncelle
      setSelectedSubCategory(updated);
      showToast('Kategori güncellendi', 'success');
    } catch (err) {
      console.error('❌ Kategori güncelleme hatası:', err);
      Alert.alert('Hata', 'Kategori güncellenemedi: ' + err.message);
    } finally {
      setIsEditingSubCategory(false);
      setEditingSubCategoryId(null);
      setShowSubCategoryModal(false);
      setNewSubCategoryName('');
      setNewSubCategoryIcon('📁');
      setNewSubCategoryColor('#3B82F6');
    }
  };

  // Alt kategori silme
  const handleDeleteSubCategory = async (id) => {
    // artık görsel menü üzerinden yönlendirilecek; yine de fonksiyonel silme burada kalıyor
    try {
      await deleteSubCategory(id);
      // Eğer silinen seçiliyse temizle
      if (selectedSubCategory?.id === id) {
        setSelectedSubCategory(null);
      }
      // temizleme sonrası UI state güncellemesi
      showToast('Kategori silindi', 'success');
      return true;
    } catch (err) {
      console.error('❌ Kategori silme hatası:', err);
      Alert.alert('Hata', 'Kategori silinemedi: ' + err.message);
      return false;
    }
  };

  const handleOpenSubCategoryMenu = (subCat) => {
    setActiveSubCategoryForMenu(subCat);
    setMenuConfirmDelete(false);
    setShowSubCategoryMenu(true);
  };

  const handleMenuEdit = () => {
    const subCat = activeSubCategoryForMenu;
    if (!subCat) return;
    setIsEditingSubCategory(true);
    setEditingSubCategoryId(subCat.id);
    setNewSubCategoryName(subCat.name);
    setNewSubCategoryIcon(subCat.icon || '📁');
    setNewSubCategoryColor(subCat.color || '#3B82F6');
    setShowSubCategoryMenu(false);
    setShowSubCategoryModal(true);
  };

  const handleMenuInitiateDelete = () => {
    setMenuConfirmDelete(true);
  };

  const handleMenuConfirmDelete = async () => {
    if (!activeSubCategoryForMenu) return;
    const id = activeSubCategoryForMenu.id;
    const ok = await handleDeleteSubCategory(id);
    if (ok) {
      setShowSubCategoryMenu(false);
      setActiveSubCategoryForMenu(null);
    }
  };

  const handleCloseSubCategoryMenu = () => {
    setShowSubCategoryMenu(false);
    setMenuConfirmDelete(false);
    setActiveSubCategoryForMenu(null);
  };

  // Handle buy button
  const handleBuy = () => {
    Keyboard.dismiss(); // Klavyeyi kapat
    handleSubmit('buy');
  };

  // Handle sell button - Stok kontrolü ile
  const handleSell = () => {
    if (!validateForm()) return;
    Keyboard.dismiss(); // Klavyeyi kapat

    // Aktif portföydeki varlık pozisyonunu hesapla
    const transactions = activePortfolio?.transactions || [];
    const assetKey = `${mainCategory}_${assetName.trim()}`;

    let totalOwned = 0;
    transactions.forEach(transaction => {
      const txAssetKey = `${transaction.mainCategory}_${transaction.assetName}`;
      if (txAssetKey === assetKey) {
        if (transaction.type === 'buy') {
          totalOwned += transaction.quantity;
        } else if (transaction.type === 'sell') {
          totalOwned -= transaction.quantity;
        }
      }
    });

    const sellQuantity = parseFloat(quantity);

    if (sellQuantity > totalOwned) {
      Alert.alert('❌ Yetersiz Bakiye', 'Bu miktarda varlığınız yok.');
      return;
    }

    handleSubmit('sell');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header - Professional Style */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'İşlem Düzenle' : 'Yeni İşlem'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      {/* Banner reklamı header altında göster (küçük ekranlarda görünür olsun) */}
      <AdBanner style={{ marginTop: 8, marginHorizontal: 16 }} />

      {/* Main Content - ScrollView without KeyboardAvoidingView wrapper */}
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowDropdown(false);
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >


          {/* Ana Kategori */}
          <View style={styles.section}>
            <Text style={styles.label}>Kategori</Text>
            <View
              style={[styles.categoryButtons, { position: 'relative' }]}
              onLayout={(e) => setCategoryContainerLayout(e.nativeEvent.layout)}
            >
              {mainCategories.map((cat, idx) => (
                <CategoryButton
                  key={cat}
                  label={cat}
                  isActive={mainCategory === cat}
                  onPress={() => setMainCategory(cat)}
                  onLayout={idx === mainCategories.length - 1 ? (e) => setLastCategoryLayout(e.nativeEvent.layout) : undefined}
                />
              ))}

              {/* Absolute positioned + Oluştur removed from here — placed next to label for correct vertical alignment */}
            </View>
          </View>

          {/* Alt Kategori Seçimi - Kategori seçildiyse göster */}
          {mainCategory && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <Text style={styles.label}>🏷️ Alt Kategori (Opsiyonel)</Text>
                {lastCategoryLayout ? (
                  <ActionButton
                    label={'+ Oluştur'}
                    onPress={() => {
                      setIsEditingSubCategory(false);
                      setEditingSubCategoryId(null);
                      setShowSubCategoryModal(true);
                    }}
                    variant="text"
                    size="small"
                    style={[
                      styles.createSubCategoryButton,
                      styles.createSubCategoryButtonText,
                      {
                        position: 'absolute',
                        left: lastCategoryLayout.x + (lastCategoryLayout.width / 2) - ((createButtonLayout?.width || 80) / 2),
                        top: 0,
                      }
                    ]}
                    onLayout={(e) => setCreateButtonLayout(e.nativeEvent.layout)}
                  />
                ) : (
                  <ActionButton
                    label={'+ Oluştur'}
                    onPress={() => {
                      setIsEditingSubCategory(false);
                      setEditingSubCategoryId(null);
                      setShowSubCategoryModal(true);
                    }}
                    variant="text"
                    size="small"
                    style={[styles.createSubCategoryButton, styles.createSubCategoryButtonText, { marginLeft: 10 }]}
                    onLayout={(e) => setCreateButtonLayout(e.nativeEvent.layout)}
                  />
                )}
              </View>

              <View style={styles.subCategoryContainer}>
                {subCategories
                  .filter(sc => sc.parentCategory === mainCategory && sc.id)
                  .map((subCat) => (
                    <TouchableOpacity
                      key={subCat.id}
                      style={[
                        styles.subCategoryChip,
                        selectedSubCategory?.id === subCat.id && styles.subCategoryChipActive,
                        { borderColor: subCat.color }
                      ]}
                      onPress={() => setSelectedSubCategory(subCat)}
                      onLongPress={() => handleOpenSubCategoryMenu(subCat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.subCategoryChipText,
                        selectedSubCategory?.id === subCat.id && styles.subCategoryChipTextActive
                      ]}>
                        {subCat.icon} {subCat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}

          {/* Varlık Adı */}
          {/* Varlık Adı (Nakit için gizli, sadece miktar girilecek) */}
          {mainCategory === 'Nakit' ? null : (
            <View style={styles.section}>
              <Text style={styles.label}>🔍 Varlık Arama</Text>

              {!mainCategory ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Önce yukarıdan kategori seçin
                  </Text>
                </View>
              ) : (
                <>
                  {/* Arama Input'u */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[styles.input, { flex: 1 }, assetName.trim() && styles.inputWithClear]}
                      placeholder="Varlık ara... (Altın, BTC, BIST, Dolar)"
                      placeholderTextColor={COLORS.mediumGray}
                      value={assetName}
                      onChangeText={handleAssetSearch}
                      inputAccessoryViewID={INPUT_ACC_VIEW_ID}
                      onFocus={() => {
                        // Eğer seçili varlık yoksa dropdown göster
                        if (!selectedAssetInfo) setShowDropdown(true);
                      }}
                      returnKeyType="search"
                      enablesReturnKeyAutomatically={false}
                    />
                    {/* Temizle Butonu - X ikonu */}
                    {assetName.trim() && (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                          setAssetName('');
                          setSelectedAssetInfo(null);
                          setUnitPrice('');
                          setQuantity('');
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.clearButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Arama Sonuçları Dropdown */}
                  {showDropdown && (
                    <View style={styles.dropdown}>
                      {isSearching ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                          <Text style={styles.loadingText}>Aranıyor...</Text>
                        </View>
                      ) : assetName.trim() === '' && popularAssets.length > 0 ? (
                        // Boş input -> Popüler varlıkları göster
                        <View>
                          <Text style={styles.dropdownHeader}>⭐ Popüler Varlıklar</Text>
                          <ScrollView
                            style={styles.dropdownScroll}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                          >
                            {popularAssets.map((asset, index) => (
                              <TouchableOpacity
                                key={`popular-${asset.symbol}-${index}`}
                                style={styles.dropdownItem}
                                onPress={() => handleSelectAsset(asset)}
                                activeOpacity={0.7}
                                delayPressIn={0}
                              >
                                <View style={styles.dropdownItemContent}>
                                  <Text style={styles.dropdownItemName}>
                                    {asset.fullName || asset.assetName}
                                  </Text>
                                  <Text style={styles.dropdownItemSymbol}>
                                    {asset.symbol}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      ) : searchResults.length > 0 ? (
                        // Arama sonuçları var
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {searchResults.map((asset, index) => (
                            <TouchableOpacity
                              key={`${asset.symbol}-${index}`}
                              style={styles.dropdownItem}
                              onPress={() => handleSelectAsset(asset)}
                              activeOpacity={0.7}
                              delayPressIn={0}
                            >
                              <View style={styles.dropdownItemContent}>
                                <Text style={styles.dropdownItemName}>
                                  {asset.fullName || asset.assetName}
                                </Text>
                                <Text style={styles.dropdownItemSymbol}>
                                  {asset.symbol} • {asset.category}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : assetName.trim() !== '' ? (
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                          <Text style={styles.emptyHint}>Farklı bir arama terimi deneyin</Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Miktar ve Fiyat */}
          <View style={styles.section}>
            {mainCategory === 'Nakit' ? (
              <View style={styles.row}>
                <View style={[styles.halfWidth, { width: '100%' }]}>
                  <Text style={styles.label}>💰 Nakit Tutarı (TL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Miktar"
                    placeholderTextColor={COLORS.mediumGray}
                    value={quantity}
                    inputAccessoryViewID={INPUT_ACC_VIEW_ID}
                    onChangeText={(text) => {
                      const sanitized = text.replace(/[^0-9.]/g, '');
                      const parts = sanitized.split('.');
                      if (parts.length > 2) return;
                      if (parts.length > 1 && parts[1].length > 3) {
                        setQuantity(`${parts[0]}.${parts[1].substring(0, 3)}`);
                      } else {
                        setQuantity(sanitized);
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.row}>
                <View style={[styles.halfWidth]}>
                  <Text style={styles.label}>📊 Miktar</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Adet"
                    placeholderTextColor={COLORS.mediumGray}
                    value={quantity}
                    inputAccessoryViewID={INPUT_ACC_VIEW_ID}
                    onChangeText={(text) => {
                      const sanitized = text.replace(/[^0-9.]/g, '');
                      const parts = sanitized.split('.');
                      if (parts.length > 2) return;
                      if (parts.length > 1 && parts[1].length > 3) {
                        setQuantity(`${parts[0]}.${parts[1].substring(0, 3)}`);
                      } else {
                        setQuantity(sanitized);
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.halfWidth]}>
                  <Text style={styles.label}>💰 Birim Fiyat</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Fiyat girin"
                    placeholderTextColor={COLORS.mediumGray}
                    value={unitPrice}
                    inputAccessoryViewID={INPUT_ACC_VIEW_ID}
                    onChangeText={(text) => {
                      const sanitized = text.replace(/[^0-9.]/g, '');
                      const parts = sanitized.split('.');
                      if (parts.length > 2) return;
                      if (parts.length > 1 && parts[1].length > 3) {
                        setUnitPrice(`${parts[0]}.${parts[1].substring(0, 3)}`);
                      } else {
                        setUnitPrice(sanitized);
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}

            {/* Anlık Fiyat Butonu - Input'ların altında */}
            {mainCategory !== 'Nakit' && assetName.trim() && selectedAssetInfo && (
              <TouchableOpacity
                onPress={handleFetchLivePrice}
                disabled={isFetchingPrice}
                style={styles.livePriceButtonCompact}
              >
                {isFetchingPrice ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.livePriceButtonCompactText}>Fiyat alınıyor...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.livePriceButtonCompactIcon}>📊</Text>
                    <Text style={styles.livePriceButtonCompactText}>Anlık Fiyatı Çek</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Para Birimi (Nakit ise gizle) */}
          {mainCategory !== 'Nakit' && (
            <View style={styles.section}>
              <Text style={styles.label}>💵 Para Birimi</Text>
              <View style={styles.currencyButtons}>
                {['TRY', 'USD', 'EUR'].map((curr) => (
                  <CurrencyButton
                    key={curr}
                    currency={curr}
                    isActive={currency === curr}
                    onPress={() => setCurrency(curr)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Not - Optimize edilmiş */}
          <View style={styles.section}>
            <Text style={styles.label}>📝 Not (Opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.textAreaCompact]}
              placeholder="Detay ekle..."
              placeholderTextColor={COLORS.mediumGray}
              value={note}
              inputAccessoryViewID={INPUT_ACC_VIEW_ID}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
              maxLength={100}
              autoCorrect={true}
              autoCapitalize="sentences"
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>


          {/* Sabit butonların arkasında kalmaması için boşluk */}
          {/* Placeholder so content doesn't get hidden behind the footer/accessory */}
          <View style={{ height: 56 + (insets.bottom || 0) + 24 }} />
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Fixed Action Buttons - iOS: InputAccessoryView (keyboard docked), Android/others: animated absolute footer */}
      {Platform.OS === 'ios' ? (

        <InputAccessoryView nativeID={INPUT_ACC_VIEW_ID}>
          <View style={[styles.fixedButtonContainerIOS]}>
            <View style={styles.actionButtonsRow}>
              {isEditMode ? (
                <ActionButton
                  label={`${editingTransaction.type === 'buy' ? 'Alış' : 'Satış'} İşlemini Güncelle`}
                  variant={editingTransaction.type === 'buy' ? 'success' : 'danger'}
                  onPress={() => handleSubmit(editingTransaction.type)}
                />
              ) : (
                (() => {
                  const quantityNum = parseFloat(quantity);
                  const priceNum = parseFloat(unitPrice);
                  const total = (!isNaN(quantityNum) && !isNaN(priceNum)) ? (quantityNum * priceNum) : null;
                  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
                  const totalLabel = total ? `${currencySymbol}${total.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null;

                  const quickValid = !!mainCategory && !!assetName.trim() && quantityNum > 0 && priceNum > 0;

                  // Calculate holdings for sell validation
                  let totalOwned = 0;
                  const transactions = activePortfolio?.transactions || [];
                  const assetKey = `${mainCategory}_${assetName.trim()}`;
                  transactions.forEach(transaction => {
                    const txAssetKey = `${transaction.mainCategory}_${transaction.assetName}`;
                    if (txAssetKey === assetKey) {
                      if (transaction.type === 'buy') totalOwned += transaction.quantity;
                      else if (transaction.type === 'sell') totalOwned -= transaction.quantity;
                    }
                  });

                  const sellQuantity = parseFloat(quantity) || 0;
                  const sellDisabled = !quickValid || sellQuantity > totalOwned;

                  return (
                    <View style={[styles.actionButtonsGroup, styles.actionButtonsGroupHeight]}>
                      <ActionButton
                        label="  Alış"
                        variant="success"
                        onPress={handleBuy}
                        disabled={!quickValid}
                        subtitle={totalLabel}
                        subtitleAlign="pill"
                        leftIcon={<BuyIcon color={COLORS.white} />}
                        textStyle={{ fontSize: 16 }}
                        style={{ borderRadius: 0, height: '100%', paddingVertical: 0 }}
                      />
                      <ActionButton
                        label="  Satış"
                        variant="danger"
                        onPress={handleSell}
                        disabled={sellDisabled}
                        subtitle={totalLabel}
                        subtitleAlign="pill"
                        leftIcon={<SellIcon color={COLORS.white} />}
                        textStyle={{ fontSize: 16 }}
                        style={{ borderRadius: 0, height: '100%', paddingVertical: 0 }}
                      />
                    </View>
                  );
                })()
              )}
            </View>
          </View>
        </InputAccessoryView>
      ) : (
        <View style={styles.fixedButtonContainer}>
          <View style={styles.actionButtonsRow}>
            {isEditMode ? (
              <ActionButton
                label={`${editingTransaction.type === 'buy' ? 'Alış' : 'Satış'} İşlemini Güncelle`}
                variant={editingTransaction.type === 'buy' ? 'success' : 'danger'}
                onPress={() => handleSubmit(editingTransaction.type)}
              />
            ) : (
              (() => {
                const quantityNum = parseFloat(quantity);
                const priceNum = parseFloat(unitPrice);
                const total = (!isNaN(quantityNum) && !isNaN(priceNum)) ? (quantityNum * priceNum) : null;
                const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
                const totalLabel = total ? `${currencySymbol}${total.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null;

                const quickValid = !!mainCategory && !!assetName.trim() && quantityNum > 0 && priceNum > 0;

                // Calculate holdings for sell validation
                let totalOwned = 0;
                const transactions = activePortfolio?.transactions || [];
                const assetKey = `${mainCategory}_${assetName.trim()}`;
                transactions.forEach(transaction => {
                  const txAssetKey = `${transaction.mainCategory}_${transaction.assetName}`;
                  if (txAssetKey === assetKey) {
                    if (transaction.type === 'buy') totalOwned += transaction.quantity;
                    else if (transaction.type === 'sell') totalOwned -= transaction.quantity;
                  }
                });

                const sellQuantity = parseFloat(quantity) || 0;
                const sellDisabled = !quickValid || sellQuantity > totalOwned;

                return (
                  <View style={[styles.actionButtonsGroup, styles.actionButtonsGroupHeight]}>
                    <ActionButton
                      label="  Alış"
                      variant="success"
                      onPress={handleBuy}
                      disabled={!quickValid}
                      subtitle={totalLabel}
                      subtitleAlign="pill"
                      leftIcon={<BuyIcon color={COLORS.white} />}
                      textStyle={{ fontSize: 16 }}
                      style={{ borderRadius: 0, height: '100%', paddingVertical: 0 }}
                    />
                    <ActionButton
                      label="  Satış"
                      variant="danger"
                      onPress={handleSell}
                      disabled={sellDisabled}
                      subtitle={totalLabel}
                      subtitleAlign="pill"
                      leftIcon={<SellIcon color={COLORS.white} />}
                      textStyle={{ fontSize: 16 }}
                      style={{ borderRadius: 0, height: '100%', paddingVertical: 0 }}
                    />
                  </View>
                );
              })()
            )}
          </View>
        </View>
      )}

      {/* Toast Notification */}
      {toastVisible && (

        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }],
              opacity: toastAnim
            }
          ]}
        >
          <View style={[
            styles.toast,
            toastType === 'success' ? styles.toastSuccess : styles.toastError
          ]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )
      }

      {/* Alt Kategori Oluşturma Modal */}
      <Modal
        visible={showSubCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditingSubCategory ? 'Alt Kategori Düzenle' : 'Yeni Alt Kategori'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSubCategoryModal(false);
                  // düzenleme modunu kapat
                  setIsEditingSubCategory(false);
                  setEditingSubCategoryId(null);
                }}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Ana Kategori Göster */}
            {mainCategory && (
              <View style={styles.modalInfoBox}>
                <Text style={styles.modalInfoLabel}>Ana Kategori</Text>
                <Text style={styles.modalInfoValue}>
                  {mainCategory === 'Altın' && '🥇 Altın'}
                  {mainCategory === 'Döviz' && '💵 Döviz'}
                  {mainCategory === 'Kripto' && '₿ Kripto'}
                  {mainCategory === 'Borsa' && '📈 Borsa'}
                </Text>
              </View>
            )}

            {/* Kategori Adı */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Kategori Adı</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Örn: Emlak, Teknoloji, Bireysel..."
                placeholderTextColor={COLORS.mediumGray}
                value={newSubCategoryName}
                onChangeText={setNewSubCategoryName}
                maxLength={30}
              />
            </View>

            {/* Emoji Seçimi */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>İkon</Text>
              <View style={styles.emojiGrid}>
                {COMMON_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      newSubCategoryIcon === emoji && styles.emojiButtonActive
                    ]}
                    onPress={() => setNewSubCategoryIcon(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Renk Seçimi */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Renk</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorScroll}
              >
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      newSubCategoryColor === color && styles.colorButtonActive
                    ]}
                    onPress={() => setNewSubCategoryColor(color)}
                  >
                    {newSubCategoryColor === color && (
                      <Text style={styles.colorCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowSubCategoryModal(false);
                  setNewSubCategoryName('');
                  setNewSubCategoryIcon('📁');
                  setNewSubCategoryColor('#3B82F6');
                  setIsEditingSubCategory(false);
                  setEditingSubCategoryId(null);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={isEditingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory}
                disabled={isCreatingSubCategory}
              >
                {isCreatingSubCategory ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalButtonTextCreate}>{isEditingSubCategory ? 'Güncelle' : 'Oluştur'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alt kategori işlem menüsü - şık bottom sheet tarzı */}
      <Modal
        visible={showSubCategoryMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSubCategoryMenu}
      >
        <TouchableWithoutFeedback onPress={handleCloseSubCategoryMenu}>
          <View style={styles.menuBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.menuContainer} pointerEvents="box-none">
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>{activeSubCategoryForMenu?.icon} {activeSubCategoryForMenu?.name}</Text>
            {!menuConfirmDelete ? (
              <>
                <TouchableOpacity style={styles.menuButton} onPress={handleMenuEdit}>
                  <Text style={styles.menuButtonText}>Düzenle</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuButton, styles.menuButtonDestructive]} onPress={handleMenuInitiateDelete}>
                  <Text style={[styles.menuButtonText, styles.menuButtonTextDestructive]}>Sil</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={handleCloseSubCategoryMenu}>
                  <Text style={styles.menuButtonText}>Kapat</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.menuDangerText}>Bu alt kategoriyi silmek istediğinize emin misiniz? İşlem geri alınamaz.</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setMenuConfirmDelete(false)}>
                    <Text style={styles.modalButtonTextCancel}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonCreate]} onPress={handleMenuConfirmDelete}>
                    <Text style={styles.modalButtonTextCreate}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    padding: 16
  },
  menuCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  menuButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F3F4F6'
  },
  menuButtonText: {
    fontSize: 15,
    color: '#111827'
  },
  menuButtonDestructive: {
    backgroundColor: '#fff0f0'
  },
  menuButtonTextDestructive: {
    color: '#b91c1c',
    fontWeight: '700'
  },
  menuDangerText: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 4
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.darkBlue,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkBlue,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 0,
    paddingTop: 0,
    borderTopWidth: 0,
    borderTopColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  fixedButtonContainerIOS: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    padding: SCREEN_WIDTH * 0.05, // Responsive padding (%5 of screen width)
    paddingBottom: SCREEN_HEIGHT * 0.18, // Responsive bottom padding (%18 of screen height)
  },
  section: {
    marginBottom: SCREEN_HEIGHT * 0.022, // Responsive margin
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  actionButtonsGroupHeight: {
    height: 58,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  subCategoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  subCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  subCategoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subCategoryChipText: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  subCategoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  assetScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textAreaCompact: {
    height: SCREEN_HEIGHT * 0.08, // Responsive height (%8 of screen height)
    textAlignVertical: 'top',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  totalContainer: {
    backgroundColor: COLORS.white,
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  totalLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: COLORS.mediumGray,
    fontWeight: '600',
    marginBottom: 6,
  },
  totalHint: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: COLORS.mediumGray,
    fontWeight: '400',
  },
  totalValue: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '800',
    color: COLORS.darkBlue,
  },
  totalValueCurrency: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontWeight: '700',
    color: COLORS.darkBlue,
    opacity: 0.8,
    marginRight: 6,
  },
  totalValueNumber: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '800',
    color: COLORS.darkBlue,
  },
  // Dropdown Styles
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mediumGray,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownItemContent: {
    flexDirection: 'column',
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  dropdownItemSymbol: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  // Live Price Compact Button (input'ların altında)
  livePriceButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  livePriceButtonCompactIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  livePriceButtonCompactText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Temizle butonu için container ve stiller
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  inputWithClear: {
    paddingRight: 45, // X butonu için sağda boşluk
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: COLORS.mediumGray,
    fontWeight: '400',
    lineHeight: 20,
  },
  // Toast notification
  toastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingBottom: 80, // Tab bar'ın üstünde
  },
  toast: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: COLORS.success, // Yeşil arka plan
  },
  toastError: {
    backgroundColor: COLORS.danger, // Kırmızı arka plan
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  // Alt Kategori Seçim Stilleri
  subCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  subCategoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subCategoryChipNew: {
    backgroundColor: '#F0F4FF',
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  subCategoryChipText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  subCategoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  subCategoryChipTextNew: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.mediumGray,
    fontWeight: '600',
  },
  modalInfoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.darkGray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  createSubCategoryLink: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  createSubCategoryLinkText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  createSubCategoryButton: {
    marginLeft: 'auto',
    borderRadius: 999,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  createSubCategoryButtonText: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  emojiText: {
    fontSize: 24,
  },
  colorScroll: {
    flexGrow: 0,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.darkGray,
  },
  colorCheckmark: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonCreate: {
    backgroundColor: COLORS.primary,
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  modalButtonTextCreate: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
