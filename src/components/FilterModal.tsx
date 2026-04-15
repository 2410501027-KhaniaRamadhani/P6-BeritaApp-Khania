import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { newsService } from '../services/newsService';
import { Source } from '../types';
import { useTheme } from '../context/ThemeContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { source: string; fromDate: string; toDate: string }) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const { colors, isDark } = useTheme();
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [selectedSource, setSelectedSource] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSources();
    }
  }, [visible]);

  const loadSources = async () => {
    setLoadingSources(true);
    try {
      const data = await newsService.getSources();
      setSources(data);
    } catch (error) {
      console.error('Gagal memuat sumber:', error);
    } finally {
      setLoadingSources(false);
    }
  };

  const handleApply = () => {
    onApply({
      source: selectedSource,
      fromDate: startDate.toISOString().split('T')[0],
      toDate: endDate.toISOString().split('T')[0],
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedSource('');
    setStartDate(new Date());
    setEndDate(new Date());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Pencarian</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Pilih Sumber Berita */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sumber Berita</Text>
          {loadingSources ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ id: 'all', name: 'Semua Sumber' }, ...sources]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sourceButton,
                    { backgroundColor: colors.border },
                    selectedSource === item.id && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedSource(item.id)}
                >
                  <Text
                    style={[
                      styles.sourceButtonText,
                      { color: colors.textSecondary },
                      selectedSource === item.id && { color: '#ffffff' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.sourcesList}
            />
          )}

          {/* Pilih Rentang Tanggal */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rentang Tanggal</Text>
          
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              Dari: {startDate.toLocaleDateString('id-ID')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              Sampai: {endDate.toLocaleDateString('id-ID')}
            </Text>
          </TouchableOpacity>

          {/* Tombol Aksi */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.resetButton, { borderColor: colors.border }]}
            >
              <Text style={{ color: colors.textSecondary }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyButtonText}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  sourcesList: {
    paddingRight: 16,
  },
  sourceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 10,
  },
  sourceButtonText: {
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  dateButtonText: {
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});