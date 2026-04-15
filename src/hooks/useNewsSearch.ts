import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsService } from '../services/newsService';

export const useNewsSearch = (query: string, source?: string, fromDate?: string, toDate?: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce 500ms sesuai tugas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ['search', debouncedQuery, source, fromDate, toDate],
    queryFn: () => newsService.searchArticlesWithFilters(debouncedQuery, 1, source, fromDate, toDate),
    enabled: debouncedQuery.length >= 3,
    staleTime: 2 * 60 * 1000,
  });
};