import React from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarks } from '../hooks/useBookmarks';
import { ShareButton } from '../components/ShareButton';
import { useTheme } from '../context/ThemeContext';
import { Article } from '../types';

const BookmarkCard = ({ article, onPress }: { article: Article; onPress: () => void }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, { backgroundColor: colors.surface }]}>
      {article.urlToImage ? (
        <Image source={{ uri: article.urlToImage }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.noImage, { backgroundColor: colors.border }]}>
          <Ionicons name="image-outline" size={30} color={colors.textMuted} />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sourceText, { color: colors.success }]} numberOfLines={1}>
            {article.source?.name || 'Sumber tidak diketahui'}
          </Text>
          <ShareButton title={article.title} url={article.url} description={article.description} />
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

export default function BookmarksScreen() {
  const { colors, isDark } = useTheme();
  const { bookmarks, loading, loadBookmarks } = useBookmarks();

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Memuat bookmark...</Text>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>📌 Bookmark Saya</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Belum ada bookmark</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Tekan icon bookmark di artikel untuk menyimpan
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📌 Bookmark Saya</Text>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>{bookmarks.length} artikel</Text>
      </View>

      <FlatList
        data={bookmarks}
        renderItem={({ item }) => (
          <BookmarkCard
            article={item}
            onPress={() => console.log('Navigasi ke detail:', item.url)}
          />
        )}
        keyExtractor={(item) => item.url}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadBookmarks} tintColor={colors.primary} />
        }
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
  headerCount: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  dateText: {
    fontSize: 10,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});