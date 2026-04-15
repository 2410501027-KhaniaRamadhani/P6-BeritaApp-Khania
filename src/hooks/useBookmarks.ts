import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types';

const BOOKMARKS_KEY = '@news_app_bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Gagal memuat bookmark:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(async (article: Article) => {
    setBookmarks(prev => {
      const isExist = prev.some(b => b.url === article.url);
      let newBookmarks;
      
      if (isExist) {
        newBookmarks = prev.filter(b => b.url !== article.url);
      } else {
        newBookmarks = [article, ...prev];
      }
      
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const isBookmarked = useCallback((url: string) => {
    return bookmarks.some(b => b.url === url);
  }, [bookmarks]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return { bookmarks, loading, toggleBookmark, isBookmarked, loadBookmarks };
};