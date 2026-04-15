import React, { useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { ShareButton } from '../components/ShareButton';
import { useTheme } from '../context/ThemeContext';
import { Article, Category } from '../types';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Umum', value: 'general' },
  { label: 'Teknologi', value: 'technology' },
  { label: 'Olahraga', value: 'sports' },
  { label: 'Bisnis', value: 'business' },
  { label: 'Kesehatan', value: 'health' },
];

const NewsCard = ({ article, onPress, onBookmark, isBookmarked }: {
  article: Article;
  onPress: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, { backgroundColor: colors.surface }]}>
      {article.urlToImage ? (
        <Image source={{ uri: article.urlToImage }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.noImage, { backgroundColor: colors.border }]}>
          <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sourceText, { color: colors.success }]} numberOfLines={1}>
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
        
        <View style={styles.cardFooter}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {new Date(article.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CategoryPill = ({ label, value, isSelected, onPress }: {
  label: string;
  value: Category;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryPill,
        { backgroundColor: isSelected ? colors.primary : colors.border },
      ]}
    >
      <Text style={[
        styles.categoryText,
        { color: isSelected ? '#ffffff' : colors.textSecondary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [category, setCategory] = useState<Category>('general');
  const { colors, isDark, setTheme, theme } = useTheme();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNews(category);

  const articles = useMemo(() => data?.pages.flatMap(p => p.articles) ?? [], [data]);

  const handleBookmark = useCallback((article: Article) => {
    toggleBookmark(article);
  }, [toggleBookmark]);

  const renderItem = useCallback(({ item }: { item: Article }) => (
    <NewsCard
      article={item}
      onPress={() => console.log('Navigasi ke detail:', item.url)}
      onBookmark={() => handleBookmark(item)}
      isBookmarked={isBookmarked(item.url)}
    />
  ), [isBookmarked, handleBookmark]);

  const toggleDarkMode = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme(isDark ? 'light' : 'dark');
  };

  if (isLoading && articles.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Memuat berita...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error?.message || 'Terjadi kesalahan'}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📰 BeritaApp</Text>
        <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeButton}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <CategoryPill
            label={item.label}
            value={item.value}
            isSelected={category === item.value}
            onPress={() => setCategory(item.value)}
          />
        )}
        contentContainerStyle={styles.categoryList}
      />

      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} color={colors.primary} /> : null}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  darkModeButton: {
    padding: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 30,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
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