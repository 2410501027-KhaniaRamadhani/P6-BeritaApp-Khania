import React, { useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNewsSearch } from '../hooks/useNewsSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import { ShareButton } from '../components/ShareButton';
import { FilterModal } from '../components/FilterModal';
import { useTheme } from '../context/ThemeContext';
import { Article } from '../types';

const SearchResultCard = ({ article, onPress, onBookmark, isBookmarked }: {
  article: Article;
  onPress: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sourceText, { color: colors.success }]}>
            {article.source?.name || 'Sumber tidak diketahui'}
          </Text>
          <View style={styles.cardActions}>
            <ShareButton title={article.title} url={article.url} description={article.description} />
            <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? colors.warning : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {article.description || 'Tap untuk membaca selengkapnya...'}
        </Text>
        <Text style={[styles.dateText, { color: colors.textMuted }]}>
          {new Date(article.publishedAt).toLocaleDateString('id-ID')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterSource, setFilterSource] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  
  const { colors } = useTheme();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { data, isLoading, isError, error, refetch } = useNewsSearch(
    searchQuery, 
    filterSource, 
    filterFromDate, 
    filterToDate
  );

  const articles = data?.articles || [];

  const handleApplyFilter = (filters: { source: string; fromDate: string; toDate: string }) => {
    setFilterSource(filters.source);
    setFilterFromDate(filters.fromDate);
    setFilterToDate(filters.toDate);
  };

  const hasActiveFilter = filterSource !== '' || filterFromDate !== '' || filterToDate !== '';

  const clearFilters = () => {
    setFilterSource('');
    setFilterFromDate('');
    setFilterToDate('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>🔍 Cari Berita</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cari berita... (minimal 3 huruf)"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={[styles.filterButtonText, { color: colors.primary }]}>Filter</Text>
        </TouchableOpacity>
        
        {hasActiveFilter && (
          <TouchableOpacity
            style={[styles.clearFilterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={clearFilters}
          >
            <Ionicons name="close-circle" size={16} color={colors.error} />
            <Text style={[styles.clearFilterText, { color: colors.error }]}>Hapus Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>Mencari berita...</Text>
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error?.message || 'Terjadi kesalahan'}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && searchQuery.length >= 3 && articles.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tidak ada berita untuk "{searchQuery}"</Text>
        </View>
      )}

      {!isLoading && !isError && searchQuery.length < 3 && searchQuery.length > 0 && (
        <View style={styles.center}>
          <Ionicons name="information-circle-outline" size={48} color={colors.warning} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>Minimal 3 huruf untuk mencari</Text>
        </View>
      )}

      {!isLoading && !isError && searchQuery.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>Ketik kata kunci untuk mencari berita</Text>
        </View>
      )}

      {!isLoading && !isError && searchQuery.length >= 3 && articles.length > 0 && (
        <FlatList
          data={articles}
          renderItem={({ item }) => (
            <SearchResultCard
              article={item}
              onPress={() => console.log('Navigasi ke detail:', item.url)}
              onBookmark={() => toggleBookmark(item)}
              isBookmarked={isBookmarked(item.url)}
            />
          )}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    borderRadius: 30,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    gap: 6,
  },
  clearFilterText: {
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 11,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});