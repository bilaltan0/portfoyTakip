import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { ChevronDown, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';

const PortfolioSelector = () => {
  const {
    portfolios,
    activePortfolioId,
    activePortfolio,
    setActivePortfolioId,
    createPortfolio,
    deletePortfolio,
    renamePortfolio,
  } = usePortfolio();

  const [modalVisible, setModalVisible] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleSelectPortfolio = (portfolioId) => {
    setActivePortfolioId(portfolioId);
    setModalVisible(false);
  };

  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) {
      Alert.alert('Hata', 'Lütfen portföy adı girin');
      return;
    }

    createPortfolio(newPortfolioName);
    setNewPortfolioName('');
    setShowCreateInput(false);
    setModalVisible(false);
  };

  const handleDeletePortfolio = (portfolioId) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (portfolios.length <= 1) {
      Alert.alert('Uyarı', 'En az bir portföy bulunmalıdır');
      return;
    }

    const transactionCount = portfolio?.transactions?.length || 0;
    const message = transactionCount > 0
      ? `${portfolio.name} portföyünde ${transactionCount} işlem var. Silmek istediğinize emin misiniz?`
      : `${portfolio.name} portföyünü silmek istediğinize emin misiniz?`;

    Alert.alert(
      'Portföy Sil',
      message,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deletePortfolio(portfolioId),
        },
      ]
    );
  };

  const handleStartEdit = (portfolio) => {
    setEditingId(portfolio.id);
    setEditingName(portfolio.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      Alert.alert('Hata', 'Portföy adı boş olamaz');
      return;
    }

    renamePortfolio(editingId, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <>
      {/* Portfolio Selector Button */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText} numberOfLines={1}>
          {activePortfolio?.name || 'Portföy Seç'}
        </Text>
        <ChevronDown size={18} color={COLORS.darkBlue} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Portfolio Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setShowCreateInput(false);
          setEditingId(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setShowCreateInput(false);
            setEditingId(null);
          }}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Portföy Seç</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setShowCreateInput(false);
                  setEditingId(null);
                }}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.portfolioList}>
              {/* Portfolio List */}
              {portfolios.map((portfolio) => {
                const isActive = portfolio.id === activePortfolioId;
                const isEditing = editingId === portfolio.id;

                return (
                  <View key={portfolio.id} style={styles.portfolioItem}>
                    {isEditing ? (
                      // Edit Mode
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editingName}
                          onChangeText={setEditingName}
                          autoFocus
                          placeholder="Portföy adı"
                          placeholderTextColor={COLORS.gray}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.editButton, styles.saveButton]}
                            onPress={handleSaveEdit}
                          >
                            <Text style={styles.editButtonText}>Kaydet</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editButton, styles.cancelButton]}
                            onPress={handleCancelEdit}
                          >
                            <Text style={styles.editButtonText}>İptal</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // Normal Mode
                      <>
                        <TouchableOpacity
                          style={[
                            styles.portfolioButton,
                            isActive && styles.portfolioButtonActive,
                          ]}
                          onPress={() => handleSelectPortfolio(portfolio.id)}
                        >
                          <View>
                            <Text
                              style={[
                                styles.portfolioName,
                                isActive && styles.portfolioNameActive,
                              ]}
                            >
                              {portfolio.name}
                            </Text>
                            <Text style={styles.transactionCount}>
                              {portfolio.transactions.length} işlem
                            </Text>
                          </View>
                          {isActive && (
                            <View style={styles.activeBadge}>
                              <Text style={styles.activeBadgeText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>

                        {/* Actions */}
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleStartEdit(portfolio)}
                          >
                            <Edit2 size={18} color={COLORS.gray} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeletePortfolio(portfolio.id)}
                          >
                            <Trash2 size={18} color={COLORS.danger} />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}

              {/* Create New Portfolio */}
              {showCreateInput ? (
                <View style={styles.createInputContainer}>
                  <TextInput
                    style={styles.createInput}
                    value={newPortfolioName}
                    onChangeText={setNewPortfolioName}
                    placeholder="Yeni portföy adı"
                    placeholderTextColor={COLORS.gray}
                    autoFocus
                  />
                  <View style={styles.createActions}>
                    <TouchableOpacity
                      style={[styles.createButton, styles.createButtonSave]}
                      onPress={handleCreatePortfolio}
                    >
                      <Text style={styles.createButtonText}>Oluştur</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.createButton, styles.createButtonCancel]}
                      onPress={() => {
                        setShowCreateInput(false);
                        setNewPortfolioName('');
                      }}
                    >
                      <Text style={styles.createButtonText}>İptal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowCreateInput(true)}
                >
                  <Plus size={20} color={COLORS.primary} />
                  <Text style={styles.addButtonText}>Yeni Portföy Oluştur</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Selector Button
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 140,
    maxWidth: 180,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkBlue,
    marginRight: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.dark,
  },

  // Portfolio List
  portfolioList: {
    maxHeight: 400,
  },
  portfolioItem: {
    marginBottom: 12,
  },
  portfolioButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  portfolioButtonActive: {
    backgroundColor: COLORS.lightPrimary,
    borderColor: COLORS.primary,
  },
  portfolioName: {
    ...FONTS.h4,
    color: COLORS.dark,
    marginBottom: 4,
  },
  portfolioNameActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  transactionCount: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },

  // Edit Mode
  editContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  editInput: {
    ...FONTS.h4,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  editButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },

  // Create New
  createInputContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  createInput: {
    ...FONTS.h4,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  createActions: {
    flexDirection: 'row',
    gap: 8,
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonSave: {
    backgroundColor: COLORS.primary,
  },
  createButtonCancel: {
    backgroundColor: COLORS.gray,
  },
  createButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonText: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginLeft: 8,
  },
});

export default PortfolioSelector;
